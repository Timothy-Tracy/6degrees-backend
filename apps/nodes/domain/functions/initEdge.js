const EdgeService = require('../../../edges/domain/EdgeService.js');

const mylogger = require('../../../../lib/logger/logger.js');
const { AppError } = require('../../../lib/error/customErrors.js');
const log = mylogger.child({ 
    'app': 'nodes',
    'function': 'initEdge' 
});

/**
 * 
 * @module NodeService
 * @description This function is a middleware that creates an "edge" for a respective node. This edge represents a distribution method, or a share
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @requires res.locals.NODE_UUID
 */
//TODO: Conditional distribution based off of if one exists
async function initEdge(NODE_UUID) {
    log.trace({NODE_UUID});
    let edgeResult = await EdgeService.createDistributionNew(NODE_UUID);
    log.debug(edgeResult.data.edge)
    return edgeResult.data.edge.EDGE_QUERY
}

module.exports = initEdge