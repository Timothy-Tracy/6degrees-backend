"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const customErrors_1 = require("../../../../lib/error/customErrors");
const connect_redis_1 = __importDefault(require("connect-redis"));
class RedisService {
    constructor() {
        this.initClient = () => {
            try {
                this.client = (0, redis_1.createClient)({
                    url: this.url,
                });
            }
            catch (error) {
                throw new customErrors_1.AppError("RedisService Error: Error initializing client", 500, error);
            }
        };
        this.connectClient = () => {
            this.client.connect().catch((err) => { throw new customErrors_1.AppError("Redis connection error ", 500, err); });
            this.client.on('connect', () => console.log("Connected to Redis"));
        };
        this.initStore = () => {
            this.store = new connect_redis_1.default({ client: this.client });
        };
        if (!process.env.REDIS_URL) {
            throw new customErrors_1.AppError('RedisService Error: No Redis Url Provided, REDIS_URL is empty or does not exist in environment', 500);
        }
        else {
            this.url = process.env.REDIS_URL;
        }
    }
}
const redisService = new RedisService();
redisService.initClient();
redisService.connectClient();
redisService.initStore();
exports.default = redisService;
//# sourceMappingURL=RedisService.js.map