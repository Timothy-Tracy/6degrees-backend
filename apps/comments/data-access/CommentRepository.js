const neo4j = require('neo4j-driver');
require('dotenv').config()
const {
    DB_URL,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE
} = process.env;
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'CommentRepository' });
const {AppError} = require('../../../lib/error/customErrors.js');
const Neo4jDriver = require('../../db/neo4j/data-access/Neo4jDriver.js');
const Neo4jRepository = require('../../db/neo4j/data-access/Neo4jRepository.js');


async function findAllOwnedBy(obj) {
    const log = logger.child({'function' : 'findAllOwnedBy'});
    log.trace();
    log.debug(`finding all comments owned by ${obj.USER_UUID}`);
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`Match (c:COMMENT {USER_UUID : '${obj.USER_UUID}'}) return c`)
        .then(result => {
            const myresult = result.records.map(i => i.get('c').properties);
            console.log(result.records)
            const msg = ("found all comments owned by ", result.records)
            myobj = { "result": myresult, "summary": result.summary }

        })
        .catch(error => {
            throw error
            
        })
    await driver.close()
    return myobj;


};

async function initComment(obj){
    let output = {};

    const log = logger.child({'function' : 'initComment'});
    log.trace();

    const driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    const query = `
        CREATE (c:COMMENT {
            \`COMMENT_UUID\`: "${obj.COMMENT_UUID}",
            \`body\`: "${obj.body}",
            \`createdAt\`: "${obj.createdAt}",
            \`updatedAt\`: "${obj.createdAt}",
            visibility: "public" 
        })
    `
    await session.run(query)
    .then(result =>{
        const myresult = result.records.map(i => i.get('c').properties);
        output.data = myresult;
        output.summary = result.summary.counters._stats;
        output.message = `Created comment ${obj.COMMENT_UUID} in the database`


    })
    .catch(error=>{
        throw error
    })
    log.info(output);
    return output;

}

async function checkParentComment(obj){
    let output = {};

    const log = logger.child({'function' : 'checkParentComment'});
    log.trace();
    if(!obj.PARENT_COMMENT_UUID){
        return null;
    }
    if(!(Neo4jRepository.hasRelationship(
        ['COMMENT','POST'],
        ['COMMENT_UUID', 'POST_UUID'],
        [obj.PARENT_COMMENT_UUID,obj.POST_UUID],
        'PARENT_POST'
    ))){
        return null
    }


    const driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    const query = `
        MATCH (comment:COMMENT {COMMENT_UUID:"${obj.COMMENT_UUID}"})
        MATCH (parentComment:COMMENT {COMMENT_UUID:"${obj.PARENT_COMMENT_UUID}"})
        CREATE (comment)-[:PARENT_COMMENT]->(parentComment)
        CREATE (comment)<-[:CHILD_COMMENT]-(parentComment);
    `
    await session.run(query)
    .then(result =>{
        output.summary = result.summary.counters._stats;
        output.message = `Created parent comment relationshi[ ${obj.COMMENT_UUID}->${obj.PARENT_COMMENT_UUID} in the database`
    })
    .catch(error=>{
        throw error
    })
    log.info(output);
    return output;

}

async function createCommentRelationships(obj){
    let output = {};

    const log = logger.child({'function' : 'createCommentRelationships'});
    log.trace();

    const driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    const query = `
        MATCH (c:COMMENT {COMMENT_UUID:"${obj.COMMENT_UUID}"})
        MATCH (n:NODE {NODE_UUID: "${obj.NODE_UUID}"})
        MATCH (p:POST {POST_UUID: "${obj.POST_UUID}"})
        MATCH (u:USER {USER_UUID: "${obj.USER_UUID}"})

        CREATE (u)<-[:PARENT_USER]-(c)
        CREATE (c)<-[:CHILD_COMMENT]-(n)<-[:PARENT_NODE]-(c)
        CREATE (c)-[:PARENT_POST]->(p)

        SET n.comments = n.comments + 1
        SET p.comments = p.comments +1;
        
    `
    await session.run(query)
    .then(result =>{
        output.summary = result.summary.counters._stats;
        output.message = `Created comment ${obj.COMMENT_UUID} in the database`
    })
    .catch(error=>{
        throw error
    })
    log.info(output);
    return output;
}

async function create(obj) {
    let output = {};

    const log = logger.child({'function' : 'create'});
    log.trace();

    output.createCommentResult = await initComment(obj);
    output.parentCommentResult = await checkParentComment(obj);
    output.createCommentRelationshipsResult = await createCommentRelationships(obj);

    return output;
}

async function deleteComment(UUID) {
    logger.info(`Deleting Comment ${UUID}`)
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    var query = `
    MATCH (c:Comment)
    WHERE c.COMMENT_UUID = '${UUID}'
    DETACH DELETE c;
    `;
    await session.run(query)
        .then(result => {
            const myresult = result.records.map(i => i.get('c').properties);
            const msg = `Comment Deleted ${UUID}`
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



module.exports = { deleteComment, create, findAllOwnedBy,   };