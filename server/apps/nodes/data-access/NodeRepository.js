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
const logger = mylogger.child({ 'module': 'NodeRepository' });

async function findOneByUUID(UUID) {
    logger.info("Finding Node By UUID ", UUID)
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`Match (n:NODE{\`NODE_UUID\`: '${UUID}'}) return n`)
        .then(result => {
            const myresult = result.records.map(i => i.get('n').properties);
            const msg = 'found node by uuid'
            logger.info({ 'result': myresult[0], 'result-summary': result.summary._stats }, msg)
            myobj = { "result": myresult[0], 'message': msg }
        })
        .catch(error => {
            logger.error(error, "Error");
            myobj = { error: error };
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
            logger.error(error, "Error");
            myobj = { error: error };
        })
    await driver.close()
    return myobj;


};

async function create(newObj) {
    logger.info("creating new Node");

    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD));
    const session = driver.session({ DB_DATABASE });
    var myobj = null;

    try {
        // Create the new node
        const createNodeResult = await session.run(`
            CREATE (n:NODE {
                \`NODE_UUID\`: "${newObj.NODE_UUID}",
                \`POST_UUID\`: "${newObj.POST_UUID}",
                \`USER_UUID\`: "${newObj.USER_UUID}",
                \`SOURCE_NODE_UUID\`: "${newObj.SOURCE_NODE_UUID}",
                \`SOURCE_EDGE_UUID\`: "${newObj.SOURCE_EDGE_UUID}",
                NODE_TYPE: "${newObj.NODE_TYPE}",
                degree: "${newObj.degree}",
                metadata: "${JSON.stringify(newObj.metadata)}"
            })
            RETURN n
        `);

        logger.info(`Created a new node ${newObj.NODE_UUID}`);

        // Create relationships with POST and USER nodes
        await session.run(`
            MATCH (n:NODE {NODE_UUID: "${newObj.NODE_UUID}"})
            MATCH (p:POST {POST_UUID: "${newObj.POST_UUID}"})
            MATCH (u:USER {USER_UUID: "${newObj.USER_UUID}"})
            CREATE (u)<-[:USER]-(n)<-[:NODES]-(u)
        `);

        logger.info(`Created relationships with POST ${newObj.POST_UUID} and USER ${newObj.USER_UUID}`);

        // Create SOURCE_NODE relationship if NODE_TYPE is "origin"
        if (newObj.NODE_TYPE === "origin") {
            await session.run(`
                MATCH (n:NODE {NODE_UUID: "${newObj.NODE_UUID}"})
                MATCH (p:POST {POST_UUID: "${newObj.POST_UUID}"})
                CREATE (n)<-[:SOURCE_NODE]-(p)
            `);

            logger.info(`Created SOURCE_NODE relationship with POST ${newObj.POST_UUID}`);
        }

        // Create EDGE_FULFILLED relationship if SOURCE_EDGE_UUID is not null
        if (newObj.SOURCE_EDGE_UUID) {
            const createEdgeFulfilledResult = await session.run(`
                MATCH (n:NODE {NODE_UUID: "${newObj.NODE_UUID}"})
                MATCH (source:NODE)-[edge:EDGE {EDGE_UUID: "${newObj.SOURCE_EDGE_UUID}"}]->()
                CREATE (n)<-[:EDGE_FULFILLED {
                    EDGE_UUID: edge.EDGE_UUID,
                    \`POST_UUID\`: edge.POST_UUID,
                    \`SOURCE_NODE_UUID\`: edge.SOURCE_NODE_UUID,
                    \`DESTINATION_NODE_UUID\`: n.NODE_UUID,
                    EDGE_QUERY: edge.EDGE_QUERY,
                    degree: edge.degree
                }]-(source)
                RETURN n
            `).then(result => {
                const myresult = result.records.map(i => i.get('n').properties);
                const msg = `Created EDGE_FULFILLED relationship with SOURCE_EDGE_UUID ${newObj.SOURCE_EDGE_UUID}`
                logger.info({ 'result': myresult[0], 'result-summary': result.summary._stats }, msg)
                myobj = { "result": myresult[0], 'message': msg }

            }).catch(error=>{
                logger.error(error, "Error");
        myobj = { error: error };
            })



        } else {
            myobj = { result: createNodeResult.records, summary: createNodeResult.summary };
        }
    } catch (error) {
        logger.error(error, "Error");
        myobj = { error: error };
    } finally {
        await driver.close();
    }

    return myobj;
}

async function deleteNode(UUID) {
    logger.info(`Deleting Node ${UUID}`)
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    var query = `
    MATCH (n:NODE)
    WHERE n.NODE_UUID = '${UUID}'
    DETACH DELETE n;
    `;
    await session.run(query)
        .then(result => {
            const myresult = result.records.map(i => i.get('n').properties);
            const msg = `Node Deleted ${UUID}`
            logger.info({ 'result': myresult[0], 'result-summary': result.summary._stats }, msg)
            myobj = { "result": myresult[0], 'message': msg }

        })
        .catch(error => {
            logger.error(error, "error");
            myobj = { "error": error }
        })
    await driver.close()
    return myobj;
};

module.exports = { deleteNode, create, findAll, findOneByUUID };