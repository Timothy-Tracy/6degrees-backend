const { v7: uuidv7 } = require('uuid');
const NodeRepository =require('../data-access/NodeRepository.js');
const EdgeService = require('../../edges/domain/EdgeService.js');
const UserService = require('../../users/domain/UserService.js');

async function createSourceNode(RUUID, UUUID){
    console.log("NodeService: Creating Source Node")
            let newNodeUUID = uuidv7();
            const degree = 0;
            const nodeType = "origin";
            const edges = [];
            const metadata = {};
            const newNode = {
                NODE_UUID : newNodeUUID,
                POST_UUID : RUUID,
                USER_UUID : UUUID,
                NODE_TYPE : nodeType,
                metadata : {},
                degree : degree,
            }
            console.log("NodeService: Source Node Created")
            return(newNode);
        }

async function distribute(req, res, next){
    console.log("NodeService: Distributing")
    var sourceNode = await NodeRepository.findOneByUUID(req.params.uuid);
    console.log("NodeService: Source Node Found", sourceNode.NODE_UUID)
    res.result = await EdgeService.createDistribution(sourceNode.result);
    next()
}

async function createFromDistribution(req, res, next){
    console.log("NodeService: createFromDistribution")
    console.log("NodeService: Finding Source Edge")
    var sourceEdge = await EdgeService.findOneByQuery(req.params.id)
    console.log("NodeService: Source Edge Found: \n ",sourceEdge)
    console.log("NodeService: Creating Anonymous User")
    var anonUser = await UserService.createAnonymous();
    if(anonUser.result.result){
        console.log("NodeService: Anon user was successful")
    
    let newNodeUUID = uuidv7();
    const nodeType = "RESPONSE";
    const newNode = {
        NODE_UUID : newNodeUUID,
        POST_UUID : sourceEdge.POST_UUID,
        USER_UUID : anonUser.data.USER_UUID,
        NODE_TYPE : nodeType,
        SOURCE_NODE_UUID : sourceEdge.SOURCE_NODE_UUID, 
        SOURCE_EDGE_UUID : sourceEdge.EDGE_UUID,
        metadata : {},
        degree : parseInt(sourceEdge.degree)+1,
        
    }
   let result = await NodeRepository.create(newNode);
    res.result = result;
    console.log(result)
}
    next()
}
    
async function findOneByUUID(req, res, next) {
    console.log("NodeService: Finding Node By UUID ")

    const myresult = await UserRepository.findOneByUUID(req.params.uuid);
    res.result = { "data": myresult }
    next()
}

async function deleteNode(req, res, next) {
    console.log("NodeService: Deleting Node ", req.params.uuid)
    const myresult = await NodeRepository.deleteNode(req.params.uuid);
    res.result = { "data": myresult }
    next()
}

module.exports = {deleteNode, findOneByUUID, createSourceNode, distribute, createFromDistribution};
