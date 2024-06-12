const { v7: uuidv7 } = require('uuid');
const NodeRepository =require('../data-access/NodeRepository.js');


function createSourceNode(RUUID, UUUID){
            let newNodeUUID = uuidv7();
            const degree = 0;
            const nodeType = "NODE_TYPE_SOURCE";
            const edges = [];
            const metadata = {};
            const newNode = {
                NODE_UUID : newNodeUUID,
                REQUEST_UUID : RUUID,
                USER_UUID : UUUID,
                NODE_TYPE : nodeType,
                isSourceNode : true,
                metadata : {},
                degree : degree,
                edges : [],
            }
            NodeRepository.createNode(newNode);
            return(newNode);
        }
    

module.exports = {createSourceNode};
