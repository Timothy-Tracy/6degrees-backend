
const { v7: uuidv7 } = require('uuid');
const NodeService = require('../../nodes/domain/NodeService.js')
const EdgeService = require('../../edges/domain/EdgeService.js')
const PostRepository = require('../data-access/PostRepository.js')
const NodeRepository = require('../../nodes/data-access/NodeRepository.js')
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'PostService' });

/**
 * @function open
 * @description Opens a post from an edge query parameter.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function findPostUUIDByQuery(req,res,next){
    const log = logger.child({'function':'open'});
    const query = req.params.query;
    log.info(`opening post from query ${query}`);
    var sourceEdge = await EdgeService.findOneByQuery(req.params.query)
    logger.info('Source Edge Found')
    res.locals.POST_UUID = sourceEdge.POST_UUID;
}

async function create(req, res, next) {
    logger.debug("creating new post")
    let UUID = uuidv7();
    const sourceNode = await NodeService.createSourceNode(UUID, res.locals.tokenData.USER_UUID);
    const newPost = {
        POST_UUID: UUID,
        USER_UUID: res.locals.tokenData.USER_UUID,
        SOURCE_NODE_UUID: sourceNode.NODE_UUID,
        POST_TYPE: req.body.POST_TYPE,
        title: req.body.title,
        description: req.body.description,
        fulfilled: false
    }
    res.result = await PostRepository.create(newPost);
    await NodeRepository.create(sourceNode)
    next();
}

async function deletePost(req, res, next) {
    console.log("PostService: Deleting Node ", req.params.uuid)
    const myresult = await PostRepository.deletePost(req.params.uuid);
    res.result = { "data": myresult }
    next()
}

async function findOne(req, res, next) {
    logger.debug('Finding Post By UUID')
    const result = await PostRepository.findOneByUUID(res.locals.POST_UUID);
    res.result = result;
    next()

}



module.exports = { create, deletePost, findOne, findPostUUIDByQuery };