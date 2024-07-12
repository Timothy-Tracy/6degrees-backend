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
const {AppError} = require('../../../../lib/error/customErrors.js');

/**
 * 
 * @param {@} label 
 * @param {*} searchParam 
 * @param {*} searchValue 
 * @param {*} attributesToReturn 
 * @returns 
 */
async function findOneAndGetAttributes(label, searchParam, searchValue, attributesToReturn) {
  const log = logger.child({ 'function': 'findOneAndGetAttributes' });
  log.info('hello')
  const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))

  const session = driver.session();

  const attributeString = attributesToReturn.map(attr => `n.${attr} AS ${attr}`).join(', ');
  if (typeof searchValue === 'string') {
    log.debug('searchValue is a string')
    searchValue = `\"${searchValue}\"`;
    log.debug(searchValue)
  }
  const query = `
        MATCH (n:${label} {${searchParam}: ${searchValue}})
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
    }).catch(error => {
      throw error

    })

  await session.close();
  return myobj;





}
/**
 * 
 * @param {@} label 
 * @param {*} attr 
 * @param {*} value 
 * @param {*} attributesToReturn 
 * @returns 
 */
async function findOneAndSetAttribute(label, searchParam, searchValue, attr, attrValue, attributesToReturn) {
  const log = logger.child({ 'function': 'findOneAndSetAttribute' });
  const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))

  const session = driver.session();

  const attributeString = attributesToReturn.map(attr => `n.${attr} AS ${attr}`).join(', ');
  if (typeof searchValue === 'string') {
    log.debug('searchValue is a string')
    searchValue = `\"${searchValue}\"`;
    log.debug(searchValue)
  }
  const query = `
        MATCH (n:${label} {${searchParam}: ${searchValue}})
        SET n.${attr} = ${attrValue}
        RETURN ${attributeString};
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
    }).catch(error => {
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

async function findOneAndUpdate(label, searchParam, searchValue, obj) {
  let output = {};
  const log = logger.child({ 'function': 'findOneAndUpdate' });
  const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))

  const session = driver.session();
  if (typeof searchValue === 'string') {
    searchValue = `\"${searchValue}\"`;
  }


  const y = await session.run(`MATCH (x:${label} {${searchParam}: ${searchValue}}) SET x += $obj RETURN x;`,{obj:obj})
  .then(result => {
    log.info(result)
    const x = result.records.map(i => i.get('x').properties);
    output.message = `Updated ${label} ${searchParam}: ${searchValue}`
    output.data = x[0];
    output.summary = result.summary.counters._stats;

  })
  .catch(error => {
    log.error(error)
    throw error
  })

  log.info(output)
  return output;
}
async function hasRelationship(labels, searchParams, searchValues, relationship) {
  let output = {};
  const log = logger.child({ 'function': 'verifyRelationship' });
  const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))

  const session = driver.session();
  searchValues = searchValues.map(element => {
    if (typeof element === 'string') {
      return `\"${element}\"`;
    }
    return element;
  });
  
  if(await exists(labels[0], searchParams[0],searchValues[0]) && await exists(labels[1], searchParams[1],searchValues[1])){

  } else {
    throw new AppError('resource does not exist', 500)
  }
  
  const y = await session.run(`
    MATCH (x:${labels[0]} {${searchParams[0]}: ${searchValues[0]}}) 
    MATCH (y:${labels[1]} {${searchParams[1]}: ${searchValues[1]}})
    RETURN EXISTS ((x)-[:${relationship}]-(y)); 
    `)
  .then(result => {
    log.info(result)
    output = result.records[0]._fields[0];
        if (output) {
            log.info(`relationship (:${labels[0]} {${searchParams[0]}: ${searchValues[0]}})-[:${relationship}]-(${labels[1]} {${searchParams[1]}: ${searchValues[1]}}) == true`)
        } else {
            log.info(`relationship (:${labels[0]} {${searchParams[0]}: ${searchValues[0]}})-[:${relationship}]-(${labels[1]} {${searchParams[1]}: ${searchValues[1]}}) == false`)
        }
  })
  .catch(error => {
    log.error(error)
    throw error
  })
  return output;
}
async function exists(label, searchParam, searchValue) {
  let output = {};
  const log = logger.child({ 'function': 'exists' });
  const driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))

  const session = driver.session();
  if (typeof searchValue === 'string') {
    if(!(searchValue[0] == '\"' && searchValue[searchValue.length-1] == '\"')){
      searchValue = `\"${searchValue}\"`;
    }
    
  }


  const y = await session.run(`
    OPTIONAL MATCH (x:${label} {${searchParam}: ${searchValue}}) 
    RETURN CASE WHEN x IS NOT NULL THEN true ELSE false END AS nodeExists;
    `)
  .then(result => {
    log.info(result, "Exist result")
    const nodeExists = result.records[0].get('nodeExists');
    
    output = nodeExists;
        if (output) {
            log.info(`(:${label} {${searchParam}: ${searchValue}}) exists == true`)
        } else {
          log.info(`(:${label} {${searchParam}: ${searchValue}}) exists == true`)
        }

  })
  .catch(error => {
    log.error(error)
    throw error
  })

  log.info(output)
  return output;
}



module.exports = { findOneAndGetAttributes, findOneAndSetAttribute, findOneAndUpdate, hasRelationship, exists};