"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customErrors_1 = require("../../../../lib/error/customErrors");
const applogger_1 = __importDefault(require("../../../../lib/logger/applogger"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger = applogger_1.default.child({ 'module': 'JWTService' });
dotenv_1.default.config();
class JWTService {
}
JWTService.signToken = (uuid) => {
    const log = logger.child({ 'function': 'signToken' });
    log.trace({ uuid });
    return jsonwebtoken_1.default.sign({ uuid }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    });
};
JWTService.verifyToken = (token) => {
    const log = logger.child({ 'function': 'verifyToken' });
    log.trace({ token });
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
};
JWTService.decodeToken = (token) => {
    const log = logger.child({ 'function': 'decodeToken' });
    log.trace({ token });
    return jsonwebtoken_1.default.decode(token);
};
JWTService.validateToken = (token) => {
    const log = logger.child({ 'function': 'validateToken' });
    log.trace({ token });
    try {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        log.error('validateToken: Error:', error);
        throw new customErrors_1.AppError('Invalid token', 401, error);
    }
};
exports.default = JWTService;
//# sourceMappingURL=JWTService.js.map