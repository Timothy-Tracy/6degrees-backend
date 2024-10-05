import { NextFunction, Request, Response } from "express";
// command to initiate prisma 
import bcrypt from "bcrypt";
import applogger from "../../../../lib/logger/applogger";
import JWTService from "../../../jwt/v2/domain/JWTService";
import { AppError } from "../../../../lib/error/customErrors";
import { error } from "console";
const logger = applogger.child({'module':'AuthMiddleware'})
import passport from "passport";
import { Strategy } from "passport-local";
import { models } from "../../../db/neo4j/models/models";
import redisService from "../../../db/redis/RedisService";

export class AuthMiddleware{

    static async requireAuthSession(req: any, res: any, next:NextFunction) {
        
        if(!req.isAuthenticated()){
            throw new AppError('Authentication is required', 401)
        }
        if(!req.user.uuid){
            throw new AppError('No user data via authentication', 401)
        }
        
        
        res.locals.user = await models.USER.findOne({where:{uuid: req.user.uuid}})
        if(res.locals.user == null){
            throw new AppError('Error initializing res.locals.user', 401)
        }
        next()
    }
}