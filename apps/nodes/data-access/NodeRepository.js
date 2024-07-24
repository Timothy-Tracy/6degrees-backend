
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
const { AppError } = require('../../../lib/error/customErrors.js');
const Neo4jDriver = require('../../db/neo4j/data-access/Neo4jDriver.js')




async function findOneByUUID(UUID) {
    let output = { data: {} };
    logger.info("Finding Node By UUID ", UUID)
    const driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`
        Match (n:NODE{NODE_UUID: "${UUID}"}) 
        MATCH (n)-[:PARENT_USER]-(u:USER)
        OPTIONAL MATCH (n)-[e:EDGE]-()
        return n {.*, username:u.username, EDGE_QUERY:e.EDGE_QUERY} AS n
        `)
        .then(result => {
            const node = result.records.map(record => (record._fields[record._fieldLookup.n]))
            const msg = 'found node by uuid'
            output.data.node = node[0]

        })
        .catch(error => {
            throw error
        })
    logger.info(output, 'findOneByUUID result')
    return output;
};

async function findAllOwnedBy(uuid) {
    let output = {};
    const log = logger.child({ 'function': 'findAllOwnedBy' });
    log.trace();
    let driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    
    await session.run(`Match (u:USER {USER_UUID: "${uuid}"})-[:CHILD_NODE]-(n) return n`)
    .then(result => {
        const myresult = result.records.map(i => i.get('n').properties.NODE_UUID);
        console.log(myresult)
        output.data = myresult;
        output.message = `found all nodes owned by ${uuid}`;
        output.summary = result.summary;
    })
    .catch(error => {
        throw error

    })
    return output;


};
/**
 * @function userHasNodeInPost
 * 
 * @param {*} USER_UUID 
 * @param {*} POST_UUID 
 * @returns boolean
 * @description A function that determines if a user already has a node associated with a post
 */
async function userHasNodeInPost(USER_UUID, POST_UUID) {
    let output = {data:{}};
    const log = logger.child({ 'function': 'userHasNodeInPost' });
    log.trace();
    //Initialize Drivers
    let driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    await session.run(
        `
            MATCH (p:POST {POST_UUID: "${POST_UUID}"})
            MATCH (u:USER {USER_UUID: "${USER_UUID}"})
            OPTIONAL MATCH (u)-[:CHILD_NODE]->(n:NODE)-[:PARENT_POST]->(p)
            RETURN EXISTS((u)-[:CHILD_NODE]->(:NODE)-[:PARENT_POST]->(p)) AS result, n
        `
    ).then(result => {
        log.info(result)
        let boolean = result.records.map(record => (record._fields[record._fieldLookup.result]))
        let node = result.records.map(record => (record._fields[record._fieldLookup.n]))
        output.data.boolean = boolean[0];
        if(node[0] != null)output.data.node = node[0].properties.NODE_UUID
        if (output.data.boolean) {
            log.info(output.data.boolean)

            log.info('User Has Node In Post == true')
        } else {
            log.info(output.data.boolean)

            log.info('User Has Node In Post == false')

        }
    })
    log.info(output)
    return output;

}

