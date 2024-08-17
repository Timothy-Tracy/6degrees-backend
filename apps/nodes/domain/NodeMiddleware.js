const NodeService = require('./NodeService.js');
const EdgeService = require('../../edges/domain/EdgeService.js')
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'NodeMiddleware' });
const Repository = require('../../db/neo4j/data-access/Repository.js');
const { AppError } = require('../../../lib/error/customErrors.js');

async function getNodeByQuery(req,res,next){
   
    const log = logger.child({'function':'getNodeByQuery'});
    log.trace();
    
    let USER_UUID = "";
    if(res.locals.auth.hasAuth){
        USER_UUID=res.locals.auth.tokenData.USER_UUID;
    }else{
        
    }

    res.result = await NodeService.findNodeByQuery({'query': req.params.query, 'USER_UUID': USER_UUID})
    
    next()
}

async function getQueryByNodeUuid(req,res,next){
    let response = {}
    const log = logger.child({'function':'getNodeByQuery'});
    log.trace();
    let NODE_UUID = req.params.uuid;

    const nodeResult = await Repository.get(
        {
            label: 'NODE',
            properties: {NODE_UUID: NODE_UUID}
        }
    )

    if(!nodeResult.data[0]){
        throw new AppError(`Node ${NODE_UUID} does not exist`)

    }
    

    const findEdgeResult = await EdgeService.findOneByNodeUUID(NODE_UUID);
    if(findEdgeResult){
        response.message = 'Found edge'
        response.data = {'EDGE_QUERY': findEdgeResult[0].relationship.properties.EDGE_QUERY}
    } else {
        
        const createEdgeResult = await NodeService.initEdge(NODE_UUID)
        response.message = 'Created edge'
        response.data = {'EDGE_QUERY': createEdgeResult}
    }
    
    next();



}

async function findDistributionPathGraphData(req,res,next){
    const log = logger.child({'function':'findDistributionPathGraphData'});
    log.trace(res.locals.node);
    const Repository = require('../../db/neo4j/data-access/Repository.js');
    let USER_UUID = ""
    if(res.locals.auth.hasAuth){
        USER_UUID=res.locals.auth.tokenData.USER_UUID;
    }else{
        
    }
    let result = await NodeService.findDistributionPathGraphData(res.locals.node)
    res.result = result;
    next()
}

async function getNode(req,res,next){
    if(res.locals.nodeUuid == null){
        throw new AppError('No node provided in the middleware')
    }
    const result = await NodeService.getOne({'NODE_UUID': res.locals.nodeUuid}, {user:{returnProperties:['username', 'USER_UUID']}});
    res.locals.node = result.data
    next();
}

async function getPostUuidByQuery(req,res,next){
    let result = await EdgeService.getUuidByQuery(req.params.query, 'POST')
        logger.info(result[0])
        let data={data: result[0]}
        data.data.key='POST_UUID'
        data.message = `Found Post UUID associated with query ${req.params.query}`
        res.result = data;
        next()
}

async function findAllNodeQueriesByUsername(req, res, next) {
    const log = logger.child({'function':'findAllNodeQueriesByUsername'});
    log.trace();
    let output = {}
    output.data = await NodeService.findAllNodeQueries(req.params.username);

    
    res.result = output;
        next()
    
}


/**
 * Retrieves a node associated with both the authenticated user and a specific post.
 * 
 * @async
 * @function getMyNode
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {AppError} Throws an error if user is not authorized or if no matching node is found
 */
async function getMyNode(req, res, next) {
    // Initialize logger for this function
    const log = logger.child({'function':'getMyNode'});
    log.trace();
    
    // Check if user is authorized
    if (!res.locals.auth.hasAuth) {
        throw new AppError('Not Authorized', 500);
    }
    const USER_UUID = res.locals.auth.tokenData.USER_UUID;

    // Get the POST_UUID based on the query parameter
    const [postUuidResult] = await EdgeService.getUuidByQuery(req.params.query, 'POST');
    
    // Perform two database queries in parallel
    const [nodeResult, userResult] = await Promise.all([
        // Query 1: Get all NODEs related to the POST
        Repository.getRel(
            {
                label:'POST',
                properties: {'POST_UUID': postUuidResult}
            },
            {
                type:'PARENT_POST',
            },
            {
                label: 'NODE',
                returnProperties:['NODE_UUID']
            }
        ),
        // Query 2: Get all NODEs associated with the USER
        Repository.getRel(
            {
                label:'USER',
                properties: {'USER_UUID': USER_UUID}
            },
            {
                type: 'PARENT_USER'
            },
            {
                label: 'NODE',
                returnProperties:['NODE_UUID']
            }
        )
    ]);

    // Check if both queries returned results
    if (nodeResult.data.length === 0 || userResult.data.length === 0) {
        throw new AppError('No nodes found', 404);
    }

    // Create sets of NODE_UUIDs for efficient lookup
    const postNodeUUIDs = new Set(nodeResult.data.map(record => record.target.properties.NODE_UUID));
    const userNodeUUIDs = new Set(userResult.data.map(record => record.target.properties.NODE_UUID));
    
    // Find NODE_UUIDs that are associated with both the POST and the USER
    const matchingNodeUUIDs = [...userNodeUUIDs].filter(uuid => postNodeUUIDs.has(uuid));

    // If no matching nodes are found, throw an error
    if (matchingNodeUUIDs.length === 0) {
        res.locals.myNode = null
    } else {
        const matchingNodeUUID = matchingNodeUUIDs[0];
        let myNodeResult = await NodeService.getOne(
            {'NODE_UUID': matchingNodeUUID},
            {user:{returnProperties:['username','USER_UUID']}}
        );
        res.locals.myNode = myNodeResult.data
    }

    // Select the first matching node (if multiple exist)
    

    // Retrieve full data for the matching node
    

    // Proceed to the next middleware
    next();
}


module.exports = {
    getMyNode,
    findAllNodeQueriesByUsername,
    getNode,
    findDistributionPathGraphData,
    getNodeByQuery,
    getQueryByNodeUuid,
    getPostUuidByQuery
}