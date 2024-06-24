const { v7: uuidv7 } = require('uuid');
const EdgeRepository = require('../data-access/EdgeRepository.js');
const randomWordSlugs = require('random-word-slugs')
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'EdgeService' }, {options:{name:'EdgeService'}});
async function createDistribution(node) {
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

async function findOneByQuery(query) {
    const result = await EdgeRepository.findOneByQuery(query);
    console.log(result);
    return (result.result);
}

module.exports = { createDistribution, findOneByQuery }