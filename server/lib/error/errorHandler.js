const { AppError, DatabaseError ,Neo4jError, ValidationError} = require('./customErrors');
const mylogger = require('../logger/logger.js');
//const { Neo4jError } = require('neo4j-driver');
const logger = mylogger.child({'module':'errorHandler.js'});
const globalErrorHandler = (err, req, res, next) => {
  const log = logger.child({'function':'globalErrorHandler'});
  log.info('Entering globalErrorHandler');

  // Ensure these properties exist
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  log.debug(`Error details: ${JSON.stringify(err)}`);

  let error = { ...err };
  error.message = err.message;

  log.debug(`Processing error of type: ${error.name}`);

  // Process specific error types
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'InputValidationError') error = handleInputValidationError(error);
  //if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (error.name === 'Neo4jError') error = handleNeo4jError(error);

  // Log the processed error
  log.debug(`Processed error: ${JSON.stringify(error)}`);

  // Determine the environment
  const isProduction = process.env.NODE_ENV === 'production';
  log.debug(`Current environment: ${isProduction ? 'production' : 'development'}`);

  // Send the error response
  if (!isProduction) {
    log.debug('Sending development error response');
    sendErrorDev(error, res);
  } else {
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
}

const sendErrorDev = (err, res) => {
  const log = logger.child({'function':'sendErrorDev'});
  log.error({
    name: err.name || 'UnknownError',
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  }, `${err.name} - ${err.statusCode} - ${err.message}`);
  
  res.status(err.statusCode).json({
    name: err.name || 'UnknownError',
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  const log = logger.child({'function':'sendErrorProd'});
  log.info('called')
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};



const handleNeo4jError = (error) => {
  if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
    console.log('uuuuuu')
    return new Neo4jError('A unique constraint was violated', 409);
  }
  if (error.code === 'Neo.ClientError.Security.Unauthorized') {
    return new Neo4jError('Authentication failed', 401);
  }
  if (error.code === 'Neo.ClientError.Statement.SyntaxError') {
    return new Neo4jError('Invalid query syntax', 400);
  }
  // Generic database error
  return new DatabaseError('Database error');
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleInputValidationError = err => {
  console.log('hiiiii')
  return new ValidationError(err);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

module.exports = {globalErrorHandler, handleNeo4jError};