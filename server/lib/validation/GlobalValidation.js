/**
 * 
 * @file GlobalValidation.js
 * @module validation
 * @description A library of validation functions that can be used for any app
 */
const joi = require('joi');
const { ValidationError } = require('../error/customErrors.js');
const GlobalSchemas = require('./schemas/GlobalSchemas.js');
const mylogger = require('../logger/logger.js')
const logger = mylogger.child({ 'module': 'GlobalValidation' });

async function validateUUIDParam(req,res,next){
    const log = logger.child({'function':'validateUUIDParam'});
    log.trace();
    const {error, value} = GlobalSchemas.validUUIDSchema.validate(req.params.uuid,
        {
            abortEarly:false,
        }
    )
    if(error){
        throw new ValidationError({'error': error, 'message': `${req.params.uuid} not a valid uuid`})
    }
    next();
}

async function validateUsernameParam(req,res,next){
    const log = logger.child({'function':'validateUUIDParam'});
    log.trace();
    const {error, value} = GlobalSchemas.usernameSchema.validate(req.params.username,
        {
            abortEarly:false,
        }
    )
    if(error){
        throw new ValidationError({'error': error, 'message': `${req.params.uuid} not a valid uuid`})
    }
    res.locals.params = {}
    res.locals.params.username = value;
    next();
}



module.exports = {validateUUIDParam, validateUsernameParam}