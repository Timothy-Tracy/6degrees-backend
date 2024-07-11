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
    const result = await PostRepository.findAllOwnedBy(req.params.USER_UUID);
    res.result = result;
    next()
}

module.exports = {findManyByUserUUID}