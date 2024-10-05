"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_1 = __importDefault(require("passport"));
const customErrors_1 = require("../../../../../lib/error/customErrors");
const models_1 = require("../../../../db/neo4j/models/models");
const applogger_1 = __importDefault(require("../../../../../lib/logger/applogger"));
const logger = applogger_1.default.child({ 'module': 'GoogleStrategy' });
const { v7: uuidv7 } = require('uuid');
if (!process.env.GOOGLE_CLIENT_ID) {
    throw new customErrors_1.AppError('GOOGLE_CLIENT_ID does not exist in environment variables', 500);
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new customErrors_1.AppError('GOOGLE_CLIENT_SECRET does not exist in environment variables', 500);
}
if (!process.env.GOOGLE_CALLBACK_URL) {
    throw new customErrors_1.AppError('GOOGLE_CALLBACK_URL does not exist in environment variables', 500);
}
exports.default = passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
}, async (accessToken, refreshToken, profile, done) => {
    const log = logger.child({ 'function': 'passport.useGoogleStrategy' });
    log.trace('');
    try {
        if (!profile.emails) {
            logger.error('no email found');
            throw new Error("No email found");
        }
        let user = await models_1.models.USER.findOne({ where: { email: profile.emails[0]?.value } });
        logger.info(user);
        if (!user) {
            logger.info('creating user');
            user = await models_1.models.USER.createOne({
                uuid: uuidv7(),
                email: profile.emails[0].value,
                username: profile.displayName,
            });
            await user.createSharenode();
        }
        else {
            logger.info('user found');
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
}));
//# sourceMappingURL=GoogleStrategy.js.map