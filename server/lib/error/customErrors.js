const mylogger = require('../logger/logger.js');
//const { Neo4jError } = require('neo4j-driver');
const logger = mylogger.child({'module':'customErrors.js'});
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

// You can create more specific error classes if needed
class AuthorizationError extends AppError {
  
  constructor(obj) {
    
    super(obj.message || 'UnknownAuthorizationError', obj.statusCode || 401, obj.error||null);
    this.name = 'AuthorizationError';
    
  }
}

class ValidationError extends AppError {
  constructor(obj) {
    
    super(obj.message || "", obj.statusCode || 400, obj.error||null);
    this.name = 'InputValidationError';
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

module.exports = { AppError, ValidationError, DatabaseError, Neo4jError, AuthorizationError, catchAsync};