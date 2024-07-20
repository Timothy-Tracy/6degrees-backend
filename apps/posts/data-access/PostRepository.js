const neo4j = require('neo4j-driver');
require('dotenv').config()
const { DB_URL, DB_USERNAME, DB_PASSWORD, DB_DATABASE} = process.env;
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'PostRepository' });
const Neo4jDriver = require('../../db/neo4j/data-access/Neo4jDriver.js')

async function findAllOwnedBy(uuid) {
    let output = {};
    const log = logger.child({ 'function': 'findAllOwnedBy' });
    log.trace();
    let driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    
    await session.run(`Match (u:USER {USER_UUID: "${uuid}"})-[:PARENT_USER]-(p) return p`)
    .then(result => {
        const myresult = result.records.map(i => i.get('p').properties.NODE_UUID);
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

async function findAllCommentsByPostUUID(uuid){
    let output = {};
    const log = logger.child({ 'function': 'findAllCommentsByPostUUID' });
    log.trace(uuid);
    let driver = await Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    await session.run(`
        MATCH (c:COMMENT)-[:PARENT_POST]-(p:POST {POST_UUID: "${uuid}"})
        MATCH (c)-[:PARENT_USER]-(u:USER)
        RETURN c {.*, username: u.username} AS c
        `)
    .then(result => {
        log.debug(result)
        if (result.records.length>0){
            log.debug('comments found')
            const comments = result.records.map(record => record._fields[0]);
            output.data = comments
            log.debug(output.data)
        } else {
            log.debug('no comments found')
        }
        
    })
    .catch(error => {
        throw error;
    })
        
    log.debug(output)
    return output;
}

async function findOneByQuery(query){
    let output = {data : {}};
    //Initialize logger
    const log = logger.child({'function':'findOneByQuery'});
    log.trace();
    //Initialize DB
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    await session.run(
        `
        MATCH (n:NODE)-[e:EDGE{EDGE_QUERY:"${query}"}]-()
        MATCH (p:POST)-[:PARENT_POST]-(n)
        RETURN p,n;
        `
    ).then(result=>{
       
        const post = result.records.map(i => i.get('p').properties);
        const node = result.records.map(i => i.get('n').properties);
     
        output.data.post = post;
        output.data.node = node;
        
        log.debug(result.records)
        log.debug(post)
        log.debug(node)

    }).catch(error=>{
        log.error(error);
        throw error;
    })
    driver.close();
    return output;

}

async function findOneByUUID(uuid) {
    let output = {};
    logger.debug(`finding post by uuid ${uuid}`)
    const driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`Match (p:POST{\`POST_UUID\`: '${uuid}'}) return p`)
    .then(result => {
        const myresult = result.records.map(i => i.get('p').properties);
        const msg = 'found post by uuid'
        logger.info({ 'result': myresult, 'result-summary': result.summary._stats }, msg)
        myobj = { "result": myresult, 'message': msg }
    })
    .catch(error => {
        logger.error(error, "Error");
        myobj = { error: error };
    })
        await driver.close()
    return myobj;
};


async function create(obj) {
    let output = {};

    const log = logger.child({'function':'create'})
    log.trace();

    const driver = await Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    const date = new Date().toISOString()
    await session.run(`
    CREATE (p:POST 
        {
            \`POST_UUID\`: "${obj.POST_UUID}",
            title: "${obj.title}", 
            body: "${obj.body}", 
            views : 0,
            comments:0,
            shares: 0,
            visibility:"public",
            createdAt:"${date}"
    })
            
        WITH p
        MATCH (u:USER {USER_UUID: "${obj.USER_UUID}"})
        CREATE (u)<-[:PARENT_USER]-(p)<-[:CHILD_POST]-(u)   
        ;`)
        .then(result => {
            log.debug(result)
            output.summary=result.summary.counters._stats;
            output.message = `Created a new post ${obj.POST_UUID}`
        })
        .catch(error => {
            throw error;
        })
    log.debug(output)
    return output;
};

async function deletePost(uuid) {
    let output = {}
    const log = logger.child({'function':'deletePost'});
    log.trace();
    const driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    var query = `
    MATCH (post:POST {POST_UUID: "${uuid}"})
    OPTIONAL MATCH (post)-[:CHILD_NODE]->(node:NODE)
    OPTIONAL MATCH (node)<-[:PARENT_NODE]-(comment:COMMENT)
    WITH post, collect(DISTINCT node) AS nodes, collect(DISTINCT comment) AS comments
    UNWIND nodes + comments + [post] AS elementToDelete
    DETACH DELETE elementToDelete
    RETURN count(elementToDelete) AS deletedCount
`;
    await session.run(query)
        .then(result => {
            log.debug(result)
            output.summary = result.summary.counters._stats;
            output.message = `Deleted post ${uuid} and all associated nodes and comments`
        })
        .catch(error => {
            throw error
        })
    log.debug(output)
    return output;
};

module.exports = { deletePost, create,  findOneByUUID, findOneByQuery, findAllOwnedBy, findAllCommentsByPostUUID };