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

/**
 * Processes an object of properties based on inclusion and exclusion criteria.
 * 
 * @param {Object} properties - The object containing properties to process.
 * @param {string[]} include - Array of property names to include. If empty, all properties are included.
 * @param {string[]} exclude - Array of property names to exclude.
 * @returns {Object} A new object with processed properties.
 * 
 * @example
 * const obj = { a: 1, b: 2, c: 3 };
 * const result = processProperties(obj, ['a', 'b'], ['b']);
 * // result will be { a: 1 }
 */
const processProperties = (
  properties = {},
  include = [],
  exclude = []
) => {
  // Initialize logger for this function
  const log = logger.child({ function: 'processProperties' });

  // Log input parameters for debugging
  // log.debug(
  //   { properties, include, exclude },
  //   'Unprocessed properties:'
  // );

  // Determine if all properties should be included
  const includeAll = include.length === 0;
  //log.trace({ includeAll });

  // Early return if no processing is needed
  if (includeAll && exclude.length === 0) {
    //log.debug({ properties }, 'Processed properties:');
    return properties;
  }

  // Convert arrays to Sets for faster lookups
  const includeSet = new Set(include);
  const excludeSet = new Set(exclude);

  // Process inclusions
  const output = includeAll
    ? { ...properties } // Include all if includeAll is true
    : Object.fromEntries(
      Object.entries(properties).filter(([key]) => includeSet.has(key))
    );

  // Process exclusions
  const filteredOutput = Object.fromEntries(
    Object.entries(output).filter(([key]) => !excludeSet.has(key))
  );

  // Log the final processed properties
  //log.debug({ properties: filteredOutput }, 'Processed properties:');

  return filteredOutput;
};

/**
 * Processes a raw record by filtering and transforming its properties based on provided keys.
 * 
 * @param {Object} rawRecord - The raw record to process.
 * @param {Object} rawRecord._fields - The fields of the raw record.
 * @param {Object} rawRecord._fieldLookup - A lookup object mapping field names to their indices.
 * @param {Object} [keys={}] - An object specifying which keys to include or exclude for each field.
 * @param {Object} [keys.key] - A key in the keys object representing a field name.
 * @param {string[]} [keys.key.included=[]] - An array of property names to include for this field.
 * @param {string[]} [keys.key.excluded=[]] - An array of property names to exclude for this field.
 * @returns {Object} The processed record with filtered and transformed fields.
 */
const processRecord = (rawRecord, keys = { key: { included: [], excluded: [] } }) => {
  // Create a child logger for this function
  const log = logger.child({ function: 'processRecord' });
  //log.trace({ keys });

  // Destructure the raw record to get fields and field lookup
  const { _fields: fields, _fieldLookup: fieldLookup } = rawRecord;
  const processedRecord = {};

  // Iterate over each field in the fieldLookup
  Object.entries(fieldLookup).forEach(([fieldName, index]) => {
    //log.debug({ message: `Processing field`, fieldName, index });

    // Check if there are specific keys to process for this field
    if (keys[fieldName]) {
      const { included, excluded } = keys[fieldName];

      // Process included keys if any
      if (included?.length > 0) {
        //log.debug({ message: 'Processing included keys', fieldName, included });
        fields[index].properties = processProperties(fields[index].properties, included);
      } else {
        //log.debug({ message: 'No included keys', fieldName, included });

      }

      // Process excluded keys if any
      if (excluded?.length > 0) {
        //log.debug({ message: 'Processing excluded keys', fieldName, excluded });
        fields[index].properties = processProperties(fields[index].properties, [], excluded);
      } else {
        //log.debug({ message: 'No excluded keys', fieldName, excluded });

      }
    }

    // Add the processed field to the result
    processedRecord[fieldName] = fields[index];
    //log.debug(processedRecord[fieldName])
  });

  return processedRecord;
};



/**
 * 
 * @param {*} obj 
 * @requires obj.label === 'string'
 * @optional obj.returnedKey === 'string'
 * @requires obj.properties === 'object'
 * @optional obj.returnProperties === 'array' of strings
 * @optional obj.excludedProperties === 'array' of strings

 * @returns 
 */
