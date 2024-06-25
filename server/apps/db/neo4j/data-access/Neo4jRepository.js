const neo4j = require('neo4j-driver');
require('dotenv').config()
const {
    DB_URL,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE
} = process.env;
const mylogger = require('../../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'Neo4jRepository' });


async function findOneAndGetAttributes(label, searchParam, searchValue, attributesToReturn) {
    const log = logger.child({'function':'findOneAndGetAttributes'});
    log.info('hello')
    const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))

    const session = driver.session();
    
      const attributeString = attributesToReturn.map(attr => `n.${attr} AS ${attr}`).join(', ');
      const query = `
        MATCH (n:${label} {${searchParam}: $searchValue})
        RETURN ${attributeString}
      `;
  
      const myobj = await session.run(query, { searchValue })
      .then(result => {
        if (result.records.length === 0) {
            return null; // No matching node found
          }
      
          if (result.records.length > 1) {
            throw new Error(`Multiple nodes found for ${searchParam}: ${searchValue}`);
          }
          log.info('hekko2')
          const record = result.records[0];
          log.info(record)
          return attributesToReturn.reduce((acc, attr) => {
            acc[attr] = record.get(attr);
            
            return acc;
          }, {});
      }).catch(error =>{
        throw error
        
      })

    await session.close();
    return myobj;
    
      
  
      
  
  }

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




module.exports = { findOneAndGetAttributes};