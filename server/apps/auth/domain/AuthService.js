const bcrypt = require('bcrypt');
const { v7: uuidv7 } = require('uuid');
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'AuthService' });
const Neo4jRepository = require('../../db/neo4j/data-access/Neo4jRepository.js');
const JWTService = require('../../jwt/domain/JWTService.js');
const {AppError} = require('../../../lib/error/customErrors.js')

async function hash(data){
    let log = logger.child({'function':'hash'});
    log.trace();
    const start = process.hrtime();
    const saltrounds = parseInt(process.env.SALT_ROUNDS);
    const hash = await bcrypt.hash(data, saltrounds);
    log.logperf(process.hrtime(start));
    return hash;
}

async function verifyPassword(username, password){
    let log = logger.child({'function':'verifyPassword'});
    log.trace();
    const start = process.hrtime();
    var userPasswordObj = await Neo4jRepository.findOneAndGetAttributes('USER','username', username, ['password']);
    const result = await bcrypt.compare(password, userPasswordObj.password)
    log.info(`password verification result for ${username} = ${result}`)
    log.logperf(log, process.hrtime(start))
    return result;
}

async function login(req,res,next){
    let log = logger.child({'function':'login'});
    log.trace();
    const{username, password} = req.body;
    const loginResult = await verifyPassword(username, password);

    if (loginResult){
        let user = await Neo4jRepository.findOneAndGetAttributes('USER','username', username, ['USER_UUID', 'USER_ROLE']);
        res.locals.token = await JWTService.sign(user);
        next()

    } else {
        throw new AppError('Bad Login Info', 204)
    }
}

async function verify(req,res,next){
    let log = logger.child({'function':'verify'});
    log.trace();
    const token = await JWTService.checkForToken(req);
    const data = await JWTService.decodeToken(token);
    res.locals.tokenData = data;
    res.locals.authorization = true;
    log.info('user authorization verified')

    if (typeof next === 'function') {
        next();
      }
}

async function optionalAuth(req, res, next){
    const log = logger.child({'function' : 'optionalAuth'});
    log.trace();
    if(req.headers.authorization){
        log.info('auth detected, verifying...')
        await verify(req,res);
        if (typeof next === 'function') {
            next();
          }
    } else {
        log.info('no auth')
        res.locals.authorization = false;
        if (typeof next === 'function') {
            next();
          }
    }
}


module.exports = {hash, login, verify, optionalAuth}
