
const { v7: uuidv7 } = require('uuid');
const NodeService = require('../../nodes/domain/NodeService.js')
const Neo4jRepository = require('../../db/neo4j/data-access/Neo4jRepository.js');
const UserRepository = require('../data-access/UserRepository.js')
const UserValidation = require('./UserValidation.js')
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'UserService' });
const randomWordSlugs = require('random-word-slugs')
const AuthService = require('../../auth/domain/AuthService.js');
const customErrors = require('../../../lib/error/customErrors.js')
const catchAsync = customErrors.catchAsync;


var crypto = require('crypto');

async function create(req, res, next) {
    
    var hashedPassword = await AuthService.hash(req.body.password.toString());
    res.locals.newUserObj.password = hashedPassword;
    res.locals.newUserObj.isAnonymous = false;
    const date = new Date().toISOString();
    res.locals.newUserObj.createdAt = date;
    // const newUser = {
    //    // USER_UUID: newUserUUID,
    //     //USER_ROLE : "USER",
    //     username : req.body.username,
    //     firstName: req.body.firstName,
    //     lastName: req.body.lastName,
    //     email: req.body.email,
    //     password: req.body.password,
    //     mobile: req.body.mobile,
    //     isAnonymous : false
    // }
    logger.info(res.locals.newUserObj)
    console.log(req.ip)
    //const myresult = await UserRepository.create(newUser);
    //res.result = { "data": myresult }
    next()
}

async function createAnonymous() {
    
    logger.debug("Creating a new anonymous user")
    let newUserUUID = uuidv7();
    let randomName = randomWordSlugs.generateSlug();
    const newUser = {
        USER_UUID: newUserUUID,
        name : randomName,
        isAnonymous : true
    }
    const myresult = await UserRepository.createAnonymous(newUser);
    return {result : myresult, data: newUser};
}

async function findAll(req, res, next) {
    const myresult = await UserRepository.findAll();
    res.result = { "data": myresult }
    next()
}
async function findOneByUUID(req, res, next) {
    logger.debug("Finding User By UUID")

    const myresult = await UserRepository.findOneByUUID(req.params.UUID);
    res.result = { "data": myresult }
    next()
}

async function deleteUser(req, res, next) {
    const myresult = await UserRepository.deleteUser(req.body.USER_UUID);
    res.result = { "data": myresult }
    next()
}

async function update(req,res,next){
    const log = logger.child({'function':'update'});
    log.trace()
    const result = await Neo4jRepository.findOneAndUpdate('USER', "USER_UUID", res.locals.auth.tokenData.USER_UUID, req.body);
    res.result = result;
    next();
}





module.exports = { createAnonymous, findAll, findOneByUUID, create, deleteUser, update };