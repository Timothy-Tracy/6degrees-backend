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
const {AppError} = require('../../../lib/error/customErrors.js')

async function findOneByUUID(UUID) {
    logger.info("Finding Comment By UUID ", UUID)
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`Match (c:COMMENT{\`COMMENT_UUID\`: '${UUID}'}) return c`)
        .then(result => {
            const myresult = result.records.map(i => i.get('c').properties);
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

async function create(newObj) {
    const log = logger.child({'function' : 'create'});
    log.trace();
    log.debug("creating new comment");

    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD));
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    log.info(newObj)

    
        // Create the new node
        const createNodeResult = await session.run(`
            CREATE (c:COMMENT {
                \`COMMENT_UUID\`: "${newObj.COMMENT_UUID}",
                \`content\`: "${newObj.content}",
                \`createdAt\`: "${newObj.createdAt}",
                \`updatedAt\`: "${newObj.createdAt}" 
            })
            WITH c
MATCH (n:NODE {NODE_UUID: "${newObj.NODE_UUID}"})
MATCH (p:POST {POST_UUID: "${newObj.POST_UUID}"})
MATCH (u:USER {USER_UUID: "${newObj.USER_UUID}"})
MATCH (parentComment:COMMENT {COMMENT_UUID: "${newObj.PARENT_COMMENT_UUID}"})

CREATE (u)<-[:PARENT_USER]-(c)<-[:CHILD_COMMENT]-(u)
CREATE (c)<-[:CHILD_COMMENT]-(n)<-[:PARENT_NODE]-(c)
CREATE (c)<-[:CHILD_COMMENT]-(parentComment)<-[:PARENT_COMMENT]-(c);
        `).then(result => {
            const myresult = result.records.map(i => i.get('c').properties);
            log.info(result.records)
            
            const msg = ("created comment ", result.records)
            log.info(msg)
            myobj = { "result": myresult, "summary": result.summary }
        }).catch(error => {
            logger.error(error, "error");
            myobj = { "error": error }
        })

        logger.info(`Created a new comment ${newObj.COMMENT_UUID}`);

        // Create relationships
        

    
     await driver.close();
    log.debug('closed driver')

    return myobj;
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



module.exports = { deleteComment, create, findAllOwnedBy, findOneByUUID,  };