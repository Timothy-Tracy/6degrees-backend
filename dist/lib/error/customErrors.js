"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.AuthorizationError = exports.Neo4jError = exports.DatabaseError = exports.ValidationError = exports.AppError = void 0;
const applogger_1 = __importDefault(require("../logger/applogger"));
//const { Neo4jError } = require('neo4j-driver');
const logger = applogger_1.default.child({ 'module': 'customErrors' });
class AppError extends Error {
    constructor(message, statusCode, error) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.error = error || null;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// You can create more specific error classes if needed
class AuthorizationError extends AppError {
    constructor(obj) {
        super(obj.message || 'UnknownAuthorizationError', obj.statusCode || 401, obj.error || null);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class ValidationError extends AppError {
    constructor(obj) {
        super(obj.message || "", obj.statusCode || 400, obj.error || null);
        this.name = 'InputValidationError';
    }
}
exports.ValidationError = ValidationError;
class DatabaseError extends AppError {
    constructor(obj) {
        super(obj.message || '', obj.statusCode || 500, obj.error || null);
        this.name = 'DatabaseError';
    }
}
exports.DatabaseError = DatabaseError;
class Neo4jError extends AppError {
    constructor(message, status) {
        super(message, status);
        this.name = 'Neo4jError';
    }
}
exports.Neo4jError = Neo4jError;
const catchAsync = (fn) => {
    const log = logger.child({ 'function': 'catchAsync' });
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            log.trace('catchAsync caught an error');
            if (res.headersSent) {
                log.debug('catchAsync: Headers already sent');
                return next(error);
            }
            next(error);
        });
    };
};
exports.catchAsync = catchAsync;
//# sourceMappingURL=customErrors.js.map