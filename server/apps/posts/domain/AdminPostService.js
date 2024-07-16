const { v7: uuidv7 } = require('uuid');
const NodeService = require('../../nodes/domain/NodeService.js')
const EdgeService = require('../../edges/domain/EdgeService.js')
const PostRepository = require('../data-access/PostRepository.js')
const NodeRepository = require('../../nodes/data-access/NodeRepository.js')
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'AdminPostService' });
const Neo4jRepository = require('../../db/neo4j/data-access/Neo4jRepository.js')


async function findManyByUserUUID(req,res,next){
    const log = logger.child({'function':'findManyByUserUUID'});
    log.trace();
    const result = await PostRepository.findAllOwnedBy(req.params.uuid);
    res.result = result;
    next()
}

async function findOneAndGet(req,res,next){
    const log = logger.child({'function':'findOneAndGet'});
    log.trace();
    const result = await Neo4jRepository.findOneAndGet('POST', req.body);
    res.result = result;
    next()
}

async function update(req,res,next){
    const log = logger.child({'function':'update'});
    log.trace()
    const result = await Neo4jRepository.findOneAndUpdate('POST', "POST_UUID", req.params.uuid, req.body);
    res.result = result;
    next();
}

async function deletePost(req,res,next){
const result = PostRepository.deletePost(req.params.uuid);
res.result = result;
next()
}


module.exports = {findManyByUserUUID, findOneAndGet, update, deletePost}