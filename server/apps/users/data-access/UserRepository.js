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
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`
        CREATE (u:USER{
            USER_UUID: "${obj.USER_UUID}", 
            USER_ROLE: "${obj.USER_ROLE}",
            username: "${obj.username},
            first_name: "${obj.first_name}", 
            last_name: "${obj.last_name}", 
            \`email\`: "${obj.email}", 
            password: "${obj.password}", 
            mobile: "${obj.mobile}" 
        })
        return u;`)
        .then(result => {
            const myresult = result.records.map(i => i.get('u').properties);
            const msg = 'user created'
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

async function deleteUser(UUID) {
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    var query = `
    MATCH (u:USER)
    WHERE u.USER_UUID = "${UUID}"
    DETACH DELETE u;`;
    await session.run(query)
        .then(result => {
            const myresult = result.records.map(i => i.get('u').properties);
            const msg = 'user deleted'
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

module.exports = { createAnonymous, deleteUser, create, findAll, findOneByUUID };