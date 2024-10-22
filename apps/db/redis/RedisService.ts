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
            let options;
            // const options = {
            //     url: this.url,
            //     socket: {
            //         reconnectStrategy: (retries: number) => {
            //             if (retries > 10) {
            //                 logger.error('RedisService: Max reconnection attempts reached');
            //                 return new Error('Max reconnection attempts reached');
            //             }
            //             return Math.min(retries * 100, 3000);
            //         },
            //     },
            // };
            assertEnvironmentVariable(process.env.NODE_ENV, "NODE_ENV")

            if (process.env.NODE_ENV === 'production') {
                logger.info('Environment = production')
                assertEnvironmentVariable(process.env.PROD_REDIS_PASSWORD, "PROD_REDIS_PASSWORD")
                assertEnvironmentVariable(process.env.PROD_REDIS_HOST, "PROD_REDIS_HOST")
                assertEnvironmentVariable(process.env.PROD_REDIS_PORT, "PROD_REDIS_PORT")
                console.log(process.env.PROD_REDIS_PASSWORD)
                console.log(process.env.PROD_REDIS_HOST)
                console.log(process.env.PROD_REDIS_PORT)
                //`redis[s]://[[username][:password]@][host][:port][/db-number]`
                this.client = createClient({
                    password: process.env.PROD_REDIS_PASSWORD,
                  
                    socket: {
                        host: process.env.PROD_REDIS_HOST,
                        port: parseInt(process.env.PROD_REDIS_PORT)
                        
                    },
                })
            } else {
                logger.info('Environment = development')
                assertEnvironmentVariable(process.env.REDIS_URL, "REDIS_URL")
                this.client = createClient({
                    url: process.env.REDIS_URL
                })
                
            }

            ;
            this.client.connect()
            this.initStore();
            this.client.on('error', (err) => console.log(err));
            this.client.on('reconnecting', () => logger.info('RedisService: Reconnecting to Redis'));
            this.client.on('ready', () => logger.info('RedisService: Redis is ready'));

            //this.connectWithRetry();
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