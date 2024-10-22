import { AppError, DatabaseError ,Neo4jError, ValidationError} from './customErrors';
import applogger from '../logger/applogger';
import { NextFunction } from 'express';
//const { Neo4jError } = require('neo4j-driver');
const logger = applogger.child({'module':'errorHandler.js'});
export const globalErrorHandler = (err:any, req:any, res:any, next:NextFunction) => {
  const log = logger.child({'function':'globalErrorHandler'});
  log.info('Entering globalErrorHandler');
  log.debug(err)
  // Ensure these properties exist
  err.name = err.name || "UnknownError";
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  log.debug(`Error details: ${JSON.stringify(err)}`);

  let error = { ...err };
  console.log(error)
  error.message = err.message;

  log.debug(`Processing error of type: ${error.name}`);

  // Process specific error types


  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
 

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
const sendError = (err:any, res:any) => {
  res.status(err.statusCode).json({
    name: err.name || 'UnknownError',
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}

const sendErrorDev = (err:any, res:any) => {
  const log = logger.child({'function':'sendErrorDev'});
  log.trace('');
  log.error({
    'error' : {
      name: err.name || 'UnknownError',
      status: err.status,
      statusCode: err.statusCode,

      error: err,
      message: err.message,
      stack: err.stack
    }
    
  }, `${err.name} - ${err.statusCode} - ${err.message}`);
  
  res.status(err.statusCode).json({
    'error' : err
    
  });
};

const sendErrorProd = (err:any, res:any) => {
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




const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

