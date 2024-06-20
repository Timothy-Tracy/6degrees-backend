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
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`Match [e:EDGE{EDGE_UUID: ${UUID}}) return e`)
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
async function findOneByQuery(query) {
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`MATCH ()-[e:EDGE {EDGE_QUERY: '${query}'}]-() return e`)
        .then(result => {
            var results = [];
            result.records.map(i => {
                results.push(i.get('e').properties)
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
    console.log("EdgeRepository: creating new Edge")
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    console.log("EdgeRepository: received obj, ", newObj)
    await session.run(`
    MATCH (n:NODE {
        \`NODE_UUID\` : '${newObj.SOURCE_NODE_UUID}'
    })
    WITH n
    CREATE (n)-[:EDGE 
        {
            \`EDGE_UUID\`: '${newObj.EDGE_UUID}',
            \`POST_UUID\`: '${newObj.POST_UUID}',
            \`SOURCE_NODE_UUID\`: '${newObj.SOURCE_NODE_UUID}', 
            \`DESTINATION_NODE_UUID\`: 'null',
            EDGE_QUERY: '${newObj.EDGE_QUERY}',
            degree : '${newObj.degree}'
            
        }
    ]->();`)
        .then(result => {
            console.log(`Created a new edge ${newObj.EDGE_UUID} \n ${result.records}`)
            myobj = { "result": result.records, "summary": result.summary }
        })
        .catch(error => {
            console.log("error", error);
            myobj = { "error": error }
        })
    await driver.close()
    return myobj;
};
/*
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
*/
module.exports = { create, findAll, findOneByUUID, findOneByQuery };