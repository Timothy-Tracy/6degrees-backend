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
            properties: {'NODE_UUID': NODE_UUID}
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
    const result = await NodeService.getOne(res.locals.nodeUuid, {user:{returnProperties:['username', 'USER_UUID']}});
    res.locals.node = result.data
    next();
}

module.exports = {
    getNode,
    findDistributionPathGraphData,
    getNodeByQuery,
    getQueryByNodeUuid,
}