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

async function findOneAndGet(req,res,next){
    const log = logger.child({'function':'findOneAndGet'});
    log.trace();
    const result = await Neo4jRepository.findOneAndGet('USER', req.body);
    res.result = result;
    next()
}

async function update(req,res,next){
    const log = logger.child({'function':'update'});
    log.trace()
    const result = await Neo4jRepository.findOneAndUpdate('USER', "USER_UUID", req.params.uuid, req.body);
    res.result = result;
    next();
}

async function deleteUser(req, res, next) {
    const myresult = await Neo4jRepository.findOneAndDelete('USER', 'USER_UUID', req.params.uuid);
    res.result = { myresult}
    next()
}

module.exports = {findOneAndGet, update, deleteUser}