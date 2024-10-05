import { NextFunction, Request, Response } from "express";
// command to initiate prisma 
import bcrypt from "bcrypt";
import applogger from "../../../../lib/logger/applogger";
import JWTService from "../../../jwt/v2/domain/JWTService";
import { AppError } from "../../../../lib/error/customErrors";
import { error } from "console";
const logger = applogger.child({'module':'AuthService'})
import passport from "passport";
import { Strategy } from "passport-local";
import { models } from "../../../db/neo4j/models/models";



const comparePassword = async (password: string, hash: string) => {
    const log = logger.child({'function': "comparePassword" });
    log.trace("comparePassword");
    let match = await bcrypt.compare(password, hash);
    console.log("match", match);
    return match;
};

const checkUserExists = async (email: string, username: string) => {
    const log = logger.child({'function': "checkUserExists" });
    log.trace({email, username});
    let user = await models.USER.findOne({where:{email: email}})
    return user;
}





const login = async (req: Request, res: Response, next: NextFunction) => {
    const log = logger.child({'function': "login" });
    log.trace("login");
        let { email, password } = req.body;
        let user = await models.USER.findOne({where:{email: email}})
        if (!user) {
            throw new AppError("User not found", 404);
        }
        // let passwordMatch = await comparePassword(password, user.password);
        // if (!passwordMatch) {
        //     throw new AuthorizationError({ message: "Invalid password", statusCode: 401, error: null });
        // }
        let token = JWTService.signToken(user.uuid);
        res.locals.auth = token;
        next();
}

const register = async (req: Request, res: Response, next: NextFunction) => {
    const log = logger.child({'function': "register" });
    log.trace("register");
        let { email, password, username } = req.body;
        let userExists = await checkUserExists(email, username);
 
        if (userExists) {
            throw new AppError("User already exists", 409, null );
        }
        // let hash = await bcrypt.hash(password, 12);
        // let user = await prisma.user.create({ data: { 
        //     username,
        //     email, 
        //     password: hash,
        //     updatedAt: new Date() } });
        let token = JWTService.signToken(user.id);
        res.locals.auth = token;
        res.locals.user = user;
        next();
}


export default { login, register, comparePassword, checkUserExists };






