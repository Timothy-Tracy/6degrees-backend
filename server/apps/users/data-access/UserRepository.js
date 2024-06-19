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

async function findOneByUUID(UUUID) {
    console.log("Finding User By UUID ", UUUID)
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`Match (u:USER{\`USER_UUID\`: '${UUUID}'}) return u`)
        .then(result => {
            var results = [];
            result.records.map(i => {
                results.push(i.get('u').properties)
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

async function create(newUser) {
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`
    CREATE (u:USER 
        {
            USER_UUID: "${newUser.USER_UUID}", 
            first_name: "${newUser.first_name}", 
            last_name: "${newUser.last_name}", 
            \`email\`: "${newUser.email}", 
            password: "${newUser.password}", 
            mobile: "${newUser.mobile}" });`)
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
        });`)
        .then(result => {
            console.log("Creating Anonymous User Fulfilled, result is", result)
            myobj = { "result": result.records, "summary": result.summary }
        })
        .catch(error => {
            console.log("error", error);
            myobj = { "error": error }
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

module.exports = { createAnonymous, deleteUser, create, findAll, findOneByUUID };