const get = async (obj) => {
  let output = {};
  const log = logger.child({ 'function': 'get' });
  log.trace(obj)
  const session = driver.session();

  await session.run(`
    
    MATCH (x:${obj.label})
    WHERE ALL(key IN keys($obj.properties) WHERE x[key] = $obj.properties[key])
    RETURN x
  `, { obj: obj })
    .then(result => {
      //log.debug(result)

      const x = result.records.map(record => processRecord(record, {x:{included:obj.returnProperties, excluded: obj.excludedProperties}}));
      output.message = `Found entity`
      output.data = x.map((element)=>(element['x']));
      output.summary = result.summary.counters._stats;
    }).catch(error => {
      throw error
    })

  return output
}


/**
 * Retrieves relationships from the Neo4j database based on the specified criteria.
 *
 * @async
 * @function getRelationships
 * @deprecated
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
  let l = {};
  const log = logger.child({ 'function': 'getRelationships' })
  log.warn(sourceProperties)
  log.trace({ sourceLabel, sourceProperties, relationshipType })
  const session = driver.session();
  relationshipType = relationshipType ? `:${relationshipType}` : ""
  try {
    let query = `MATCH (source:${sourceLabel})`;

    if (Object.keys(sourceProperties).length > 0) {
      query += ` WHERE ${Object.entries(sourceProperties)
        .map(([key, value]) => `source.${key} = $sourceProperties.${key}`)
        .join(' AND ')}`;
    }

    query += ` MATCH (source)`;

    if (direction === 'left') {
      query += `<-[relationship${relationshipType}]-`;
    } else if (direction === 'right') {
      query += `-[relationship${relationshipType}]->`;
    } else {
      query += `-[relationship${relationshipType}]-`;
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
      query += `  source{properties:{${sourceReturnProperties.map((obj) => { return `${obj}: source.${obj}` }).join(', ')}}}`;
    } else {
      query += ' source';
    }

    if (relationshipReturnProperties) {
      query += `, relationship: {properties:{${relationshipReturnProperties.map((obj) => { return `${obj}: relationship.${obj}` }).join(', ')}}}`;
    } else {
      query += ', relationship';
    }

    if (targetReturnProperties) {
      query += `, target{properties: {${targetReturnProperties.map((obj) => { return `${obj}: target.${obj}` }).join(', ')}}}`;
    } else {
      query += ', target';
    }

    const result = await session.run(query, { sourceProperties: sourceProperties, targetProperties: targetProperties });
    console.log(result)
    l = result.records.map(record => ({

      source: record.get('source'),
      relationship: record.get('relationship'),
      target: record.get('target')
    }))

    console.log(l);
    //logger.info(l)

  } catch (error) {
    console.error('Error retrieving relationships:', error);
    throw error;
  } finally {
    await session.close();
  }

  return l
}
async function getRel(
  source = { label: "", properties: {}, returnProperties: [] },
  relationship = { type: "", properties: {}, returnProperties: [], direction: "" },
  target = { label: "", properties: {}, returnProperties: [] }) {
  let output = {};
  const log = logger.child({ 'function': 'getRel' })
  log.trace({source,relationship,target})
  let srcReturnProperties = source.returnProperties
  let relReturnProperties = relationship.returnProperties
  let tarReturnProperties = target.returnProperties
  const session = driver.session();
  relationship.type = relationship.type ? `:${relationship.type}` : ""
  try {
    let query = `MATCH (source:${source.label})`;

    if (source.properties && Object.keys(source.properties).length > 0) {
      query += ` WHERE ${Object.entries(source.properties)
        .map(([key, value]) => `source.${key} = $source.properties.${key}`)
        .join(' AND ')}`;
    }

    query += ` MATCH (source)`;

    if (relationship.direction === 'left') {
      query += `<-[relationship${relationship.type}]-`;
    } else if (relationship.direction === 'right') {
      query += `-[relationship${relationship.type}]->`;
    } else {
      query += `-[relationship${relationship.type}]-`;
    }

    if (target.label) {
      query += `(target:${target.label})`;
    } else {
      query += '(target)';
    }

    if (relationship.properties && Object.keys(relationship.properties).length > 0) {
      query += ` WHERE ${Object.entries(relationship.properties)
        .map(([key, value]) => `relationship.${key} = $relationship.properties.${key}`)
        .join(' AND ')}`;
    }

    if (target.properties && Object.keys(target.properties).length > 0) {
      query += ` WHERE ${Object.entries(target.properties)
        .map(([key, value]) => `target.${key} = $target.properties.${key}`)
        .join(' AND ')}`;
    }

    query += ' RETURN source, relationship, target';

    const result = await session.run(query, { source: source, relationship: relationship, target: target });
    //logger.info(result)
    output.data = result.records.map(record => {
      return processRecord(record, {
        source: {
          included: srcReturnProperties,
          excluded: source.excludedProperties
        },
        relationship: {
          included: relReturnProperties,
          excluded: relationship.excludedProperties
        },
        target: {
          included: tarReturnProperties,
          excluded: target.excludedProperties
        }
      })
    })

    //console.log(l);
    logger.debug(output)

  } catch (error) {
    throw new DatabaseError({message: 'Error retrieving relationships:', error: error, statusCode:500})
  
  } finally {
    await session.close();
  }

  return output
}

// getRel(
//   {
//     label: 'USER',
//     returnProperties: ['username']


//   },
//   {
//     type: 'FRIEND',
//     properties: {
//       createdAt: '2024-08-09T21:36:12.217Z'
//     },
//     returnProperties: ['createdAt']
//   },
//   {
//     label: 'USER',
//     returnProperties: ['username']
//   }
// )

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
  logger.trace({startNodeLabel, startNodeProperties, relationshipType})
  let a={}
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

    // query += `
    //   RETURN
    //     [node IN nodes(backwardPaths[0]) | node {${nodeReturnProperties ? nodeReturnProperties.join(', ') : '.*'}}] AS backwardNodes,
    //     [rel IN relationships(backwardPaths[0]) | rel {${relationshipReturnProperties ? relationshipReturnProperties.join(', ') : '.*'}}] AS backwardRelationships,
    //     startNode {${nodeReturnProperties ? nodeReturnProperties.join(', ') : '.*'}} AS startNode,
    //     [path IN forwardPaths | [
    //       [node IN nodes(path) | node {${nodeReturnProperties ? nodeReturnProperties.join(', ') : '.*'}}],
    //       [rel IN relationships(path) | rel {${relationshipReturnProperties ? relationshipReturnProperties.join(', ') : '.*'}}]
    //     ]] AS forwardPathsData
    // `;
    query += `
        RETURN backwardPaths, forwardPaths
      `
    logger.warn(query)
    const result = await session.run(query, { startNodeProperties });
    logger.warn(result)
    console.log(result)
    a = result.records.map(record => ({
      backwardPaths: record.get('backwardPaths'),
      forwardPaths: record.get('forwardPaths'),

    }));
    console.log(a)

    
  } catch (error) {
   
    throw error;
  } finally {
    await session.close();
  }
  return a[0]
}


async function transformData(data) {
  let jsonData1 = data.backwardPaths;
  let jsonData2 = data.forwardPaths;
  // Combine data from both documents
  let combinedData = [...jsonData1 || {}, ...jsonData2];
  let mydata = {
    nodes: [],
    links: []
  };

  let nodeMap = new Map();
  console.log(nodeMap)
  combinedData.forEach(path => {
    // Function to add a node with all its properties
    function addNode(node) {
      if (!nodeMap.has(node.identity.toString())) {
        let nodeObj = {
          id: node.identity.toString(),
          label: `NODE ${node.identity}`,
          ...node.properties
        };
        mydata.nodes.push(nodeObj);
        nodeMap.set(node.identity.toString(), nodeObj);
      }
    }

    // Add start and end nodes
    addNode(path.start);
    addNode(path.end);

    // Add links
    path.segments.forEach(segment => {
      mydata.links.push({
        source: segment.start.identity.toString(),
        target: segment.end.identity.toString(),
        label: segment.relationship.type,
        ...segment.relationship.properties
      });
    });
  });

  return mydata;

}

const doStuff = async () => {
  const a = await getPathNoBackForks({ startNodeLabel: 'NODE', startNodeProperties: { 'NODE_UUID': '0190dd05-a20a-7445-818c-25a4af046840' }, endNodeLabel: 'NODE', relationshipType: 'EDGE_FULFILLED', })
  const b = await transformData(a);
  console.log(b)
}
//doStuff()
module.exports = { get, processRecord, getRelationships, getPathNoBackForks, transformData, getRel }