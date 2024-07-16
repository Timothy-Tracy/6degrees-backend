const fs = require("fs");
const requests = require("./users.json");
const neo4j = require('neo4j-driver');
require('dotenv').config()
const {
    DB_URL,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE
} = process.env;
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'UserRepository' });
const errorHandler = require('../../../lib/error/errorHandler.js')
const Neo4jDriver = require('../../db/neo4j/data-access/Neo4jDriver.js')



async function findOneByUUID(uuid) {
    logger.trace(`Finding User By UUID ${uuid}`)
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`Match (u:USER{\`USER_UUID\`: '${uuid}'}) return u`)
        .then(result => {
            const myresult = result.records.map(i => i.get('u').properties);
            const msg = 'found user by uuid'
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
    await session.run('Match (u:USER) return u')
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

async function create(obj) {
    const log = logger.child({'function': 'create'});
    const start = process.hrtime();
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`
        CREATE (u:USER{
            USER_UUID: "${obj.USER_UUID}", 
            USER_ROLE: "${obj.USER_ROLE}",
            username: '${obj.username}',
            firstName: '${obj.firstName}', 
            lastName: '${obj.lastName}', 
            \`email\`: "${obj.email}", 
            password: "${obj.password}", 
            mobile: "${obj.mobile}",
            followerCount: 0,
            followingCount: 0,
            friendCount:0,
            friendRequestCount:0,
            createdAt: "${new Date().toISOString()}",
        })
        return u;`)
        .then(result => {
            const myresult = result.records.map(i => i.get('u').properties);
            const msg = 'user created'
            log.info({ 'result': myresult[0], 'result-summary': result.summary._stats }, msg)
            myobj = { "result": myresult[0], 'message': msg }
        })
        .catch(error => {
            log.error('Caught an error', error.name)
            
            throw error;
            // log.error(error, "Error");
            // myobj = { error: error };
        })
    await driver.close();
    log.logperf(process.hrtime(start))
    return myobj;
};

async function createAnonymous(user) {
    console.log("UserRepository: Creating anonymous user")
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`
    CREATE (u:USER 
        {
            USER_UUID: "${user.USER_UUID}", 
            name: "${user.name}",
            isAnonymous : "true"
        })
        return u;`)
        .then(result => {
            const myresult = result.records.map(i => i.get('u').properties);
            const msg = 'anonymous user created'
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

async function deleteUser(uuid) {
    //initialize vars
    let output = {};
    //initialize logs
    const log = logger.child({ 'function': 'findAllOwnedBy' });
    log.trace();
    //initialize driver
    let driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
   
    var myobj = null;
    var query = `
        MATCH (u:USER)
        WHERE u.USER_UUID = "${uuid}"
        DETACH DELETE u;
    `;
    await session.run(query)
        .then(result => {
            const myresult = result.records.map(i => i.get('u').properties);
            output.message = 'User deleted.'
            output.data = myresult[0];
            output.summary = result.summary.counters._stats;
        })
        .catch(error => {
            throw error
        })
    log.info(output)
    return output;
};



async function follow(obj){
    let output = {};

    const log = logger.child({'function' : 'follow'});
    log.trace();

    const driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    const query = `
        MATCH (source:USER {USER_UUID:"${obj.source}"})
        MATCH (destination:USER {username:"${obj.destination}"})
        CREATE (source)-[:FOLLOWS]->(destination)
        SET source.followingCount = source.followingCount +1
        set destination.followerCount = destination.followerCount+1;
    `
    await session.run(query)
    .then(result =>{
        output.summary = result.summary.counters._stats;
        output.message = `User ${obj.source} followed ${obj.destination} in the database`
    })
    .catch(error=>{
        throw error
    })
    log.info(output);
    return output;
}

async function unfollow(obj){
    let output = {};

    const log = logger.child({'function' : 'follow'});
    log.trace();

    const driver = Neo4jDriver.initDriver();
    const session = driver.session({ DB_DATABASE });
    const query = `
        MATCH (source:USER {USER_UUID:"${obj.source}"})
        MATCH (destination:USER {username:"${obj.destination}"})
        MATCH (source)-[rel:FOLLOWS]->(destination)
        DELETE rel
        SET source.followingCount = source.followingCount -1
        set destination.followerCount = destination.followerCount-1;
    `
    await session.run(query)
    .then(result =>{
        output.summary = result.summary.counters._stats;
        output.message = `User ${obj.source} unfollowed ${obj.destination} in the database`
    })
    .catch(error=>{
        throw error
    })
    log.info(output);
    return output;
}
module.exports = { createAnonymous, deleteUser, create, findAll, findOneByUUID, follow, unfollow };