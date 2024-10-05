"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const applogger_1 = __importDefault(require("../../../../../lib/logger/applogger"));
const logger = applogger_1.default.child({ 'module': 'AuthStrategy' });
const models_1 = require("../../../../db/neo4j/models/models");
passport_1.default.serializeUser((user, done) => {
    const log = logger.child({ 'function': 'serializeUser' });
    log.trace('');
    try {
        let log = logger.child({ module: "AuthStrategy", function: "serializeUser" });
        log.trace("serializeUser");
        console.log("serializeUser", user);
        done(null, user.uuid);
    }
    catch (error) {
        done(error, null);
    }
});
passport_1.default.deserializeUser((uuid, done) => {
    const log = logger.child({ 'function': 'deserializeUser' });
    log.trace('');
    let user = models_1.models.USER.findOne({ where: { uuid: uuid } }).then((user) => {
        if (!user) {
            throw new Error("User not found");
        }
        return done(null, user);
    }).catch((error) => {
        console.log("Error deserializing user", error);
        return done(error, null);
    });
});
exports.default = passport_1.default.use(new passport_local_1.Strategy({ "usernameField": "email" }, async (email, password, done) => {
    let log = logger.child({ module: "AuthStrategy" });
    log.trace("LocalStrategy");
    let user = models_1.models.USER.findOne({ where: { email: email } }).then((user) => {
        if (!user) {
            throw new Error("User not found");
        }
        //    let passwordMatch = await AuthService.comparePassword(password, user.password);
        //    if (!passwordMatch) {
        //        console.log("Invalid password");
        //        throw new Error("Invalid password");
        //    }
        return done(null, user);
    }).catch((error) => {
        console.log("Error deserializing user", error);
        return done(error);
    });
}));
//# sourceMappingURL=AuthStrategy.js.map