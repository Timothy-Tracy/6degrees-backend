"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customErrors_1 = require("./customErrors");
const applogger_1 = __importDefault(require("../logger/applogger"));
//const { Neo4jError } = require('neo4j-driver');
const logger = applogger_1.default.child({ 'module': 'errorHandler.js' });
const globalErrorHandler = (err, req, res, next) => {
    const log = logger.child({ 'function': 'globalErrorHandler' });
    log.info('Entering globalErrorHandler');
    log.debug(err);
    // Ensure these properties exist
    err.name = err.name || "UnknownError";
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    log.debug(`Error details: ${JSON.stringify(err)}`);
    let error = { ...err };
    console.log(error);
    error.message = err.message;
    log.debug(`Processing error of type: ${error.name}`);
    // Process specific error types
    if (error.name === 'CastError')
        error = handleCastErrorDB(error);
    if (error.code === 11000)
        error = handleDuplicateFieldsDB(error);
    if (error.name === 'InputValidationError')
        error = handleInputValidationError(error);
    if (error.name === 'ValidationError')
        error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError')
        error = handleJWTError();
    if (error.name === 'TokenExpiredError')
        error = handleJWTExpiredError();
    if (error.name === 'Neo4jError')
        error = handleNeo4jError(error);
    // Log the processed error
    log.debug(`Processed error: ${JSON.stringify(error)}`);
    // Determine the environment
    const isProduction = process.env.NODE_ENV === 'production';
    log.debug(`Current environment: ${isProduction ? 'production' : 'development'}`);
    // Send the error response
    if (!isProduction) {
        log.debug('Sending development error response');
        sendErrorDev(error, res);
    }
    else {
        log.debug('Sending production error response');
        sendErrorProd(error, res);
    }
    //log.info('Exiting globalErrorHandler');
};
const sendError = (err, res) => {
    res.status(err.statusCode).json({
        name: err.name || 'UnknownError',
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};
const sendErrorDev = (err, res) => {
    const log = logger.child({ 'function': 'sendErrorDev' });
    log.trace();
    log.error({
        'error': {
            name: err.name || 'UnknownError',
            status: err.status,
            statusCode: err.statusCode,
            error: err,
            message: err.message,
            stack: err.stack
        }
    }, `${err.name} - ${err.statusCode} - ${err.message}`);
    res.status(err.statusCode).json({
        'error': err
    });
};
const sendErrorProd = (err, res) => {
    const log = logger.child({ 'function': 'sendErrorProd' });
    log.info('called');
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    else {
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};
const handleNeo4jError = (error) => {
    if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
        console.log('uuuuuu');
        return new customErrors_1.Neo4jError('A unique constraint was violated', 409);
    }
    if (error.code === 'Neo.ClientError.Security.Unauthorized') {
        return new customErrors_1.Neo4jError('Authentication failed', 401);
    }
    if (error.code === 'Neo.ClientError.Statement.SyntaxError') {
        return new customErrors_1.Neo4jError('Invalid query syntax', 400);
    }
    // Generic database error
    return new customErrors_1.DatabaseError('Database error');
};
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new customErrors_1.AppError(message, 400);
};
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new customErrors_1.AppError(message, 400);
};
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new customErrors_1.AppError(message, 400);
};
const handleInputValidationError = err => {
    let error = err;
    const log = logger.child({ 'function': 'handleInputValidationError' });
    log.trace();
    //process the raw error
    log.warn(error.error);
    const errors = error.error.details.map(detail => { return { 'path': detail.path, 'type': detail.type, 'message': detail.message }; });
    error.error = errors;
    return error;
};
const handleJWTError = () => new customErrors_1.AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new customErrors_1.AppError('Your token has expired! Please log in again.', 401);
module.exports = { globalErrorHandler, handleNeo4jError };
//# sourceMappingURL=errorHandler.js.map