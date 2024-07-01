/**
 * 
 * @file UserValidation.js
 * @module UserValidation
 * @description A microservice for data validation for users
 */

const joi = require('joi');
const {ValidationError} = require('../../../lib/error/customErrors.js');

const loginSchema = joi.object.keys({
    email : joi.string.email.required(),
    password : joi.string.password.required(),
})

const userSchema = joi.object.keys({
    USER_UUID: joi.string.required(),
    USER_ROLE: joi.string(),
    username: joi.string(),
    firstName : joi.string(),
    lastName : joi.string(),
    email : joi.string.email(),
    password: joi.string.password(),
    mobile: joi.string(),
    isAnonymous : joi.boolean()
    
})