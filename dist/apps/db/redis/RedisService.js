"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = require("redis");
const customErrors_1 = require("../../../lib/error/customErrors");
const connect_redis_1 = __importDefault(require("connect-redis"));
const applogger_1 = __importDefault(require("../../../lib/logger/applogger"));
dotenv_1.default.config();
const logger = applogger_1.default.child({ 'module': 'RedisService' });
class RedisService {
    constructor() {
        this.initClient = () => {
            try {
                this.client = (0, redis_1.createClient)({
                    url: this.url,
                });
            }
            catch (error) {
                logger.error(`${process.env.REDIS_URL} : Connection failed `);
                throw new customErrors_1.AppError("RedisService Error: Error initializing client", 500, error);
            }
            logger.info(`RedisService: ${process.env.REDIS_URL} : Connection established `);
        };
        this.connectClient = () => {
            this.client.connect().catch((err) => { throw new customErrors_1.AppError("RedisService Error: Redis connection error ", 500, err); });
            this.client.on('connect', () => logger.info("RedisService: Connected to Redis"));
        };
        this.initStore = () => {
            try {
                this.store = new connect_redis_1.default({ client: this.client });
            }
            catch (error) {
                logger.error("RedisService - RedisStore: connection failed");
                throw error;
            }
            logger.info("RedisService - RedisStore: connection established");
        };
        logger.info('RedisService: Initializing RedisService');
        if (!process.env.REDIS_URL) {
            logger.error('RedisService Error: No Redis Url Provided, REDIS_URL is empty or does not exist in environment');
            throw new customErrors_1.AppError('RedisService Error: No Redis Url Provided, REDIS_URL is empty or does not exist in environment', 500);
        }
        else {
            this.url = process.env.REDIS_URL;
            logger.info(`RedisService: ${process.env.REDIS_URL} : Connection URL initialized `);
        }
        this.initClient();
        this.connectClient();
        this.initStore();
    }
}
const redisService = new RedisService();
exports.default = redisService;
//# sourceMappingURL=RedisService.js.map