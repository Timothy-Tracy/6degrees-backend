const { v7: uuidv7 } = require('uuid');
const NodeRepository = require('../data-access/NodeRepository.js');
const EdgeService = require('../../edges/domain/EdgeService.js');
const UserService = require('../../users/domain/UserService.js');
const AuthService = require('../../auth/domain/AuthService.js');
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'NodeService' });



async function createSourceNode(RUUID, UUUID) {
    logger.debug("Creating Source Node")
    let newNodeUUID = uuidv7();
    const degree = 0;
    const nodeType = "origin";
    const metadata = {};
    const date = new Date().toISOString()
    const newNode = {
        NODE_UUID: newNodeUUID,
        POST_UUID: RUUID,
        USER_UUID: UUUID,
        NODE_TYPE: nodeType,
        metadata: {},
        degree: degree,
        createdAt: date
    }
    logger.debug("Source Node Created")
    return (newNode);
}
/**
 * 
 * @module NodeService
 * @description This function is a middleware that creates an "edge" for a respective node. This edge represents a distribution method, or a share
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @requires res.locals.NODE_UUID
 */
//TODO: Conditional distribution based off of if one exists
async function distribute(uuid) {
    const log = logger.child({'function':'distribute'})
    log.trace();
    var sourceNodeResult = await NodeRepository.findOneByUUID(uuid);
    log.debug(sourceNodeResult.data.node, 'SOURCENODERESULT.DATA.NODE')
    var edgeResult = await EdgeService.createDistributionNew(sourceNodeResult.data.node);
    log.debug(edgeResult.data.edge)
    return {data: {
        NODE_UUID : sourceNodeResult.data.node.NODE_UUID,
        EDGE_QUERY : edgeResult.data.edge.EDGE_QUERY
    }}
    
    
}


/**
 * 
 * @module NodeService
 * @description This middleware function is called when someone opens a post from a distribution, or share. 
 * If in the API Call there is an authorization header, the new node will be created with the verified user as its owner.
 * Otherwise, an anonymous user will be created as its owner
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @requires req.params.query
 */
async function createFromDistribution(req, res, next) {
    const log = logger.child({'function':'createFromDistribution'});
    log.trace();
    log.info("creating from distribution")
    var result = await EdgeService.findOneByQuery(req.params.query)
    logger.info('Source Edge Found')
    log.info(sourceEdge)
    res.locals.edge = result.data.edge;
    res.locals.node = result.data.node;
    let user, owned;

    if (res.locals.auth.tokenData) {
        log.info('tokenData detected')
        user = res.locals.auth.tokenData.USER_UUID;
        owned = true;
    } else {
        log.info('no auth')
        logger.info("Creating Anonymous User")
        var anonUser = await UserService.createAnonymous();
        if (anonUser.result.result) {
            console.log("NodeService: Anon user was successful")
            user = anonUser.data.USER_UUID
            owned = false;

    }}

        let newNodeUUID = uuidv7();
        const nodeType = "RESPONSE";
        const newNode = {
            NODE_UUID: newNodeUUID,
            POST_UUID: result.data.post.POST_UUID,
            USER_UUID: user,
            NODE_TYPE: nodeType,
            SOURCE_NODE_UUID: result.data.node.NODE_UUID,
            SOURCE_EDGE_UUID: result.data.edge.EDGE_UUID,
            metadata: {},
            degree: parseInt(result.data.edge.degree) + 1,
            owned: owned

        }
        await NodeRepository.create(newNode);
        await NodeRepository.findDistributionPathAndAward(newNodeUUID, 10);
        res.locals.POST_UUID = newNode.POST_UUID;

    
    next()
}
async function interact(req, res, next) {
    const log = logger.child({'function':'interact'});
    log.trace();
    log.info(`interacting with post using query ${req.params.query}`);
    var result = await EdgeService.findOneByQuery(req.params.query)
    logger.info(result.data)
    res.locals.edge = result.data.edge;
    res.locals.node = result.data.node;
    let user, owned;

    //condition: login status
    
    if (res.locals.auth.hasAuth) {
        log.info('auth = yes')
        user = res.locals.auth.tokenData.USER_UUID;
        owned = true;
    } else {
        log.info('auth = no')
        logger.info("Creating Anonymous User")
        var anonUser = await UserService.createAnonymous();
        if (anonUser.result.result) {
            console.log("NodeService: Anon user was successful")
            user = anonUser.data.USER_UUID
            owned = false;

    }}

        let newNodeUUID = uuidv7();
        const nodeType = "RESPONSE";
        const newNode = {
            NODE_UUID: newNodeUUID,
            POST_UUID: result.data.post.POST_UUID,
            USER_UUID: user,
            NODE_TYPE: nodeType,
            SOURCE_NODE_UUID: result.data.node.NODE_UUID,
            SOURCE_EDGE_UUID: result.data.edge.EDGE_UUID,
            metadata: {},
            degree: parseInt(result.data.edge.degree) + 1,
            owned: owned
        }
        //create the new node
        let resultt = await NodeRepository.create(newNode);
        //award points
        
        log.info()
        log.debug('finding distribution path and awarding')
        await NodeRepository.findDistributionPathAndAward(newNodeUUID, 10);
        res.locals.POST_UUID = newNode.POST_UUID;
        res.locals.NODE_UUID = newNodeUUID;
        distribute(newNodeUUID)
        
            
        
    next()
}

async function findOneByUUID(req, res, next) {
    logger.info("Finding Node By UUID ")
    const myresult = await UserRepository.findOneByUUID(req.params.uuid);
    res.result = { "data": myresult }
    next()
}

async function deleteNode(req, res, next) {
    logger.info(`Deleting Node ${req.params.uuid}`)
    const myresult = await NodeRepository.deleteNode(req.params.uuid);
    res.result = { "data": myresult }
    next()
}
/**
 * @module NodeService
 * @requires JWT
 * @description This middleware function transfers ownership of a response node from an unauthorized anonymous user to an authenticated user,
 * who's information is provided by the provided token
 * @param {} req 
 * @param {*} res 
 * @param {*} next 
 */
async function takeOwnership(req, res, next) {
    const node = req.body.NODE_UUID;
    const user = res.locals.auth.tokenData.USER_UUID;

    let result = await NodeRepository.takeOwnership({ "NODE_UUID": node, "USER_UUID": user });
    res.result = result;
    next()

}

async function findAllOwnedBy(req, res, next) {
    const user = res.locals.auth.tokenData.USER_UUID;
    logger.debug(user)
    const result = await NodeRepository.findAllOwnedBy(user);
    res.result = result;
    next()
}


module.exports = { interact, deleteNode, findOneByUUID, createSourceNode, distribute, createFromDistribution, takeOwnership, findAllOwnedBy };
