"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// command to initiate prisma 
const bcrypt_1 = __importDefault(require("bcrypt"));
const applogger_1 = __importDefault(require("../../../../lib/logger/applogger"));
const JWTService_1 = __importDefault(require("../../../jwt/v2/domain/JWTService"));
const customErrors_1 = require("../../../../lib/error/customErrors");
const logger = applogger_1.default.child({ 'module': 'AuthService' });
const models_1 = require("../../../db/neo4j/models/models");
const comparePassword = async (password, hash) => {
    const log = logger.child({ 'function': "comparePassword" });
    log.trace("comparePassword");
    let match = await bcrypt_1.default.compare(password, hash);
    console.log("match", match);
    return match;
};
const checkUserExists = async (email, username) => {
    const log = logger.child({ 'function': "checkUserExists" });
    log.trace({ email, username });
    let user = await models_1.models.USER.findOne({ where: { email: email } });
    return user;
};
const login = async (req, res, next) => {
    const log = logger.child({ 'function': "login" });
    log.trace("login");
    let { email, password } = req.body;
    let user = await models_1.models.USER.findOne({ where: { email: email } });
    if (!user) {
        throw new customErrors_1.AppError("User not found", 404);
    }
    // let passwordMatch = await comparePassword(password, user.password);
    // if (!passwordMatch) {
    //     throw new AuthorizationError({ message: "Invalid password", statusCode: 401, error: null });
    // }
    let token = JWTService_1.default.signToken(user.uuid);
    res.locals.auth = token;
    next();
};
const register = async (req, res, next) => {
    const log = logger.child({ 'function': "register" });
    log.trace("register");
    let { email, password, username } = req.body;
    let userExists = await checkUserExists(email, username);
    if (userExists) {
        throw new customErrors_1.AppError("User already exists", 409, null);
    }
    // let hash = await bcrypt.hash(password, 12);
    // let user = await prisma.user.create({ data: { 
    //     username,
    //     email, 
    //     password: hash,
    //     updatedAt: new Date() } });
    let token = JWTService_1.default.signToken(user.id);
    res.locals.auth = token;
    res.locals.user = user;
    next();
};
exports.default = { login, register, comparePassword, checkUserExists };
//# sourceMappingURL=AuthService.js.map