import dotenv from 'dotenv';
import { createClient, RedisClientType } from 'redis';
import { AppError } from '../../../lib/error/customErrors';
import connectRedis from 'connect-redis';
import applogger from '../../../lib/logger/applogger';
import assertEnvironmentVariable from '../../../lib/util/assertEnvironmentVariable';

dotenv.config();
const logger = applogger.child({ 'module': 'RedisService' });

class RedisService {
    private client: RedisClientType ;
    private url: string ;
    public store: connectRedis;
    private static instance: RedisService;

    private constructor() {
        logger.info('RedisService: Initializing RedisService');
        this.validateEnvironment();
        this.initClient();
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

            if (process.env.NODE_ENV === 'production' ) {
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
                    // password: process.env.REDIS_PASSWORD,
                    url: process.env.REDIS_URL
                    // socket: {
                    //     host: process.env.REDIS_HOST,
                    //     port: parseInt(process.env.REDIS_PORT || '6379', 10),
                    //     tls: true,
                    // },
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
                prefix: "myapp:",
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
}

export default RedisService.getInstance();