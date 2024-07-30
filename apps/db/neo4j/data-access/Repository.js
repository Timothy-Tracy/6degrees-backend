const neo4j = require('neo4j-driver');
require('dotenv').config()
const {
    DB_URL,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE
} = process.env;
const mylogger = require('../../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'Repository' });
const { AppError, DatabaseError } = require('../../../../lib/error/customErrors.js');
const Neo4jDriver = require('./Neo4jDriver.js');

const driver = Neo4jDriver.initDriver();

const processRecord = (rawRecord) => {
    const fields = rawRecord._fields;
    const fieldLookup = rawRecord._fieldLookup;
  
    const processedRecord = {};
  
    for (const fieldName in fieldLookup) {
      const index = fieldLookup[fieldName];
      processedRecord[fieldName] = fields[index];
    }
  
    return processedRecord;
}

/**
 * 
 * @param {*} obj 
 * @requires obj.label === 'string'
 * @optional obj.returnedKey === 'string'
 * @requires obj.properties === 'object'
 * @optional obj.returnedProperties === 'array' of strings
 * @returns 
 */
const get = async(obj) => {
    let output = {};
    const log = logger.child({ 'function': 'get' });
    log.trace(obj)
   

    const session = driver.session();

    await session.run(`
    
    MATCH (x:${obj.label})
WHERE ALL(key IN keys($obj.searchProperties) WHERE x[key] = $obj.searchProperties[key])
RETURN ${obj.returnedProperties ? `{
    ${obj.returnedProperties.map(prop => `${prop}: x.${prop}`).join(', ')}
  }` : 'x'} as ${obj.returnedKey || 'result'}
  `, { obj: obj })
        .then(result => {
            log.info(result)
            const x = result.records.map(record => processRecord(record));
            output.message = `Found }`
            output.data = x;
            output.summary = result.summary.counters._stats;
        }).catch(error => {
            throw error
        })
    log.info(output)
    return output
}

//const x = get({label:'POST', returnedKey:'post', searchProperties:{visibility:'public'}, returnedProperties :['visibility']})
//logger.info(x);

/**
 * Retrieves relationships from the Neo4j database based on the specified criteria.
 *
 * @async
 * @function getRelationships
 * @param {Object} options - The options for retrieving relationships.
 * @param {string} options.sourceLabel - The label of the source nodes.
 * @param {Object} [options.sourceProperties={}] - Properties to filter the source nodes.
 * @param {string} options.relationshipType - The type of the relationship to retrieve.
 * @param {string} [options.targetLabel] - The label of the target nodes. If not provided, it will query for any target node.
 * @param {Object} [options.targetProperties={}] - Properties to filter the target nodes.
 * @param {string} [options.direction] - The direction of the relationship. Accepted values are 'left', 'right', or undefined.
 * @param {string[]} [options.sourceReturnProperties] - The properties to be returned for the source nodes. If not provided, the entire source object will be returned.
 * @param {string[]} [options.relationshipReturnProperties] - The properties to be returned for the relationships. If not provided, the entire relationship object will be returned.
 * @param {string[]} [options.targetReturnProperties] - The properties to be returned for the target nodes. If not provided, the entire target object will be returned.
 * @returns {Promise<Array>} A promise that resolves to an array of objects containing the source, relationship, and target data.
 * @throws {Error} If an error occurs while retrieving the relationships.
 */
async function getRelationships({
    sourceLabel,
    sourceProperties = {},
    relationshipType,
    targetLabel,
    targetProperties = {},
    direction,
    sourceReturnProperties,
    relationshipReturnProperties,
    targetReturnProperties
  }) {
    const session = driver.session();
  
    try {
      let query = `MATCH (source:${sourceLabel})`;
  
      if (Object.keys(sourceProperties).length > 0) {
        query += ` WHERE ${Object.entries(sourceProperties)
          .map(([key, value]) => `source.${key} = $sourceProperties.${key}`)
          .join(' AND ')}`;
      }
  
      query += ` MATCH (source)`;
  
      if (direction === 'left') {
        query += `<-[relationship:${relationshipType}]-`;
      } else if (direction === 'right') {
        query += `-[relationship:${relationshipType}]->`;
      } else {
        query += `-[relationship:${relationshipType}]-`;
      }
  
      if (targetLabel) {
        query += `(target:${targetLabel})`;
      } else {
        query += '(target)';
      }
  
      if (Object.keys(targetProperties).length > 0) {
        query += ` WHERE ${Object.entries(targetProperties)
          .map(([key, value]) => `target.${key} = $targetProperties.${key}`)
          .join(' AND ')}`;
      }
  
      query += ' RETURN';
  
      if (sourceReturnProperties) {
        query += `  source{properties:{${sourceReturnProperties.map((obj)=>{return `${obj}: source.${obj}`}).join(', ')}}}`;
      } else {
        query += ' source';
      }
  
      if (relationshipReturnProperties) {
        query += `, relationship: {properties:{${relationshipReturnProperties.map((obj)=>{return `${obj}: relationship.${obj}`}).join(', ')}}}`;
      } else {
        query += ', relationship';
      }
  
      if (targetReturnProperties) {
        query += `, target{properties: {${targetReturnProperties.map((obj)=>{return `${obj}: target.${obj}`}).join(', ')}}}`;
      } else {
        query += ', target';
      }
  
      const result = await session.run(query, { sourceProperties, targetProperties });
      console.log(result.records[0])
      const l = result.records.map(record => ({
        
        source: record.get('source'),
        relationship: record.get('relationship'),
        target: record.get('target')
      }))
      
      console.log(l);
      logger.info(l)
      return l
    } catch (error) {
      console.error('Error retrieving relationships:', error);
      throw error;
    } finally {
      await session.close();
    }
  }


  /**
 * Retrieves a path from the Neo4j database based on the specified criteria.
 *
 * @async
 * @function getPath
 * @param {Object} options - The options for retrieving the path.
 * @param {string} options.startNodeLabel - The label of the start node.
 * @param {Object} [options.startNodeProperties={}] - Properties to filter the start node.
 * @param {string} options.endNodeLabel - The label of the end node.
 * @param {Object} [options.endNodeProperties={}] - Properties to filter the end node.
 * @param {string} options.relationshipType - The type of the relationships to traverse.
 * @param {number} [options.minHops=1] - The minimum number of hops (relationships) to traverse.
 * @param {number} [options.maxHops=1] - The maximum number of hops (relationships) to traverse.
 * @param {string[]} [options.nodeReturnProperties] - The properties to be returned for the nodes. If not provided, the entire node objects will be returned.
 * @param {string[]} [options.relationshipReturnProperties] - The properties to be returned for the relationships. If not provided, the entire relationship objects will be returned.
 * @returns {Promise<Array>} A promise that resolves to an array of path objects containing the nodes and relationships.
 * @throws {Error} If an error occurs while retrieving the path.
 */
async function getPath({
    startNodeLabel,
    startNodeProperties = {},
    endNodeLabel,
    endNodeProperties = {},
    relationshipType,
    minHops = 1,
    maxHops = 1,
    nodeReturnProperties,
    relationshipReturnProperties
  }) {
    const session = driver.session();
  
    try {
      let query = `MATCH (startNode:${startNodeLabel})`;
  
      if (Object.keys(startNodeProperties).length > 0) {
        query += ` WHERE ${Object.entries(startNodeProperties)
          .map(([key, value]) => `startNode.${key} = $startNodeProperties.${key}`)
          .join(' AND ')}`;
      }
  
      query += ` MATCH path = (startNode)-[relationship:${relationshipType}*]-(endNode:${endNodeLabel})`;
  
      if (Object.keys(endNodeProperties).length > 0) {
        query += ` WHERE ${Object.entries(endNodeProperties)
          .map(([key, value]) => `endNode.${key} = $endNodeProperties.${key}`)
          .join(' AND ')}`;
      }
  
      query += ' RETURN';
  
      if (nodeReturnProperties) {
        query += ` nodes(path) {${nodeReturnProperties.join(', ')}}`;
      } else {
        query += ' nodes(path)';
      }
  
      if (relationshipReturnProperties) {
        query += `, relationships(path) {${relationshipReturnProperties.join(', ')}}`;
      } else {
        query += ', relationships(path)';
      }
  
      const result = await session.run(query, { startNodeProperties, endNodeProperties });
      console.log(JSON.stringify(result, null, 2))
      let z = result.records.map(record => 
        processRecord(record)
    
      );

      console.log(JSON.stringify(z, null, 2))
      return z
    } catch (error) {
      console.error('Error retrieving path:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

/**
 * Retrieves a path from the Neo4j database based on the specified criteria.
 *
 * @async
 * @function getPathNoBackForks
 * @param {Object} options - The options for retrieving the path.
 * @param {string} options.startNodeLabel - The label of the start node.
 * @param {Object} [options.startNodeProperties={}] - Properties to filter the start node.
 * @param {string} options.endNodeLabel - The label of the end node.
 * @param {Object} [options.endNodeProperties={}] - Properties to filter the end node.
 * @param {string} options.relationshipType - The type of the relationships to traverse.
 * @param {number} [options.minHops=1] - The minimum number of hops (relationships) to traverse.
 * @param {number} [options.maxHops=1] - The maximum number of hops (relationships) to traverse.
 * @param {string[]} [options.nodeReturnProperties] - The properties to be returned for the nodes. If not provided, the entire node objects will be returned.
 * @param {string[]} [options.relationshipReturnProperties] - The properties to be returned for the relationships. If not provided, the entire relationship objects will be returned.
 * @returns {Promise<Array>} A promise that resolves to an array of path objects containing the nodes and relationships.
 * @throws {Error} If an error occurs while retrieving the path.
 */
  async function getPathNoBackForks({
    startNodeLabel,
    startNodeProperties = {},
    relationshipType,
    nodeReturnProperties,
    relationshipReturnProperties
  }) {
    const session = driver.session();
  
    try {
      let query = `MATCH (startNode:${startNodeLabel})`;
  
      if (Object.keys(startNodeProperties).length > 0) {
        query += ` WHERE ${Object.entries(startNodeProperties)
          .map(([key, value]) => `startNode.${key} = $startNodeProperties.${key}`)
          .join(' AND ')}`;
      }
  
      // Traverse backwards in a straight line
      query += `
        OPTIONAL MATCH path1 = (startNode)<-[:${relationshipType}*]-(previousNodes)
        WITH startNode, collect(path1) AS backwardPaths
      `;
  
      // Traverse forwards with forks
      query += `
        OPTIONAL MATCH path2 = (startNode)-[:${relationshipType}*]->(followingNodes)
        WITH startNode, backwardPaths, collect(path2) AS forwardPaths
      `;
  
      query += `
        RETURN
          [node IN nodes(backwardPaths[0]) | node {${nodeReturnProperties ? nodeReturnProperties.join(', ') : '.*'}}] AS backwardNodes,
          [rel IN relationships(backwardPaths[0]) | rel {${relationshipReturnProperties ? relationshipReturnProperties.join(', ') : '.*'}}] AS backwardRelationships,
          startNode {${nodeReturnProperties ? nodeReturnProperties.join(', ') : '.*'}} AS startNode,
          [path IN forwardPaths | [
            [node IN nodes(path) | node {${nodeReturnProperties ? nodeReturnProperties.join(', ') : '.*'}}],
            [rel IN relationships(path) | rel {${relationshipReturnProperties ? relationshipReturnProperties.join(', ') : '.*'}}]
          ]] AS forwardPathsData
      `;
  
      const result = await session.run(query, { startNodeProperties });
      console.log(result)
      let a = result.records.map(record => ({
        backwardNodes: record.get('backwardNodes'),
        backwardRelationships: record.get('backwardRelationships'),
        startNode: record.get('startNode'),
        forwardPaths: record.get('forwardPathsData').map(pathData => ({
          nodes: pathData[0],
          relationships: pathData[1]
        }))
      }));
      console.log(a)
      return a
    } catch (error) {
      console.error('Error retrieving path:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
 //const y = async()=> {return await getRelationships({sourceLabel:'USER', sourceProperties:{username:'janesmith'}, relationshipType:'FOLLOWS' , targetReturnProperties:['username'], sourceReturnProperties:['username','mobile']})}
 //logger.info(y())
 //const z = getPath({startNodeLabel:'NODE', startNodeProperties:{'NODE_UUID': '0190d1d8-0202-7ff5-b03b-7e7870a82129'}, endNodeLabel:'NODE', relationshipType:'EDGE_FULFILLED', })
 const a = getPathNoBackForks({startNodeLabel:'NODE', startNodeProperties:{'NODE_UUID': '0190dd05-a20a-7445-818c-25a4af046840'}, endNodeLabel:'NODE', relationshipType:'EDGE_FULFILLED', })

 module.exports = {get, processRecord, getRelationships}