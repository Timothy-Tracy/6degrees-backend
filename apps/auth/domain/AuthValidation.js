/**
 * 
 * @file AuthValidation.js
 * @module AuthValidation
 * @description A microservice for data validation for authentication
 */

const joi = require('joi');
const {usernameSchema,passwordSchema} = require('../../users/domain/UserValidation.js');
const {ValidationError} = require('../../../lib/error/customErrors.js');
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'AuthValidation' });


//add passWordSchema for strict password rules
const loginSchema = joi.object().keys({
    username : usernameSchema,
    email : joi.string().email(),
    password : joi.string().required(),
}).or('username','email').strict()

const userUUIDSchema = joi.object({
    USER_UUID: joi.string().uuid().required()
  }).unknown(true); 
const nodeUUIDSchema = joi.object({
    NODE_UUID: joi.string().uuid().required()
  }).unknown(true); 

async function validateLoginInput(req,res,next){
    const log = logger.child({'function':'validateLoginInput'});
    log.trace();


    const {error, value} = loginSchema.validate(req.body,
      {
          abortEarly:false,
          stripUnknown: true
      }
  );
  if (error){
      throw new ValidationError({'error': error});
  }

  res.locals.loginObj = value;
  if (typeof next === 'function') {
    next();
  }
    
}

async function assertUserUUIDInBody(req, res, next) {
    try {
      const { error, value } = userUUIDSchema.validate(req.body);
      if (error) {
        throw new ValidationError({'error': error});
      }
      // Optionally, you can assign the validated value back to req.body
      // req.body = value;
    } catch (error) {
      throw error
    }
    if (typeof next === 'function') {
        next();
      }
  }
async function assertNodeUUIDInBody(req, res, next) {
    try {
      const { error, value } = nodeUUIDSchema.validate(req.body);
      if (error) {
        throw new ValidationError({'error': error});
      }
      // Optionally, you can assign the validated value back to req.body
      // req.body = value;
    } catch (error) {
      throw error
    }
    if (typeof next === 'function') {
        next();
      }
  }
module.exports = {validateLoginInput, assertUserUUIDInBody, assertNodeUUIDInBody}