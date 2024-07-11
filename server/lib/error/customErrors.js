const mylogger = require('../logger/logger.js');
//const { Neo4jError } = require('neo4j-driver');
const logger = mylogger.child({'module':'customErrors.js'});
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// You can create more specific error classes if needed
class ValidationError extends AppError {
  constructor(error) {
    const errors = error.details.map(detail => detail.message)
    console.log(JSON.stringify(error))
    super(errors, 400);
    this.name = 'ValidationError';
  }
}

class DatabaseError extends AppError {
  constructor(message) {
    super(message, 500);
    this.name = 'DatabaseError';
  }

}

class Neo4jError extends AppError {
  constructor(message, status){
    super(message,status);
    this.name = 'Neo4jError';
  }
}
const catchAsync = (fn) => {
const log = logger.child({'function':'catchAsync'});
log.trace();
  return (req, res, next) => {
    //log.debug('catchAsync: Before calling function');
    Promise.resolve(fn(req, res, next)).catch(error => {
      //log.error('catchAsync: Caught an error:', error);
      if (res.headersSent) {
        log.debug('catchAsync: Headers already sent');
        return next(error);
      }
      next(error);
    });
  };
};

module.exports = { AppError, ValidationError, DatabaseError, Neo4jError, catchAsync};