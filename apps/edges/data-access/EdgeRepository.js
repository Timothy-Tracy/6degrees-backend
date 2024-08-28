const fs = require("fs");
const neo4j = require('neo4j-driver');
require('dotenv').config()
const {
    DB_URL,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE
} = process.env;
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'EdgeRepository' });
const createEdge = require('./functions/createEdge.js')


async function findOneByUUID(UUID) {
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`Match [e:EDGE{EDGE_UUID: ${UUID}}) return e`)
        .then(result => {
            const myresult = result.records.map(i => i.get('e').properties);
            const msg = 'found edge by uuid'
            logger.info({'result': myresult[0], 'result-summary': result.summary._stats}, msg)
            myobj = { "result": myresult[0], 'message': msg }

        })
        .catch(error => {
            logger.error("error", error);
            myobj = { "error": error }
        })
    await driver.close()
    return myobj;
};
async function findOneByQuery(query) {
    let output = {data:{}}
    logger.info('finding edge by query')
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`MATCH (p:POST)-[:CHILD_NODE]-(n:NODE)-[e:EDGE {EDGE_QUERY: '${query}'}]->() return e,n,p`)
        .then(result => {
            const edgeResult = result.records.map(i => i.get('e').properties);
            const nodeResult = result.records.map(i => i.get('n').properties);
            const postResult = result.records.map(i => i.get('p').properties);


            const msg = 'found edge and node'
            output.data = {...output.data, 'node' : nodeResult[0], 'edge' :edgeResult[0],'post' :postResult[0]};
            output = {...output, 'summary': result.summary};
            output = {...output, 'message': msg}
        })
        .catch(error => {
            logger.error(error);
            output = {...output, "error": error }
        })
    await driver.close()
    return output;
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
    const log = logger.child({'function':'create'})
    logger.debug("creating new edge")
    let output = {data:{}};
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`
    MATCH (n:NODE  {NODE_UUID: "${newObj.SOURCE_NODE_UUID}"})
    WITH n
    CREATE (n)-[e:EDGE 
        {
            \`EDGE_UUID\`: '${newObj.EDGE_UUID}',
            EDGE_QUERY: '${newObj.EDGE_QUERY}-${newObj.degree}',
            degree : '${newObj.degree}'
            
        }
    ]->()
    return e
    ;`)
        .then(result => {
            const myresult = result.records.map(i => i.get('e').properties);
            output.data = {...output.data, 'edge':myresult[0]};
            output = {...output, 'message': 'successfully created new edge'}
        })
        .catch(error => {
            logger.error(error, "error");
            output = {...output, "error": error }
        })
    await driver.close()
    log.info(output)
    return output;
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
module.exports = { create, findAll, findOneByUUID, findOneByQuery, createEdge };