async function initNode(obj) {
    //init vars
    let output = { data: {} };
    //init logs
    const log = logger.child({ 'function': 'initNode' });
    log.trace();
    //init drivers
    let driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    await session.run(`
        CREATE (n:NODE {
            \`NODE_UUID\`: "${obj.NODE_UUID}",
            NODE_TYPE: "${obj.NODE_TYPE}",
            degree: "${obj.degree}",
            metadata: "${JSON.stringify(obj.metadata)}",
            createdAt: "${new Date().toISOString()}",
            views: 0,
            points: 0,
            comments: 0,
            shares: 0,
            visibility:"public"
        })
        RETURN n;
    `).then(result => {
        const x = result.records.map(i => i.get('n').properties);
        output.data = x[0];
        output.summary = result.summary.counters._stats;
        log.info(output, 'Created a new node in the database.')
    }).catch(error => {
        throw error
    });
    return output;
}
async function initNodeRelationships(obj) {
    //init vars
    let output = { data: {} };
    //init logs
    const log = logger.child({ 'function': 'initNodeRelationships' });
    log.trace();
    //init drivers
    let driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    await session.run(`
        MATCH (n:NODE {NODE_UUID: "${obj.NODE_UUID}"})
        MATCH (p:POST {POST_UUID: "${obj.POST_UUID}"})
        MATCH (u:USER {USER_UUID: "${obj.USER_UUID}"})
        CREATE (u)<-[:PARENT_USER]-(n)<-[:CHILD_NODE]-(u)
        CREATE (p)<-[:PARENT_POST]-(n)<-[:CHILD_NODE]-(p)
        SET n.owned = CASE WHEN u.isAnonymous = 'true' THEN 'false' ELSE 'true' END
    `).then(result => {
        output.summary = result.summary.counters._stats;
        log.info(output, 'Initialized node relationships in the database.')
    }).catch(error => {
        throw error
    });
    return output;
}
async function initSourceNodeRelationships(obj) {
    //init vars
    let output = { data: {} };
    //init logs
    const log = logger.child({ 'function': 'initSourceNodeRelationships' });
    log.trace();
    //init drivers
    let driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    await session.run(`
        MATCH (n:NODE {NODE_UUID: "${obj.NODE_UUID}"})
        MATCH (p:POST {POST_UUID: "${obj.POST_UUID}"})
        CREATE (n)<-[:SOURCE_NODE]-(p);
    `).then(result => {
        output.summary = result.summary.counters._stats;
        log.info(output, 'Initialized source node relationships in the database.')
    }).catch(error => {
        throw error
    });
    return output;
}
async function initEdgeFulfilledRelationships(obj) {
    //init vars
    let output = { data: {} };
    //init logs
    const log = logger.child({ 'function': 'initEdgeFulfilledRelationships' });
    log.trace();
    //init drivers
    let driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    await session.run(`
        MATCH (destination:NODE {NODE_UUID: "${obj.NODE_UUID}"})
        MATCH (p:POST {POST_UUID:"${obj.POST_UUID}"})
        MATCH (source:NODE)-[edge:EDGE {EDGE_UUID: "${obj.SOURCE_EDGE_UUID}"}]->()
        CREATE (destination)<-[edgeFulfilled:EDGE_FULFILLED {
        EDGE_UUID: edge.EDGE_UUID,
        EDGE_QUERY: edge.EDGE_QUERY,
        degree: edge.degree
        }]-(source)
        SET source.shares = source.shares + 1
        
        SET p.shares = p.shares + 1
        RETURN destination,edgeFulfilled,source;
    `).then(result => {
        const x = result.records.map(i => i.get('edgeFulfilled').properties);
        output.data = x
        output.summary = result.summary.counters._stats;
        log.info(output, 'Initialized edge fulfilled relationships in the database.')
    }).catch(error => {
        throw error
    });
    return output;
}

