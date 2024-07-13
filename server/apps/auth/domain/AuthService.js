/**
 * @module AuthService.js
 * @description A microservice for performing the logic associated with authorization
 */
const bcrypt = require('bcrypt');
const { v7: uuidv7 } = require('uuid');
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'AuthService' });
const Neo4jRepository = require('../../db/neo4j/data-access/Neo4jRepository.js');
const JWTService = require('../../jwt/domain/JWTService.js');
const {AppError, AuthorizationError} = require('../../../lib/error/customErrors.js')

async function hash(data){
    let log = logger.child({'function':'hash'});
    log.trace();
    const saltrounds = parseInt(process.env.SALT_ROUNDS);
    const hash = await bcrypt.hash(data, saltrounds);
    return hash;
}

async function verifyPassword(searchParam, searchValue, password){
    let log = logger.child({'function':'verifyPassword'});
    log.trace();
    var userPasswordObj = await Neo4jRepository.findOneAndGetAttributes('USER',searchParam, searchValue, ['password']);
    const result = await bcrypt.compare(password, userPasswordObj.password)
    log.info(`password verification result for ${searchParam}: ${searchValue} = ${result}`)
    return result;
}
/**
 * @function login
 * @description A middleware for logging in a user
 * @requires AuthValidation.validateLoginInput to have succeeded
 * @requires res.locals.loginObj.username or res.locals.loginObj.email
 * @requires res.locals.loginObj.password
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
//TODO make db access related to authorization its own repository
async function login(req,res,next){
    //init vars
    let loginResult, searchParam, searchValue;
    res.locals.auth={}
    //init logger
    let log = logger.child({'function':'login'});
    log.trace();

    // destruct res.locals.loginObj
    const{username, email, password} = res.locals.loginObj;

    //requires an email or a username to have been provided
    if(email){
        searchParam = 'email';
        searchValue = email;
    } else if (username){
        searchParam = 'username';
        searchValue = username;
        loginResult = await verifyPassword('username', username, password);
    } else {
        throw new AuthorizationError({'message':'Bad Login Info', "statusCode": 204})
    }

    //verify the password and return a boolean
    loginResult = await verifyPassword(searchParam,searchValue, password);


    if (loginResult){
        let user = await Neo4jRepository.findOneAndGetAttributes('USER',searchParam, searchValue, ['USER_UUID', 'USER_ROLE']);
        res.locals.auth.JwtToken = await JWTService.sign(user);
        next();
    } else {
        throw new AuthorizationError({'message':'Bad Login Info', "statusCode": 204})
    }
}


async function verify(req,res,next){
    let log = logger.child({'function':'verify'});
    log.trace();
    const token = await JWTService.checkForToken(req);
    const data = await JWTService.decodeToken(token);
    res.locals.auth.tokenData = data;
    res.locals.auth.hasAuth = true;
    log.info('user authorization verified')

    if (typeof next === 'function') {
        next();
      }
}

async function requireAuth(req,res,next){
    res.locals.auth ={}
    let log = logger.child({'function':'requireAuth'});
    log.trace('Authorization required.');
    const token = await JWTService.checkForToken(req);
    if(!token){
        throw new AuthorizationError({'message':'JWT Token Not Provided', 'statusCode':401})
    }
    const data = await JWTService.decodeToken(token);
    res.locals.auth.tokenData = data;
    res.locals.auth.hasAuth = true;
    log.info('user authorization verified')

    if (typeof next === 'function') {
        next();
      }
}

async function optionalAuth(req, res, next){
    res.locals.auth={}
    const log = logger.child({'function' : 'optionalAuth'});
    log.trace('Authorization optional.');
    const token = await JWTService.checkForToken(req);
    if(token){
        log.debug('auth header detection = true')
        const data = await JWTService.decodeToken(token);
    
        res.locals.auth.tokenData = data;
        res.locals.auth.hasAuth = true;
        if (typeof next === 'function') {
            next();
          }
    } else {
        log.info('auth header detection = false')
        log.debug(res)
        res.locals.auth.hasAuth = false;
        if (typeof next === 'function') {
            next();
          }
    }
}


module.exports = {hash, login, verify, optionalAuth, requireAuth}
