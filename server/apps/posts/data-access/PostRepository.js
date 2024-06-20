const fs = require("fs");

const neo4j = require('neo4j-driver');
require('dotenv').config()
const {
    DB_URL,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE
} = process.env;

async function findOneByUUID(PUUID) {
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`Match (p:POST{POST_UUID: ${PUUID}}) return p`)
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

async function findAll() {
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run('Match (p:POST) return p')
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

async function create(newPost) {
    console.log("PostRepository: creating new post")
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    await session.run(`
    CREATE (p:POST 
        {
            \`POST_UUID\`: "${newPost.POST_UUID}",
            \`USER_UUID\`: "${newPost.USER_UUID}", 
            \`SOURCE_NODE_UUID\`: "${newPost.SOURCE_NODE_UUID}", 
            title: "${newPost.title}", 
            description: "${newPost.description}", 
            fulfilled: "${newPost.fulfilled}" })
            
        WITH p
        MATCH (u:USER {USER_UUID: "${newPost.USER_UUID}"})
        CREATE (u)<-[:USER]-(p)<-[:POSTS]-(u)   
        ;`)
        .then(result => {
            console.log(`Created a new post ${newPost.POST_UUID} \n ${result.records}`)
            myobj = { "result": result.records, "summary": result.summary }
        })
        .catch(error => {
            console.log("error", error);
            myobj = { "error": error }
        })
        await driver.close()
    return myobj;
};

async function deletePost(UUID) {
    console.log("PostRepository: Deleting Post ", UUID)
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    const session = driver.session({ DB_DATABASE });
    var myobj = null;
    var query = `
    MATCH (post:POST {POST_UUID: '${UUID}'})
    OPTIONAL MATCH (nodes:NODE {POST_UUID: post.POST_UUID})
    DETACH DELETE post, nodes
`;
    await session.run(query)
        .then(result => {
            console.log("PostRepository: Deleted post successfully. Result is", result.records)
            myobj = { "result": result.records, "summary": result.summary }
        })
        .catch(error => {
            console.log("error", error);
            myobj = { "error": error }
        })
        await driver.close()
    return myobj;
};

module.exports = { deletePost, create, findAll, findOneByUUID };