const { v7: uuidv7 } = require('uuid');
const NodeService = require('../../nodes/domain/NodeService.js')
const AuthService = require('../../auth/domain/AuthService.js')
const EdgeService = require('../../edges/domain/EdgeService.js')
const NodeRepository = require('../../nodes/data-access/NodeRepository.js')
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'AdminService' });
const Neo4jRepository = require('../../db/neo4j/data-access/Neo4jRepository.js');
const { AppError } = require('../../../lib/error/customErrors.js');

async function requireAdmin(req,res,next){
    const log = logger.child({'function':'verifyAdmin'});
    log.trace();
    if(res.locals.auth.tokenData.USER_ROLE =='ADMIN'){
        log.info('ADMIN = true');
        next()
    } else {
        log.info('ADMIN = false');
        throw new AppError('USER NOT ADMINISTRATOR', 403);
    }
}

module.exports = {requireAdmin}