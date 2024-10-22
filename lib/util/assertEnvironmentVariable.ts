import dotenv from 'dotenv';
import applogger from '../logger/applogger';
import { AppError } from '../error/customErrors';
dotenv.config();
export const assertEnvironmentVariable = (variable:any, name:string, cb=()=>{}):void => {
    if (!variable) {
        throw new AppError(`Environment Variable Error:  ${name} is empty or does not exist in environment variables`, 500);
    }
    cb()
}

export default assertEnvironmentVariable