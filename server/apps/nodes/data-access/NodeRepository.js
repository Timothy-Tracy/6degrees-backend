const fs = require("fs");

const neo4j = require('neo4j-driver');
require('dotenv').config()
const {
    DB_URL,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE
} = process.env;

async function findOneByUUID(UUID) {
    console.log("Finding Node By UUID ", UUID)
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`Match (n:NODE{\`NODE_UUID\`: '${UUID}'}) return n`)
        .then(result => {
            var results = [];
            result.records.map(i => {
                results.push(i.get('n').properties)
            }
            )

            //NEED TO ADD OTHER CONDITIONS
            if (results.length > 0) {
                console.log('helloworld')
                myobj = results[0]
            }
            console.log("Fulfilled, result is", myobj)
            myobj = { "result": myobj, "summary": result.summary }

        })
        .catch(error => {
            console.log("error", error);
            myobj = { "error": error }
        })
    await driver.close()
    return myobj;
};

async function findAll() {
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run('Match (n:NODE) return n')
        .then(result => {
            result.records.map(i => i.get('u').properties);
            console.log("Fulfilled, result is", result.records)
            myobj = { "result": result.records, "summary": result.summary }

        })
        .catch(error => {
            console.log("error", error);
            myobj = { "error": error }
        })
    await driver.close()
    return myobj;


};

async function create(newObj) {
    console.log("NodeRepository: creating new Node")

    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`
    CREATE (n:NODE 
        {
            \`NODE_UUID\`: "${newObj.NODE_UUID}",
            \`POST_UUID\`: "${newObj.POST_UUID}",
            \`USER_UUID\`: "${newObj.USER_UUID}", 
            \`SOURCE_NODE_UUID\`: "${newObj.SOURCE_NODE_UUID}", 
            \`SOURCE_EDGE_UUID\`: "${newObj.SOURCE_EDGE_UUID}",
            NODE_TYPE: "${newObj.NODE_TYPE}",
            degree: "${newObj.degree}", 
            metadata: "${JSON.stringify(newObj.metadata)}" 
            })
            WITH n
            MATCH (p:POST {POST_UUID: "${newObj.POST_UUID}"})
            MATCH (u:USER {USER_UUID: "${newObj.USER_UUID}"})  
            CREATE (u)<-[:USER]-(n)<-[:NODES]-(u)
            WITH n, p
            WHERE n.NODE_TYPE = "origin"
            CREATE (n)<-[:SOURCE_NODE]-(p)
            WITH n
            MATCH (source:NODE)-[edge:EDGE {EDGE_UUID: n.SOURCE_EDGE_UUID}]->()
            CREATE (source)-[s:EDGE_FULFILLED {
                EDGE_UUID: edge.EDGE_UUID,
                \`POST_UUID\`: edge.POST_UUID,
                \`SOURCE_NODE_UUID\`: edge.SOURCE_NODE_UUID, 
                \`DESTINATION_NODE_UUID\`: n.NODE_UUID,
                EDGE_QUERY: edge.EDGE_QUERY,
                degree : edge.degree
            }]->(n)
            return source
    
    ;`)
        .then(result => {
            //WHERE n.SOURCE_EDGE_UUID IS NOT NULL

            //WHERE source.NODE_UUID = edge.SOURCE_NODE_UUID
            result.records.map(i => i.get('u').properties)
            console.log(`Created a new node ${newObj.NODE_UUID} \n ${result.records}`)
            myobj = { "result": result.records, "summary": result.summary }
        })
        .catch(error => {
            console.log("error", error);
            myobj = { "error": error }
        })
    await driver.close()
    return myobj;
};

async function deleteNode(UUID) {
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    var query = `
    MATCH (n:NODE)
    WHERE n.NODE_UUID = '${UUID}'
    DETACH DELETE n;`;
    await session.run(query)
        .then(result => {
            console.log("Fulfilled, result is", result.records)
            myobj = { "result": result.records, "summary": result.summary }
        })
        .catch(error => {
            console.log("error", error);
            myobj = { "error": error }
        })
    await driver.close()
    return myobj;
};

module.exports = { deleteNode, create, findAll, findOneByUUID };