import {Neogma } from 'neogma';
import dotenv from 'dotenv';
import { AppError } from '../../../../lib/error/customErrors';
import assertEnvironmentVariable from '../../../../lib/util/assertEnvironmentVariable';
dotenv.config();

if(!process.env.DB_URL){
    throw new AppError('DB_URL does not exist in environment variables', 500)
} 
if(!process.env.DB_USERNAME){
    throw new AppError('DB_USERNAME does not exist in environment variables', 500)
}

if(!process.env.DB_PASSWORD){
    throw new AppError('DB_PASSWORD does not exist in environment variables', 500)
}

if(!process.env.DB_DATABASE){
    throw new AppError('DB_DATABASE does not exist in environment variables', 500)
}
class NeogmaService {
    private static instance: NeogmaService;
    public neogma;
    constructor(){
        const e = new AppError('NeogmaService Error: environment variable undefined', 500)

        assertEnvironmentVariable(process.env.NODE_ENV, 'NODE_ENV')
        if(process.env.NODE_ENV == 'development'){
            assertEnvironmentVariable(process.env.DB_URL,"DB_URL")
            assertEnvironmentVariable(process.env.DB_USERNAME,"DB_USERNAME")
            assertEnvironmentVariable(process.env.DB_PASSWORD,"DB_PASSWORD")
            assertEnvironmentVariable(process.env.DB_DATABASE,"DB_DATABASE")
            if(process.env.DB_URL && process.env.DB_USERNAME && process.env.DB_PASSWORD && process.env.DB_DATABASE){
                this.neogma = new Neogma(
                    {
                        url: process.env.DB_URL,
                        username: process.env.DB_USERNAME,
                        password: process.env.DB_PASSWORD,
                        /* --> (optional) the database to be used by default for sessions */
                        database: process.env.DB_DATABASE,
                    },
                    {
                        /* --> (optional) logs every query that Neogma runs, using the given function */
                        logger: console.log, 
                        /* --> any driver configuration can be used */
                        encrypted: false,
                    }
                );
            } else {
                throw e
            }
            
        } else if (process.env.NODE_ENV == 'production'){
            assertEnvironmentVariable(process.env.PROD_DB_URL,"PROD_DB_URL")
            assertEnvironmentVariable(process.env.PROD_DB_USERNAME,"PROD_DB_USERNAME")
            assertEnvironmentVariable(process.env.PROD_DB_PASSWORD,"PROD_DB_PASSWORD")
            assertEnvironmentVariable(process.env.PROD_DB_DATABASE,"PROD_DB_DATABASE")

            if(process.env.PROD_DB_URL && process.env.PROD_DB_USERNAME && process.env.PROD_DB_PASSWORD && process.env.PROD_DB_DATABASE){
                this.neogma = new Neogma(
                    {
                        url: process.env.PROD_DB_URL,
                        username: process.env.PROD_DB_USERNAME,
                        password: process.env.PROD_DB_PASSWORD,
                        /* --> (optional) the database to be used by default for sessions */
                        database: process.env.PROD_DB_DATABASE,
                    },
                    {
                        /* --> (optional) logs every query that Neogma runs, using the given function */
                        logger: console.log, 
                        /* --> any driver configuration can be used */
                        
                    }
                );
            } else {
                throw e
            }
        } else {
            throw new AppError('NeogmaServieError: NODE_ENV not equal to production or development', 500)
        }
        
    }
    public static getInstance(): NeogmaService {
        if (!NeogmaService.instance) {
            NeogmaService.instance = new NeogmaService();
        }
        return NeogmaService.instance;
    }
}


export default NeogmaService.getInstance().neogma

