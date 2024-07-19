/**
 * 
 * @file PostValidation.js
 * @module UserValidation
 * @description A microservice for data validation for posts
 */

const joi = require('joi');
const { ValidationError } = require('../../../lib/error/customErrors.js');
const {newPostSchema} = require('./PostSchemas.js');


async function validateNewPostInput(req, res, next){
    
    const {error, value} = newPostSchema.validate(req.body,
        {
            abortEarly:false,
            stripUnknown: true
        }
    );
    if (error){
        throw new ValidationError({'error': error});
    }

    res.locals.newPostObj = value;
    next()
}

module.exports = {validateNewPostInput}
