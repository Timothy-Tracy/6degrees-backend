const { v7: uuidv7 } = require('uuid');
const NodeRepository = require('../data-access/NodeRepository.js');
const EdgeService = require('../../edges/domain/EdgeService.js');
const UserService = require('../../users/domain/UserService.js');
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'NodeService' });



async function createSourceNode(RUUID, UUUID) {
    logger.debug("Creating Source Node")
    let newNodeUUID = uuidv7();
    const degree = 0;
    const nodeType = "origin";
    const metadata = {};
    const newNode = {
        NODE_UUID: newNodeUUID,
        POST_UUID: RUUID,
        USER_UUID: UUUID,
        NODE_TYPE: nodeType,
        metadata: {},
        degree: degree,
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
 */
//TODO: Conditional distribution based off of if one exists
async function distribute(req, res, next) {
    logger.info("NodeService: Distributing")
    var sourceNode = await NodeRepository.findOneByUUID(req.params.uuid);
    res.result = await EdgeService.createDistribution(sourceNode.result);
    next()
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
 */
async function createFromDistribution(req, res, next) {
    const log = logger.child({'function':'createFromDistribution'});
    log.info("creating from distribution")
    var sourceEdge = await EdgeService.findOneByQuery(req.params.query)
        logger.info('Source Edge Found')
    let user, owned;
    if (res.locals.tokenData) {
        log.info('tokenData detected')
        user = res.locals.tokenData.USER_UUID;
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
            POST_UUID: sourceEdge.POST_UUID,
            USER_UUID: user,
            NODE_TYPE: nodeType,
            SOURCE_NODE_UUID: sourceEdge.SOURCE_NODE_UUID,
            SOURCE_EDGE_UUID: sourceEdge.EDGE_UUID,
            metadata: {},
            degree: parseInt(sourceEdge.degree) + 1,
            owned: owned

        }
        let result = await NodeRepository.create(newNode);
        await NodeRepository.findDistributionPathAndAward(newNodeUUID);
        res.locals.POST_UUID = newNode.POST_UUID;

    
    next()
}
async function interact(req, res, next) {
    const log = logger.child({'function':'interact'});
    log.info(`interacting with post using query ${query}`);
    var sourceEdge = await EdgeService.findOneByQuery(req.params.query)
        logger.info('Source Edge Found')
    let user, owned;

    //condition: login status
    if (res.locals.tokenData) {
        log.info('auth = yes')
        user = res.locals.tokenData.USER_UUID;
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
            POST_UUID: sourceEdge.POST_UUID,
            USER_UUID: user,
            NODE_TYPE: nodeType,
            SOURCE_NODE_UUID: sourceEdge.SOURCE_NODE_UUID,
            SOURCE_EDGE_UUID: sourceEdge.EDGE_UUID,
            metadata: {},
            degree: parseInt(sourceEdge.degree) + 1,
            owned: owned

        }
        //create the new node
        let result = await NodeRepository.create(newNode);
        //award points
        await NodeRepository.findDistributionPathAndAward(newNodeUUID);
        res.locals.POST_UUID = newNode.POST_UUID;
        res.locals.NODE_UUID = newNodeUUID;
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
    const user = res.tokenData.USER_UUID;

    let result = await NodeRepository.takeOwnership({ "NODE_UUID": node, "USER_UUID": user });
    res.result = result;
    next()

}

async function findAllOwnedBy(req, res, next) {
    const user = res.tokenData.USER_UUID;
    logger.debug(user)
    const nodes = await NodeRepository.findAllOwnedBy({ "USER_UUID": user });
    res.result = nodes.result;
    next()
}


module.exports = { interact, deleteNode, findOneByUUID, createSourceNode, distribute, createFromDistribution, takeOwnership, findAllOwnedBy };
