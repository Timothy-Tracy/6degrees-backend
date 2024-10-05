import { createClient } from 'redis';
import { AppError } from '../../../../lib/error/customErrors';
import connectRedis from 'connect-redis';


class RedisService {
    client:any
    url:string
    store:any
    
    constructor(){
        if (!process.env.REDIS_URL){
            throw new AppError('RedisService Error: No Redis Url Provided, REDIS_URL is empty or does not exist in environment', 500)
        } else {
            this.url = process.env.REDIS_URL
        }
    }
    initClient =()=>{
        try{
            this.client = createClient(
                {
                  url: this.url,
                }
              );
        } catch (error) {
            throw new AppError("RedisService Error: Error initializing client", 500, error)
        }
    }
    connectClient = () => {
        this.client.connect().catch((err: any) => {throw new AppError("Redis connection error ", 500, err)});
        this.client.on('connect', () => console.log("Connected to Redis"));
    }
    initStore = () => {
        this.store = new connectRedis({client:this.client});
    }

}

const redisService = new RedisService()
redisService.initClient()
redisService.connectClient()
redisService.initStore()

export default redisService




