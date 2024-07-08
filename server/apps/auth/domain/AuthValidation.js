/**
 * 
 * @file AuthValidation.js
 * @module AuthValidation
 * @description A microservice for data validation for authentication
 */

const joi = require('joi');
const {ValidationError} = require('../../../lib/error/customErrors.js');

const loginSchema = joi.object().keys({
    username : joi.string().required(),
    password : joi.string().required(),
})

const userUUIDSchema = joi.object({
    USER_UUID: joi.string().uuid().required()
  }).unknown(true); 
const nodeUUIDSchema = joi.object({
    NODE_UUID: joi.string().uuid().required()
  }).unknown(true); 

async function login(req,res,next){
    
    try{
        joi.assert(req.body, loginSchema)
    } catch (error) {
        throw new ValidationError(error)
    }
    if (typeof next === 'function') {
        next();
      }
    
}

async function assertUserUUIDInBody(req, res, next) {
    try {
      const { error, value } = userUUIDSchema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details[0].message);
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
        throw new ValidationError(error.details[0].message);
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
module.exports = {login, assertUserUUIDInBody, assertNodeUUIDInBody}