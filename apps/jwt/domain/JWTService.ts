import { AppError} from "../../../lib/error/customErrors";
import applogger from "../../../lib/logger/applogger";
import dotenv from 'dotenv';
import Jwt from 'jsonwebtoken';
const logger = applogger.child({'module':'JWTService'});
dotenv.config();

export default class JWTService {
    static signToken = (uuid: string) => {
        const log = logger.child({'function': 'signToken'})
        log.trace({uuid});
        return Jwt.sign({ uuid }, process.env.JWT_SECRET!, {
            expiresIn: process.env.JWT_EXPIRATION
        });
    }

    static verifyToken = (token: string) => {
        const log = logger.child({'function': 'verifyToken'})
        log.trace({token});
        return Jwt.verify(token, process.env.JWT_SECRET!);
    }


    static decodeToken = (token: string) => {
        const log = logger.child({'function': 'decodeToken'})
        log.trace({token});
        return Jwt.decode(token);
    }


    static validateToken = (token: string) => {
        const log = logger.child({'function': 'validateToken'})
        log.trace({token});
        try {
            Jwt.verify(token, process.env.JWT_SECRET!);
        } catch (error) {
            log.error('validateToken: Error:', error);
            throw new AppError('Invalid token', 401, error);
        }
    }

}





