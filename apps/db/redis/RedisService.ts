import dotenv from 'dotenv';

import { createClient } from 'redis';
import { AppError } from '../../../lib/error/customErrors';
import connectRedis from 'connect-redis';
import applogger from '../../../lib/logger/applogger';
dotenv.config();
const logger = applogger.child({'module':'RedisService'})

class RedisService {
    client:any
    url:string
    store:connectRedis
    
    constructor(){
        logger.info('RedisService: Initializing RedisService')
        if (!process.env.REDIS_URL){
            logger.error('RedisService Error: No Redis Url Provided, REDIS_URL is empty or does not exist in environment')
            throw new AppError('RedisService Error: No Redis Url Provided, REDIS_URL is empty or does not exist in environment', 500)
        } else {
            this.url = process.env.REDIS_URL
            logger.info(`RedisService: ${process.env.REDIS_URL} : Connection URL initialized `)
        }
        this.initClient()
        this.connectClient()
        this.initStore()
    }
    initClient =()=>{
        try{
            this.client = createClient(
                {
                  url: this.url,
                }
              );
        } catch (error) {
            logger.error(`${process.env.REDIS_URL} : Connection failed `)

            throw new AppError("RedisService Error: Error initializing client", 500, error)
        }
        logger.info(`RedisService: ${process.env.REDIS_URL} : Connection established `)

    }
    connectClient = () => {
        this.client.connect().catch((err: any) => {throw new AppError("RedisService Error: Redis connection error ", 500, err)});
        this.client.on('connect', () => logger.info("RedisService: Connected to Redis"));
    }
    initStore = () => {
        try{
            this.store = new connectRedis({client:this.client});

        } catch(error){
            logger.error("RedisService - RedisStore: connection failed")
            throw error
        }
        logger.info("RedisService - RedisStore: connection established")
    }
    
}

const redisService = new RedisService()

export default redisService




