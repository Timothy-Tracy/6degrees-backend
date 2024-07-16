
const { v7: uuidv7 } = require('uuid');
const NodeService = require('../../nodes/domain/NodeService.js')
const Neo4jRepository = require('../../db/neo4j/data-access/Neo4jRepository.js');
const UserRepository = require('../data-access/UserRepository.js')
const UserValidation = require('./UserValidation.js')
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'UserService' });
const randomWordSlugs = require('random-word-slugs')
const AuthService = require('../../auth/domain/AuthService.js');
const {catchAsync,AppError} = require('../../../lib/error/customErrors.js')



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
    const myresult = await UserRepository.create(res.locals.newUserObj);
    res.result = myresult
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
    const myresult = await Neo4jRepository.findOneAndDelete('USER', 'USER_UUID', res.locals.auth.tokenData.USER_UUID);
    res.result = { myresult}
    next()
}

async function update(req,res,next){
    const log = logger.child({'function':'update'});
    log.trace()
    const result = await Neo4jRepository.findOneAndUpdate('USER', "USER_UUID", res.locals.auth.tokenData.USER_UUID, req.body);
    res.result = result;
    next();
}

async function changePassword(req,res,next){
    const log = logger.child({'function':'changePassword'});
    log.trace();
    let hash = await AuthService.hash(res.locals.password);
    let obj = {'password':hash};
    log.info(obj)
    const result = await Neo4jRepository.findOneAndUpdate('USER', 'USER_UUID', res.locals.auth.USER_UUID, obj);
    res.result = result;
    next()
}

async function follow(req,res,next){
    const log = logger.child({'function':'follow'});
    log.trace();
    await Neo4jRepository.checkExists('USER', {username:res.locals.params.username})
    const alreadyFollows = await Neo4jRepository.hasRelationshipDirectional(
        ['USER', 'USER'],
        ['USER_UUID', 'username'],
        [res.locals.auth.tokenData.USER_UUID,res.locals.params.username],
        'FOLLOWS'
    )

    if(alreadyFollows){
        throw new AppError('user already follows user',403);
    }
    const followObj = {
        source: res.locals.auth.tokenData.USER_UUID,
        destination: res.locals.params.username
    }
    const result = UserRepository.follow(followObj);
    res.result = result;
    next()

}

async function unfollow(req,res,next){
    const log = logger.child({'function':'unfollow'});
    log.trace();
    await Neo4jRepository.checkExists('USER', {username:res.locals.params.username})
    const alreadyFollows = await Neo4jRepository.hasRelationshipDirectional(
        ['USER', 'USER'],
        ['USER_UUID', 'username'],
        [res.locals.auth.tokenData.USER_UUID,res.locals.params.username],
        'FOLLOWS'
    )

    if(!alreadyFollows){
        throw new AppError('user does not follows user',403);
    }
    const followObj = {
        source: res.locals.auth.tokenData.USER_UUID,
        destination: res.locals.params.username
    }
    const result = UserRepository.unfollow(followObj);
    res.result = result;
    next()

}

async function sendFriendRequest(){

}

async function acceptFriendRequest(){

}




module.exports = { createAnonymous, findAll, findOneByUUID, create, deleteUser, update, changePassword, follow, unfollow };