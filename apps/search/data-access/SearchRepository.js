const neo4j = require('neo4j-driver');
require('dotenv').config()
const {DB_DATABASE} = process.env;
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'SearchRepository' });
const {AppError, DatabaseError} = require('../../../lib/error/customErrors.js');
const Neo4jDriver = require('../../db/neo4j/data-access/Neo4jDriver.js');

const driver = Neo4jDriver.initDriver();

async function autocompleteSearch(obj){
    let output = {}
    const {label, prefix, property} = obj
    const log = logger.child({'function':'autocompleteSearch'})
    log.trace(obj);

    let query = `
    MATCH (n:${label}) WHERE n.${property} STARTS WITH "${prefix}"
    RETURN n.username AS suggestion
    LIMIT 5
    `
    const session = driver.session({ DB_DATABASE })
    await session.run(query)
    .then((result) => {
        output = result.records.map(record=> record.get('suggestion'))
    })
    .catch((error)=>{throw error})
    .finally(()=> session.close())

    return output
}

module.exports = {autocompleteSearch}