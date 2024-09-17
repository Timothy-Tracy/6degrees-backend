import applogger from '../logger/applogger'
//const { Neo4jError } = require('neo4j-driver');
const logger = applogger.child({'module':'customErrors'});
import { NextFunction, Request, Response} from 'express';
interface AppError {
    message: string;
    statusCode: number;
    details: any;
    error: any;
    status: string;
    isOperational: boolean;
}

interface ErrorObject {
    message?: string;
    statusCode?: number;
    error?: any;
}

class AppError extends Error {
  constructor(message:string, statusCode: number, error?: any) {
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
  
  constructor(obj: ErrorObject) {
    
    super(obj.message || 'UnknownAuthorizationError', obj.statusCode || 401, obj.error||null);
    this.name = 'AuthorizationError';
    
  }
}

class ValidationError extends AppError {
  constructor(obj: ErrorObject) {
    
    super(obj.message || "", obj.statusCode || 400, obj.error||null);
    this.name = 'InputValidationError';
  }
}

class DatabaseError extends AppError {
  constructor(obj: ErrorObject) {
    super(obj.message || '', obj.statusCode || 500, obj.error || null);
    this.name = 'DatabaseError';
  }

}

class Neo4jError extends AppError {
  constructor(message:string, status:any){
    super(message,status);
    this.name = 'Neo4jError';
  }
}
const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => void) => {
    const log = logger.child({'function':'catchAsync'});
      return (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch((error: any) => {
          log.trace('catchAsync caught an error');
          if (res.headersSent) {
            log.debug('catchAsync: Headers already sent');
            return next(error);
          }
          next(error);
        });
      };
    }

export { AppError, ValidationError, DatabaseError, Neo4jError, AuthorizationError, catchAsync};