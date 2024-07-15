/**
 * 
 * @file GlobalSchemas.js
 * @module GlobalSchemas
 * @description A library of schemas that can be used for any app
 */
const joi = require('joi');
const { ValidationError } = require('../../../lib/error/customErrors.js');
const { v7: uuidv7 } = require('uuid');

const validUUIDSchema = joi.string().uuid();

module.exports = {validUUIDSchema}