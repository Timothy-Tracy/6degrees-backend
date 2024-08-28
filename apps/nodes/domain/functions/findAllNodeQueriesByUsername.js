// findAllNodeQueriesByUsername.js

const NodeRepository = require('../../data-access/NodeRepository.js');
const Repository = require('../../../db/neo4j/data-access/Repository.js');

const { AppError } = require('../../../../lib/error/customErrors.js');

const mylogger = require('../../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'NodeService' });

//Given a username, return an array of all node queries associated 
 async function findAllNodeQueriesByUsername(username) {
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
module.exports = findAllNodeQueriesByUsername

