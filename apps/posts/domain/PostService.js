
const { v7: uuidv7 } = require('uuid');
const NodeService = require('../../nodes/domain/NodeService.js')
const EdgeService = require('../../edges/domain/EdgeService.js')
const PostRepository = require('../data-access/PostRepository.js')
const NodeRepository = require('../../nodes/data-access/NodeRepository.js')
const CommentRepository = require('../../comments/data-access/CommentRepository.js')

const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'PostService' });
const Neo4jRepository = require('../../db/neo4j/data-access/Neo4jRepository.js')

/**
 * @function open
 * @description Opens a post from an edge query parameter.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

async function open (req,res,next){
    const log = logger.child({'function':'open'});
    log.trace();
    log.debug(res.locals.NODE_UUID);
    log.debug(res.locals.POST_UUID);
    //Do stuff when a post is opened
    Neo4jRepository.findOneAndSetAttribute('NODE', "NODE_UUID",res.locals.NODE_UUID, 'views', "n.views+1", ['views']);
    Neo4jRepository.findOneAndSetAttribute('POST', "POST_UUID",res.locals.POST_UUID, 'views', "n.views+1", ['views']);
    NodeRepository.findDistributionPathAndAward(res.result.node[0].NODE_UUID, 1);
    next();
}
async function findOneByQuery(req, res, next){
    const log = logger.child({'function': 'findOneByQuery'});
    log.trace();
    const query = req.params.query;
    let result = await PostRepository.findOneByQuery(query);
    // let comments = await PostRepository.findAllCommentsByPostUUID(result.data.post[0].POST_UUID)
    let commentsArr = await CommentRepository.findManyCommentUuidsByPost(result.data.post[0].POST_UUID);
    // const commentObjArr = await Promise.all(commentsArr.data.map(element => CommentRepository.findOneByUUID(element)));

    //log.debug(commentObjArr, 'COMMENTS OBJ ARRAY')

    //result.data.comments = comments.data;
    res.result = result.data;
    res.result.comments = commentsArr.data
    
    res.locals.POST_UUID = result.data.post[0].POST_UUID;
    res.locals.NODE_UUID = result.data.node[0].NODE_UUID
    log.debug(res.result);
    
    if (typeof next === 'function') {
        log.trace('if type of next is function')
        next();
      }


}
async function findPostUUIDByQuery(req,res,next){
    const log = logger.child({'function':'open'});
    const query = req.params.query;
    log.info(`opening post from query ${query}`);
    var sourceEdge = await EdgeService.findOneByQuery(req.params.query)
    logger.info('Source Edge Found')
    res.locals.POST_UUID = sourceEdge.POST_UUID;
}

async function create(req, res, next) {
    const log = logger.child({'function':'create'});
    log.trace()
    
    res.locals.newPostObj.USER_UUID = res.locals.auth.tokenData.USER_UUID;
    // const newPost = {
    //     POST_UUID: UUID,
    //     USER_UUID: res.locals.auth.tokenData.USER_UUID,
    //     POST_TYPE: req.body.POST_TYPE,
    //     title: req.body.title,
    //     description: req.body.description,
    //     fulfilled: false
    // }
    const postResult = await PostRepository.create(res.locals.newPostObj);
    let UUID = uuidv7();
    const sourceNode = await NodeService.createSourceNode(res.locals.newPostObj.POST_UUID, res.locals.auth.tokenData.USER_UUID);
    const sourceNodeResult = await NodeRepository.create(sourceNode)
    let distributionResult = await NodeService.distribute(sourceNode.NODE_UUID)
    res.result = {...res.result, 'distributionResult': distributionResult};
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



module.exports = { create, deletePost, findOne, findPostUUIDByQuery, findOneByQuery, open };