async function create(obj) {
    let output = { };
    const log = logger.child({ 'function': 'create' });
    log.trace();
    log.debug(obj, 'INPUT');

    //Check if a user already has a node in the post
    const x = await userHasNodeInPost(obj.USER_UUID, obj.POST_UUID);
    log.info(x)
    if (x.data.boolean == true) {
        output.message = 'user has node in post'
        output.existingNode = true;
        output.node = await findOneByUUID(x.data.node)
        return output;
        throw new AppError('User Already Has Node In Post', 403)
    } 
    log.info('user does not have node in post')
    //create the node in the db
    output.createNodeResult = await initNode(obj);

    //create the node relationships in the db
    output.createNodeRelationshipsResult = await initNodeRelationships(obj);

    if (obj.NODE_TYPE === "origin") {
        // Create SOURCE_NODE relationship if NODE_TYPE is "origin"
        output.createSourceNodeRelationshipsResult = await initSourceNodeRelationships(obj);
    }

    // if the obj has a SOURCE_EDGE_UUID property 
    // Create EDGE_FULFILLED relationship
    if (obj.SOURCE_EDGE_UUID) {
        output.createEdgeFulfilledResult = await initEdgeFulfilledRelationships(obj);
    }


    log.info(output, 'FINAL OUTPUT');
    return output;
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

async function takeOwnership(obj) {
    const log = logger.child({ 'function': 'takeOwnership', 'params': obj });
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    let node = await findOneByUUID(obj.NODE_UUID);
    if (node.owned == false) {
        var myobj = null;
        var query = `
    MATCH (n:NODE {NODE_UUID: '${obj.NODE_UUID}'})
    WITH n
    MATCH (n)-[:USER]->(a:USER)
    MATCH (u:USER {USER_UUID: '${obj.USER_UUID}'})
    CREATE (u)-[:NODES]->(n)
    CREATE (n)-[:USER]->(u)
    SET n.USER_UUID = '${obj.USER_UUID}'
    DETACH DELETE a
    RETURN u;
    `;
        await session.run(query)
            .then(result => {
                const myresult = result.records.map(i => i.get('u').properties);
                const msg = `User ${myresult.username} successfully took ownership of node ${obj.NODE_UUID}`
                logger.info({ 'result': myresult[0], 'result-summary': result.summary._stats }, msg)
                myobj = { 'message': msg, 'success': true }
            }

            ).catch(error => {
                throw error;
            })
    } else {
        throw new AppError('Node is already owned', 201);
    }


    await session.close;
    await driver.close;
    return myobj;
}

/**
 * @function findDistributionPathAndAward
 * @param {*} uuid 
 * @description Find the distribution path from the source node to the provided node
 * Every node in that chain will be awarded 1 point.
 */

//TODO: Proper logging
async function findDistributionPathAndAward(uuid, points) {
    const log = logger.child({ 'function': 'findDistributionPath', 'params': uuid });
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    const query = `
    MATCH (start:NODE {NODE_UUID: '${uuid}'})
    MATCH path = (start)<-[:EDGE_FULFILLED*]-(end:NODE)
    WHERE end.degree = '0' 
    WITH path
    FOREACH (n IN nodes(path) | 
        SET n.points = CASE 
            WHEN n.points IS NULL THEN ${points} 
            ELSE n.points + ${points} 
        END
    )
    RETURN path, [n IN nodes(path) | n.points] AS node_points
`;
    await session.run(query)
        .then(result => {
            const myresult = result.records.map(i => i.get('path').properties);
            const msg = `Found all nodes in path and rewarded them with a point`
            log.info({ 'result': myresult[0], 'result-summary': result.summary._stats }, msg)
            myobj = { 'message': msg, 'success': true }
        }

        ).catch(error => {
            throw error;
        })
}

async function findDistributionPathByQuery(query){
        //init vars
        let output = { };
        //init logs
        const log = logger.child({ 'function': 'findDistributionPathByQuery' });
        log.trace();
        //init drivers
        let driver = Neo4jDriver.initDriver();
        const session = driver.session({ DB_DATABASE });
        await session.run(`
            MATCH (start:NODE)-[:EDGE {EDGE_QUERY:"${query}"}]-()
            MATCH path = (start)-[:EDGE_FULFILLED*]-(end:NODE)
WHERE end.degree = '0'
WITH path, nodes(path) AS nodesInPath
UNWIND nodesInPath AS node
OPTIONAL MATCH (node)-[:PARENT_USER]->(user:USER)
WITH path, collect({
  node: node,
  username: user.username
}) AS nodesWithUsernames
RETURN nodesWithUsernames As n
        `).then(result => {
            log.info(result)
            const nodes = result.records[0]._fields[0].map(record => {
                let out = {}
                log.info(record, "fields")
                out = record.node.properties
                out.username = record.username
                return out
            });
            log.info(nodes)
            output.nodes = nodes
            output.summary = result.summary.counters._stats;
            log.info(output, 'found path')
        }).catch(error => {
            throw error
        });
        log.info(output)
        return output;
}

module.exports = { deleteNode, create, findAllOwnedBy, findOneByUUID, takeOwnership, findDistributionPathAndAward, userHasNodeInPost, findDistributionPathByQuery };