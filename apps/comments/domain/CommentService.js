const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'CommentService' });

const { v7: uuidv7 } = require('uuid');
const CommentRepository = require('../data-access/CommentRepository.js');
const CommentValidation = require('./CommentValidation.js');

async function createComment({NODE_UUID, USER_UUID, body, PARENT_COMMENT_UUID, visibility}){
    const log = logger.child({'function' : 'createComment'});
    log.trace();
   
    let COMMENT_UUID = uuidv7();
    const date = new Date().toISOString()
    const comment= {
        COMMENT_UUID: COMMENT_UUID,
        
        NODE_UUID: NODE_UUID,
        USER_UUID: USER_UUID,
        body: body,
        PARENT_COMMENT_UUID: PARENT_COMMENT_UUID || '',
        createdAt: date,
        updatedAt: null,
        visibility: visibility || ['public']
      };

    const commentValidationResult = await CommentValidation.validateComment(comment);

    res.result = await CommentRepository.create(comment);
    next();
}

async function findOne (uuid) {
    const log = logger.child({'function' : 'findOne'});
    log.trace();
    const result = await CommentRepository.findOneByUUID(uuid);
    return result
}

module.exports = {
    createComment, 
    findOne
}