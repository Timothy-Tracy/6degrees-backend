//NodeService.js
const { v7: uuidv7 } = require('uuid');
const NodeRepository = require('../data-access/NodeRepository.js');
const EdgeService = require('../../edges/domain/EdgeService.js');
const UserService = require('../../users/domain/UserService.js');
const {findOneByQueryStandalone} = require('../../posts/domain/PostService.js')
const Repository = require('../../db/neo4j/data-access/Repository.js');

const AuthService = require('../../auth/domain/AuthService.js');
const mylogger = require('../../../lib/logger/logger.js');
const { AppError } = require('../../../lib/error/customErrors.js');
const logger = mylogger.child({ 'module': 'NodeService' });

async function getOne(properties, options={returnProperties :[], excludedProperties:[], user:{returnProperties:[], excludedProperties:[]}}){
    const log = logger.child({'function':'getOne'});
log.trace({properties,options})
    let output ={}
    let nodeResult = await Repository.get(
        {
            label: 'NODE',
            properties: properties,
            returnProperties: options.returnedProperties,
            excludedProperties: options.excludedProperties
        }
    )

    let node = nodeResult.data[0].properties
    output.data = node


    if(options.user !=null){
        let userResult = await Repository.getRel(
            {
                label: 'USER',
                returnProperties: options.user.returnProperties
            
            },
            {type:'PARENT_USER'},
            {
                label:'NODE',
                properties: {'NODE_UUID': node.NODE_UUID}
            }
        )
       
        output.data ={...output.data, ...userResult.data[0].source.properties}

    }
    let {EDGE_QUERY} = await EdgeService.getOne({
        label: 'NODE',
        properties: {'NODE_UUID': output.data.NODE_UUID}
    })
    output.data ={...output.data, EDGE_QUERY }

    
    log.info(output)
    return output
}

async function findNodeByQuery({query, USER_UUID}){
    let PostRepository = require('../../posts/data-access/PostRepository.js')
    const log = logger.child({'function':'findNodeByQuery'});
    log.trace();
    let result = await PostRepository.findOneByQuery(query);
    let result2 = await NodeRepository.userHasNodeInPost(USER_UUID, result.data.post[0].POST_UUID)
    let result3 = await NodeRepository.findOneByUUID(result2.data.node);
    return result3.data.node
}

async function findAllNodeQueries(username) {
    const log = logger.child({'function':'findAllNodeQueries'});
    log.trace();
    const result = await NodeRepository.findAllOwnedBy({username:username});
    const result2= await Repository.getRel(
        {
            label:'USER',
            properties:{username:username},
            returnProperties:['username']
        },
        {
            type:'PARENT_USER'
        },
        {
            label: 'NODE',
            returnProperties: ['NODE_UUID']
        }
    )
    let nodeUuids = result2.data.map((record)=>record.target.properties.NODE_UUID)

    let queryResults = []
    for(let i = 0; i<nodeUuids.length; i++){
        let res = await Repository.getRel(
            {
                label:'NODE',
                properties: {NODE_UUID: nodeUuids[i]}
            },
            {
                type:'EDGE'
            }

        )
        let query = res.data[0].relationship.properties.EDGE_QUERY
        queryResults.push(query)

    }
    
    let nodeQueries = result.nodes.map((node)=>node.node.EDGE_QUERY);
    return queryResults
    
 
    
}
async function findMyNodeByPostQuery(req,res,next){
   
    const log = logger.child({'function':'findMyNodeByPostQuery'});
    log.trace();
    
    let USER_UUID = "";
    if(res.locals.auth.hasAuth){
        USER_UUID=res.locals.auth.tokenData.USER_UUID;
    }else{
        
    }
    res.result = await findNodeByQuery({'query': req.params.query, 'USER_UUID': USER_UUID})
    
    next()
}

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
    return edgeResult.data.edge.EDGE_QUERY
    
    
    
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
async function initEdge(NODE_UUID) {
    const log = logger.child({'function':'initEdge'})
    log.trace();
    let edgeResult = await EdgeService.createDistributionNew(NODE_UUID);
    log.debug(edgeResult.data.edge)
    return edgeResult.data.edge.EDGE_QUERY
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

async function interact(req, res, next) {
    const log = logger.child({'function':'interact'});
    log.trace(`interacting with post using query ${req.params.query}`);
   
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
        let createResult = await NodeRepository.create(newNode);
        
        if (createResult.existingNode){
            res.result = createResult;
            log.debug("User has node in post, therefore I'm moving on to the next middleware.")
            next()
        } else {
            log.debug('User does not have node in post, moving on')
            res.result = await NodeRepository.findOneByUUID(newNode.NODE_UUID)
            //award points
            
           // log.info()
            //log.debug('finding distribution path and awarding')
            //await NodeRepository.findDistributionPathAndAward(newNodeUUID, 10);
            res.locals.POST_UUID = newNode.POST_UUID;
            res.locals.NODE_UUID = newNodeUUID;
           
            res.result.EDGE_QUERY = await initEdge(newNode.NODE_UUID)
            
                
            
        next()
        }
       
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
    const log = logger.child({'function':'findAllOwnedBy'});
    log.trace();
    const user = res.locals.auth.tokenData.USER_UUID;
    const result = await NodeRepository.findAllOwnedBy({USER_UUID:user});
    res.locals.nodes = result.nodes;
    
    for (const item of res.locals.nodes) {
        const result = await findOneByQueryStandalone(item.node.PREV_EDGE_QUERY || item.node.EDGE_QUERY);
        item.post = result.post[0]
      }
    
    res.result = res.locals.nodes;
        next()
    
}

async function findDistributionPath(req,res,next){
    const result = await NodeRepository.findDistributionPathByQuery(req.params.query)
    res.result = result;
    next()
}

async function findDistributionPathGraphData(node){
    const log = logger.child({'function':'findDistributionPathGraphData'});
    log.trace(node, 'Find path nodeservice start');
    
    
    const result = await Repository.getPathNoBackForks({startNodeLabel:'NODE', startNodeProperties:{'NODE_UUID': node.NODE_UUID},endNodeLabel:'NODE', relationshipType:'EDGE_FULFILLED'})
    log.debug({result})
    console.log(result)

    let transformedData = await Repository.transformData(result);
    log.debug(JSON.stringify(transformedData.nodes))
    
    for (let i = 0; i<transformedData.nodes.length; i++){
        let node = transformedData.nodes[i]
        let rel = await Repository.getRelationships({sourceLabel:'NODE', sourceProperties:{'NODE_UUID': node.NODE_UUID}, targetLabel:'USER', relationshipType:'PARENT_USER', targetReturnProperties:['username']})
        log.debug(rel[0].target.properties)
        transformedData.nodes[i] = {...node, username: rel[0].target.properties.username}
    }
    log.debug(transformedData)
    return transformedData
}

async function getNodeIdByQuery(query){
    let result = await EdgeService.getUuidByQuery(query,'NODE')
    return result
}

module.exports = {  findAllNodeQueries, interact, getOne, deleteNode, findOneByUUID, createSourceNode, distribute,  takeOwnership, findAllOwnedBy, findDistributionPath, findMyNodeByPostQuery, findDistributionPathGraphData, initEdge, getNodeIdByQuery };