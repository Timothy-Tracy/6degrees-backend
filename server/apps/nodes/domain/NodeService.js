const { v7: uuidv7 } = require('uuid');
const NodeRepository =require('../data-access/NodeRepository.js');


async function createSourceNode(RUUID, UUUID){
            let newNodeUUID = uuidv7();
            const degree = 0;
            const nodeType = "NODE_TYPE_SOURCE";
            const edges = [];
            const metadata = {};
            const newNode = {
                NODE_UUID : newNodeUUID,
                POST_UUID : RUUID,
                USER_UUID : UUUID,
                NODE_TYPE : nodeType,
                SOURCE_NODE_UUID : newNodeUUID,
                ORIGIN_NODE_UUID : newNodeUUID, 
                isSourceNode : true,
                metadata : {},
                degree : degree,
                edges : [],
            }
            
            return(newNode);
        }
    

module.exports = {createSourceNode};
