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

async function login(req,res,next){
    
    try{
        joi.assert(req.body, loginSchema)
    } catch (error) {
        throw new ValidationError(error)
    }
    next();
    
}

module.exports = {login}