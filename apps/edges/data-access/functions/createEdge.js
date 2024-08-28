const { initSession } = require("../../../db/neo4j/data-access/Neo4jDriver");
const mylogger = require('../../../../lib/logger/logger.js');
const { processRecord } = require("../../../db/neo4j/data-access/Repository.js");

const log = mylogger.child({ 
    'app': 'edges',
    'layer': 'data-access',
    'function': 'createEdge' 
});

async function createEdge(edgeObj){
    const session = initSession();
    log.trace({edgeObj})
    let data = {};
    let date = new Date().toISOString()
    await session.run(`
    MATCH (n:NODE  {NODE_UUID: "${edgeObj.SOURCE_NODE_UUID}"})
    WITH n
    CREATE (n)-[edge:EDGE 
        {
            \`EDGE_UUID\`: '${edgeObj.EDGE_UUID}',
            EDGE_QUERY: '${edgeObj.EDGE_QUERY}-${edgeObj.degree}',
            degree : '${edgeObj.degree}',
            createdAt: '${date}'
            
        }
    ]->()
    return edge
    ;`)
        .then(result => {
            data = result.records.map(record => processRecord(record))
        })
        .catch(error => {
            throw error
        })
   

    return data;
}

module.exports = createEdge