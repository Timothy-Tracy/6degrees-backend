import dotenv from 'dotenv';
import { createClient, RedisClientType } from 'redis';
import { AppError } from '../../../lib/error/customErrors';
import connectRedis from 'connect-redis';
import applogger from '../../../lib/logger/applogger';
import assertEnvironmentVariable from '../../../lib/util/assertEnvironmentVariable';
import { promisify } from 'util';

dotenv.config();
const logger = applogger.child({ 'module': 'RedisService' });

class RedisService {
    private client: RedisClientType;
    private url: string;
    public store: connectRedis;
    private static instance: RedisService;

    private constructor() {
        logger.info('RedisService: Initializing RedisService');
        this.validateEnvironment();
        this.initClient();
        this.initStore()
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    private validateEnvironment(): void {
        if (!process.env.REDIS_URL) {
            logger.error('RedisService Error: No Redis URL provided, REDIS_URL is empty or does not exist in environment');
            throw new AppError('RedisService Error: No Redis URL provided', 500);
        }
        this.url = process.env.REDIS_URL;
        logger.info(`RedisService: ${this.url} : Connection URL initialized`);
    }

    private initClient(): void {
        try {
            const options = {
                url: this.url,
                socket: {
                    reconnectStrategy: (retries: number) => {
                        if (retries > 10) {
                            logger.error('RedisService: Max reconnection attempts reached');
                            return new Error('Max reconnection attempts reached');
                        }
                        return Math.min(retries * 100, 3000);
                    },
                },
            };
            assertEnvironmentVariable(process.env.NODE_ENV, "NODE_ENV")

            if (process.env.NODE_ENV === 'production') {
                logger.info('Environment = production')
                assertEnvironmentVariable(process.env.PROD_REDIS_PASSWORD, "PROD_REDIS_PASSWORD")
                assertEnvironmentVariable(process.env.PROD_REDIS_HOST, "PROD_REDIS_HOST")
                assertEnvironmentVariable(process.env.PROD_REDIS_PORT, "PROD_REDIS_PORT")

                Object.assign(options, {
                    password: process.env.PROD_REDIS_PASSWORD,
                    socket: {
                        host: process.env.PROD_REDIS_HOST,
                        port: parseInt(process.env.PROD_REDIS_PORT || '6379', 10),
                        tls: true,
                    },
                });
            } else {
                logger.info('Environment = development')
                assertEnvironmentVariable(process.env.REDIS_URL, "REDIS_URL")

                Object.assign(options, {
                    url: process.env.REDIS_URL
                });
            }

            this.client = createClient(options);

            this.client.on('error', (err) => logger.error('RedisService Error:', err));
            this.client.on('reconnecting', () => logger.info('RedisService: Reconnecting to Redis'));
            this.client.on('ready', () => logger.info('RedisService: Redis is ready'));

            this.connectWithRetry();
        } catch (error) {
            logger.error(`RedisService Error: Failed to initialize client for ${this.url}`);
            throw new AppError("RedisService Error: Error initializing client", 500, error);
        }
    }

    private async connectWithRetry(retries = 5, timeout = 30000): Promise<void> {
        const start = Date.now();
        let currentRetry = 0;

        while (currentRetry < retries) {
            try {
                await this.connectWithTimeout(timeout - (Date.now() - start));
                logger.info("RedisService: Connected to Redis");
                this.initStore();
                return;
            } catch (error) {
                currentRetry++;
                if (currentRetry >= retries || Date.now() - start >= timeout) {
                    logger.error("RedisService Error: Failed to connect after multiple attempts");
                    throw new AppError("RedisService Error: Connection timeout", 500, error);
                }
                const delay = Math.min(100 * Math.pow(2, currentRetry), 3000);
                logger.warn(`RedisService: Connection attempt ${currentRetry} failed. Retrying in ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    private connectWithTimeout(timeout: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Connection attempt timed out'));
            }, timeout);

            this.client.connect()
                .then(() => {
                    clearTimeout(timer);
                    resolve();
                })
                .catch((error) => {
                    clearTimeout(timer);
                    reject(error);
                });
        });
    }

    private initStore(): void {
        try {
            this.store = new connectRedis({
                client: this.client,
                prefix: "6degrees:",
            });
            logger.info("RedisService - RedisStore: Connection established");
        } catch (error) {
            logger.error("RedisService - RedisStore: Connection failed");
            throw new AppError("RedisService Error: Failed to initialize Redis store", 500, error);
        }
    }

    public async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            logger.error(`RedisService Error: Failed to get key ${key}`, error);
            throw new AppError(`RedisService Error: Failed to get key ${key}`, 500, error);
        }
    }

    public async set(key: string, value: string, ttl?: number): Promise<void> {
        try {
            if (ttl) {
                await this.client.set(key, value, { EX: ttl });
            } else {
                await this.client.set(key, value);
            }
        } catch (error) {
            logger.error(`RedisService Error: Failed to set key ${key}`, error);
            throw new AppError(`RedisService Error: Failed to set key ${key}`, 500, error);
        }
    }

    public async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            logger.error(`RedisService Error: Failed to delete key ${key}`, error);
            throw new AppError(`RedisService Error: Failed to delete key ${key}`, 500, error);
        }
    }

    public async quit(): Promise<void> {
        try {
            await this.client.quit();
            logger.info("RedisService: Disconnected from Redis");
        } catch (error) {
            logger.error("RedisService Error: Failed to disconnect from Redis", error);
            throw new AppError("RedisService Error: Failed to disconnect from Redis", 500, error);
        }
    }

    // New debugging methods

    /**
     * Checks the connection status of the Redis client.
     * @returns {Promise<boolean>} True if connected, false otherwise.
     */
    public async checkConnection(): Promise<boolean> {
        try {
            await this.client.ping();
            logger.info('RedisService: Connection check successful');
            return true;
        } catch (error) {
            logger.error('RedisService: Connection check failed', error);
            return false;
        }
    }

    /**
     * Retrieves connection details of the Redis client.
     * @returns {Object} An object containing connection details.
     */
    public getConnectionInfo(): Object {
        return {
            url: this.url,
            options: this.client.options,
            isReady: this.client.isReady,
            isOpen: this.client.isOpen
        };
    }

    /**
     * Retrieves statistics about the Redis server.
     * @returns {Promise<Object>} An object containing Redis server statistics.
     */
    public async getServerStats(): Promise<Object> {
        try {
            const info = await this.client.info();
            logger.info('RedisService: Retrieved server stats');
            return this.parseRedisInfo(info);
        } catch (error) {
            logger.error('RedisService: Failed to retrieve server stats', error);
            throw new AppError('RedisService Error: Failed to retrieve server stats', 500, error);
        }
    }

    /**
     * Parses the Redis INFO command output into a structured object.
     * @param {string} info - The raw output from Redis INFO command.
     * @returns {Object} A structured object of Redis server information.
     */
    private parseRedisInfo(info: string): Object {
        const lines = info.split('\r\n');
        const result: {[key: string]: any} = {};
        let currentSection = '';

        lines.forEach(line => {
            if (line.startsWith('#')) {
                currentSection = line.substring(1).trim().toLowerCase();
                result[currentSection] = {};
            } else if (line.includes(':')) {
                const [key, value] = line.split(':');
                result[currentSection][key] = value;
            }
        });

        return result;
    }

    /**
     * Retrieves the memory usage of a specific key.
     * @param {string} key - The key to check for memory usage.
     * @returns {Promise<number>} The memory usage in bytes.
     */
    public async getKeyMemoryUsage(key: string): Promise<number|null> {
        try {
            const usage = await this.client.memoryUsage(key);
            logger.info(`RedisService: Memory usage for key ${key}: ${usage} bytes`);
            return usage;
        } catch (error) {
            logger.error(`RedisService: Failed to get memory usage for key ${key}`, error);
            throw new AppError(`RedisService Error: Failed to get memory usage for key ${key}`, 500, error);
        }
    }

    /**
     * Retrieves all keys matching a pattern.
     * @param {string} pattern - The pattern to match keys against.
     * @returns {Promise<string[]>} An array of matching keys.
     */
    public async getKeys(pattern: string): Promise<string[]> {
        try {
            const keys = await this.client.keys(pattern);
            logger.info(`RedisService: Retrieved ${keys.length} keys matching pattern ${pattern}`);
            return keys;
        } catch (error) {
            logger.error(`RedisService: Failed to retrieve keys matching pattern ${pattern}`, error);
            throw new AppError(`RedisService Error: Failed to retrieve keys matching pattern ${pattern}`, 500, error);
        }
    }

    /**
     * Monitors Redis commands in real-time.
     * @param {number} duration - The duration to monitor in milliseconds.
     * @returns {Promise<string[]>} An array of monitored commands.
     */
    public async monitorCommands(duration: number): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const commands: string[] = [];
            const monitor = this.client.duplicate();

            monitor.on('monitor', (time, args) => {
                commands.push(`${time}: ${args.join(' ')}`);
            });

            monitor.monitor((err) => {
                if (err) {
                    logger.error('RedisService: Failed to start monitoring', err);
                    reject(new AppError('RedisService Error: Failed to start monitoring', 500, err));
                }

                logger.info(`RedisService: Started monitoring for ${duration}ms`);

                setTimeout(() => {
                    monitor.quit();
                    logger.info(`RedisService: Stopped monitoring after ${duration}ms`);
                    resolve(commands);
                }, duration);
            });
        });
    }


    

    /**
     * Retrieves a session from the Redis store.
     * @param {string} sessionId - The ID of the session to retrieve.
     * @returns {Promise<Object | null>} The session data if found, null otherwise.
     */
    public async getSession(sessionId: string): Promise<Object | null> {
        if (!this.isStoreInitialized()) {
            logger.error('RedisService: Store is not initialized');
            return null;
        }

        try {
            const getAsync = promisify(this.store.get).bind(this.store);
            const session = await getAsync(sessionId);
            logger.info(`RedisService: Retrieved session ${sessionId}`);
            return session;
        } catch (error) {
            logger.error(`RedisService: Failed to get session ${sessionId}`, error);
            return null;
        }
    }

    /**
     * Sets a session in the Redis store.
     * @param {string} sessionId - The ID of the session to set.
     * @param {Object} sessionData - The session data to store.
     * @returns {Promise<boolean>} True if successful, false otherwise.
     */
    public async setSession(sessionId: string, sessionData: Object): Promise<boolean> {
        if (!this.isStoreInitialized()) {
            logger.error('RedisService: Store is not initialized');
            return false;
        }

        try {
            const setAsync = promisify(this.store.set).bind(this.store);
            await setAsync(sessionId, sessionData);
            logger.info(`RedisService: Set session ${sessionId}`);
            return true;
        } catch (error) {
            logger.error(`RedisService: Failed to set session ${sessionId}`, error);
            return false;
        }
    }

    /**
     * Deletes a session from the Redis store.
     * @param {string} sessionId - The ID of the session to delete.
     * @returns {Promise<boolean>} True if successful, false otherwise.
     */
    public async deleteSession(sessionId: string): Promise<boolean> {
        if (!this.isStoreInitialized()) {
            logger.error('RedisService: Store is not initialized');
            return false;
        }

        try {
            const destroyAsync = promisify(this.store.destroy).bind(this.store);
            await destroyAsync(sessionId);
            logger.info(`RedisService: Deleted session ${sessionId}`);
            return true;
        } catch (error) {
            logger.error(`RedisService: Failed to delete session ${sessionId}`, error);
            return false;
        }
    }

    /**
     * Retrieves all session IDs from the Redis store.
     * @returns {Promise<string[]>} An array of session IDs.
     */
    public async getAllSessionIds(): Promise<string[]> {
        if (!this.isStoreInitialized()) {
            logger.error('RedisService: Store is not initialized');
            return [];
        }

        try {
            const allAsync = promisify(this.store.all).bind(this.store);
            const sessions = await allAsync();
            const sessionIds = Object.keys(sessions);
            logger.info(`RedisService: Retrieved ${sessionIds.length} session IDs`);
            return sessionIds;
        } catch (error) {
            logger.error('RedisService: Failed to retrieve all session IDs', error);
            return [];
        }
    }

    /**
     * Performs a detailed check of the store's initialization status.
     * @returns {Object} An object containing detailed information about the store's initialization status.
     */
    public detailedStoreInitCheck(): any {
        return {
            storeExists: !!this.store,
            storeGetMethod: typeof this.store?.get,
            storeSetMethod: typeof this.store?.set,
            storeDestroyMethod: typeof this.store?.destroy,
            storeAllMethod: typeof this.store?.all,
            storeClient: !!this.store?.client,
            storePrefix: this.store?.prefix,
        };
    }

    /**
     * Checks if the Redis store is properly initialized.
     * @returns {boolean} True if the store is initialized, false otherwise.
     */
    public isStoreInitialized(): boolean {
        const check = this.detailedStoreInitCheck();
        logger.info('RedisService: Detailed store initialization check', check);
        return check.storeExists && 
               check.storeGetMethod === 'function' && 
               check.storeSetMethod === 'function' &&
               check.storeDestroyMethod === 'function' &&
               check.storeAllMethod === 'function' &&
               !!check.storeClient;
    }

    /**
     * Performs a detailed health check of the Redis store.
     * @returns {Promise<Object>} An object containing detailed health check results.
     */
    public async detailedStoreHealthCheck(): Promise<any> {
        const initCheck = this.detailedStoreInitCheck();
        const health = {
            initializationDetails: initCheck,
            isInitialized: this.isStoreInitialized(),
            setOperation: { success: false, error: null },
            getOperation: { success: false, error: null },
            deleteOperation: { success: false, error: null },
            allOperation: { success: false, error: null },
            sessionCount: 0,
        };

        const testSessionId = `test-session-${Date.now()}`;
        const testSessionData = { test: 'data' };

        try {
            await this.setSession(testSessionId, testSessionData);
            health.setOperation.success = true;
        } catch (error:any) {
            health.setOperation.error = error.message;
        }

        try {
            const session = await this.getSession(testSessionId);
            health.getOperation.success = !!session;
        } catch (error) {
            health.getOperation.error = error.message;
        }

        try {
            await this.deleteSession(testSessionId);
            health.deleteOperation.success = true;
        } catch (error) {
            health.deleteOperation.error = error.message;
        }

        try {
            const sessions = await this.getAllSessionIds();
            health.allOperation.success = Array.isArray(sessions);
            health.sessionCount = sessions.length;
        } catch (error) {
            health.allOperation.error = error.message;
        }

        logger.info('RedisService: Detailed store health check completed', health);
        return health;
    }

    /**
     * Attempts to manually initialize the store.
     * @returns {boolean} True if initialization was successful, false otherwise.
     */
    public attemptStoreInitialization(): boolean {
        try {
            const RedisStore = new connectRedis({
                client: this.client,
                prefix: "6degrees:",
            });
            this.store = RedisStore;
            logger.info("RedisService: Manual store initialization attempt successful");
            return true;
        } catch (error) {
            logger.error("RedisService: Manual store initialization attempt failed", error);
            return false;
        }
    }
    

}

export default RedisService.getInstance();