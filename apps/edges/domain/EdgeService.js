const { v7: uuidv7 } = require('uuid');
const EdgeRepository = require('../data-access/EdgeRepository.js');
const randomWordSlugs = require('random-word-slugs')
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'EdgeService' }, {options:{name:'EdgeService'}});


async function createDistribution(node) {
    const log = logger.child({'function':'createDistribution'});
    log.trace();
    log.debug(node)
    let UUID = uuidv7();
    var obj = {
        EDGE_UUID: UUID,
        POST_UUID: node.POST_UUID,
        SOURCE_NODE_UUID: node.NODE_UUID,
        DESTINATION_NODE_UUID: null,
        EDGE_QUERY: randomWordSlugs.generateSlug(),
        degree: node.degree,
    }
    logger.debug(obj, "Creating Distribution")

    const result = await EdgeRepository.create(obj)
    logger.info("Edge Created")
    return (result);
}
async function createDistributionNew(NODE_UUID) {

    const log = logger.child({'function':'createDistributionNew'});
    log.trace();

    let uuid = uuidv7();
    var obj = {
        EDGE_UUID: uuid,
        SOURCE_NODE_UUID: NODE_UUID,
        EDGE_QUERY: randomWordSlugs.generateSlug(),
        degree: node.degree,
    }
    
    const result = await EdgeRepository.create(obj)
    return (result);
}

async function findOneByQuery(query) {
    const result = await EdgeRepository.findOneByQuery(query);
    return (result);
}

async function findOneByNodeUUID(NODE_UUID){
    const Repository = require('../../db/neo4j/data-access/Repository.js');
    const log = logger.child({'function':'findOneByNodeUUID'});
    log.trace();

    const result = await Repository.getRelationships(
        {
            sourceLabel:'NODE', 
            sourceProperties:{'NODE_UUID':NODE_UUID},
            relationshipType:'EDGE'
        }
    )
    return result;


}

module.exports = { createDistributionNew,createDistribution, findOneByQuery,findOneByNodeUUID }