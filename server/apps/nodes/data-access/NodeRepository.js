const fs = require("fs");

const neo4j = require('neo4j-driver');
require('dotenv').config()
const {
    DB_URL,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE
} = process.env;

async function findOneByUUID(NUUID) {
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`Match (n:NODE{NODE_UUID: ${NUUID}}) return p`)
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
            NODE_TYPE: "${newObj.NODE_TYPE}",
            degree: "${newObj.degree}", 
            \`POST_UUID\`: "${newObj.POST_UUID}",
            \`USER_UUID\`: "${newObj.USER_UUID}", 
            \`SOURCE_NODE_UUID\`: "${newObj.ORIGIN_NODE_UUID}", 
            \`ORIGIN_NODE_UUID\`: "${newObj.ORIGIN_NODE_UUID}",
            isSourceNode: "${newObj.isSourceNode}", 
            metadata: "${JSON.stringify(newObj.metadata)}" 
            })
            WITH n
            MATCH (p:POST {POST_UUID: "${newObj.POST_UUID}"})
            MATCH (u:USER {USER_UUID: "${newObj.USER_UUID}"})  
            CREATE (p)<-[:SOURCE_POST]-(n)<-[:SOURCE_NODE]-(p)
            CREATE (u)<-[:USER]-(n)<-[:NODES]-(u)

    
    ;`)
        .then(result => {
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
    WHERE n.NODE_UUID = "${UUID}"
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