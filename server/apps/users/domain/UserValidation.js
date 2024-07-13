/**
 * 
 * @file UserValidation.js
 * @module UserValidation
 * @description A microservice for data validation for users
 */

const joi = require('joi');
const { ValidationError } = require('../../../lib/error/customErrors.js');
const { v7: uuidv7 } = require('uuid');

const loginSchema = joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().required(),
})
const uuidSchema = joi.string().forbidden().default(() => uuidv7());

const nameSchema =
    joi.string()
        .trim()  // This removes leading and trailing whitespace
        .pattern(/^[A-Za-zÀ-ÿ''-]+(?:\s[A-Za-zÀ-ÿ''-]+)*$/)
        .min(2)
        .max(50)
        .messages({
            'string.pattern.base': 'First/Last name contains invalid characters',
            'string.min': 'First/Last name must be at least 2 characters long',
            'string.max': 'First/Last name must not exceed 50 characters',
            'string.empty': 'First/Last name cannot be empty'
        })
    ;

const usernameSchema = joi.string()
    .trim()
    .pattern(/^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/)
    .min(3)
    .max(20)
    .messages({
        'string.pattern.base': 'username must start with a letter and can only contain letters, numbers, underscores, and hyphens',
        'string.min': 'username must be at least 3 characters long',
        'string.max': 'username cannot be longer than 20 characters',
        'any.required': 'username is required'
    });

const phoneSchema = joi.string()
    .replace(/[\(\)\s-]/g, '')  // Remove (, ), spaces, and -
    .pattern(/^\+?[0-9]{10,14}$/)  // Validate the cleaned number
    

const passwordSchema = joi.string()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long'
  });

const userSchema = joi.object().keys({
    USER_UUID: uuidSchema,
    USER_ROLE: joi.string().forbidden().default('USER'),
    username: joi.string().lowercase().token().required(),
    firstName: nameSchema.required(),
    lastName: nameSchema.required(),
    email: joi.string().email().required(),
    password: passwordSchema.required(),
    mobile: phoneSchema.required(),
    isAnonymous: joi.boolean()

}).strict()

const mutableUserData = joi.object().keys({
    email: joi.string().email(),
    username: usernameSchema,
    firstName: nameSchema,
    lastName: nameSchema,
    mobile: phoneSchema,
    
}).or('email', 'username', 'firstName', 'lastName', 'mobile').strict()

async function validateMutableUserInput(req,res,next) {
    const {error, value} = mutableUserData.validate(req.body,
        {
            abortEarly:false,
            stripUnknown: true
        }
    );
    if (error){
        throw new ValidationError({'error': error});
    }

    res.locals.data = value;
    next()


}

async function validateNewUserInput(req, res, next){
    
    const {error, value} = userSchema.validate(req.body,
        {
            abortEarly:false,
            stripUnknown: true
        }
    );
    if (error){
        throw new ValidationError({'error': error});
    }

    res.locals.newUserObj = value;
    next()
}

module.exports = { validateMutableUserInput, validateNewUserInput, usernameSchema, passwordSchema }