/**
 * 
 * @file CommentValidation.js
 * @module CommentValidation
 * @description A microservice for data validation for comment
 */

const Joi = require('joi');
const {ValidationError} = require('../../../lib/error/customErrors.js');
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'CommentValidation' });

// Define the comment schema
const commentSchema = Joi.object({
  COMMENT_UUID: Joi.string().uuid().required(),
  NODE_UUID: Joi.string().uuid().required(),
  USER_UUID: Joi.string().uuid().required(),
  body: Joi.string().min(1).max(240).required(),
  parentId: Joi.string().uuid().allow(null),
  createdAt: Joi.date().iso().required(),
  updatedAt: Joi.date().iso().required().allow(null),
  visibility: Joi.array()
});

// Function to validate a comment

async function validateComment(comment) {
    const log = logger.child({ 'function': 'validateComment' });
    log.trace();
    log.debug('Validating Comment');
    
    try {
      const { error, value } = commentSchema.validate(comment, { abortEarly: false });
      
      return value;  // Return the validated comment object
    } catch (error) {
      log.error('Unexpected error during validation:', error);
      if (error instanceof ValidationError) {
        throw error;
      } else {
        throw new ValidationError({'error': error});
      }
    }
  }
  

module.exports = {validateComment}