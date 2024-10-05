"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const applogger_1 = __importDefault(require("../../../../lib/logger/applogger"));
const customErrors_1 = require("../../../../lib/error/customErrors");
const logger = applogger_1.default.child({ 'module': 'AuthMiddleware' });
const models_1 = require("../../../db/neo4j/models/models");
class AuthMiddleware {
    static async requireAuthSession(req, res, next) {
        if (!req.isAuthenticated()) {
            throw new customErrors_1.AppError('Authentication is required', 401);
        }
        if (!req.user.uuid) {
            throw new customErrors_1.AppError('No user data via authentication', 401);
        }
        res.locals.user = await models_1.models.USER.findOne({ where: { uuid: req.user.uuid } });
        if (res.locals.user == null) {
            throw new customErrors_1.AppError('Error initializing res.locals.user', 401);
        }
        next();
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=AuthMiddleware.js.map