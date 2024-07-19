/**
 * 
 * @file PostSchemas.js
 * @module Posts
 * @description Schemas for properties of a post.
 */

const joi = require('joi');
const { ValidationError } = require('../../../lib/error/customErrors.js');
const GlobalSchemas = require('../../../lib/validation/schemas/GlobalSchemas.js')

const titleSchema = joi.string()
    .trim()
    .alphanum()
    .min(8)
    .max(240);

const bodySchema = joi.string()
    .trim()
    .min(8)
    .max(40000);
    

const newPostSchema = joi.object().keys({
    POST_UUID : GlobalSchemas.generateUUID,
    title : titleSchema.required(),
    body : bodySchema.required(),

}).strict()

module.exports = {newPostSchema, titleSchema, bodySchema}