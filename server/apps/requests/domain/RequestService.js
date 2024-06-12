
const { v7: uuidv7 } = require('uuid');
const NodeService = require('../../nodes/domain/NodeService.js')
const RequestRepository = require('../data-access/RequestRepository.js')

    function createRequest(UUUID, title, description){
        console.log("hello world")
        let newRequestUUID = uuidv7();
        const sourceNode = NodeService.createSourceNode(newRequestUUID,UUUID);
        const newRequest = {
            REQUEST_UUID : newRequestUUID,
            USER_UUID : UUUID,
            SOURCE_NODE_UUID : sourceNode.NODE_UUID,
            title : title,
            description : description,
            fulfilled : false
        }
        RequestRepository.createRequest(newRequest);
        return (newRequest);
    }



module.exports = {createRequest};