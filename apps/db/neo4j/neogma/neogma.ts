import {Neogma } from 'neogma';
import dotenv from 'dotenv';
import { AppError } from '../../../../lib/error/customErrors';
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

const neogma = new Neogma(
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

export default neogma

