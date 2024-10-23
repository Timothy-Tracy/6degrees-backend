import { NextFunction, Request, Response } from "express";
// command to initiate prisma 

import applogger from "../../../lib/logger/applogger";
import { AppError, AuthorizationError } from "../../../lib/error/customErrors";
const logger = applogger.child({'module':'AuthMiddleware'})
import passport from "passport";
import { Strategy } from "passport-local";
import { models } from "../../db/neo4j/models/models";
import redisService from "../../db/redis/RedisService";

export class AuthMiddleware{

    static async requireAuthSession(req: any, res: any, next:NextFunction) {
        const log = logger.child({'function': 'requireAuthSession'})
        if(!req.isAuthenticated()){
            log.info('FAILED')
            throw new AppError('Authentication is required', 401)
        }
        if(!req.user.uuid){
            throw new AppError('No user data via authentication', 401)
        }    
        next()
    }

    static async initUserObject(req: any, res: any, next:NextFunction) {
        const log = logger.child({'function': 'initializeUserObject'})
        res.locals.user = await models.USER.findOne({where:{uuid: req.user.uuid}})

        if(!res.locals.user || !res.locals.user.uuid){
            log.error('FAILED')
            throw new AuthorizationError({
                message: 'res.locals.user initialization failed!',
                statusCode: 500
            })
        }
        log.info(`PASSED, initialized res.locals.user, user=${res.locals.user.username}`)
        next()
    }

    static async requireAdmin(req: any, res: any, next:NextFunction) {
        const log = logger.child({'function': 'requireAuthSession'})

        if(!res.locals.user || !res.locals.user.uuid){
            log.error('FAILED')
            throw new AuthorizationError({
                message: 'res.locals.user initialization failed!',
                statusCode: 500
            })
        }

        if(!res.locals.user.role || res.locals.user.role != 'ADMIN'){
            log.error('FAILED, ADMIN=false, res.locals.user is not ADMIN failed!')
            throw new AuthorizationError({
                message: 'FAILED, ADMIN=false, res.locals.user is not ADMIN failed!',
                statusCode: 500
            })
        }
        log.info('PASSED, ADMIN=true, res.locals.user is ADMIN',)
        next()
    }
}