const { v7: uuidv7 } = require('uuid');
const CommentRepository = require('../data-access/CommentRepository.js');

const CommentValidation = require('./CommentValidation.js');
const EdgeService = require('../../edges/domain/EdgeService.js');
const UserService = require('../../users/domain/UserService.js');
const NodeService = require('../../nodes/domain/NodeService.js');
const AuthService = require('../../auth/domain/AuthService.js');
const AuthValidation = require('../../auth/domain/AuthValidation.js');

const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'CommentService' });
//TODO parentID validation
//TODO MAJOR REFACTORING
async function comment(req,res,next){
    const log = logger.child({'function' : 'comment'});
    log.trace();
    let USER_UUID, parentId;
    let COMMENT_UUID = uuidv7();
    //check if JWT is present
    await AuthService.optionalAuth(req, res);
    
    if (res.locals.authorization == true){
        //if authorization is present
        USER_UUID = res.locals.tokenData.USER_UUID;
    } else {
        //else if authorization is not present
        await AuthValidation.assertUserUUIDInBody(req, res)
        USER_UUID = req.body.USER_UUID
    }

    //Assert Node UUID is present in the body.
    await AuthValidation.assertNodeUUIDInBody(req, res)

    const POST_UUID = req.body.POST_UUID;
    const NODE_UUID = req.body.NODE_UUID;

    //if it has a parent comment
    if (req.body.PARENT_COMMENT_UUID){
        parentId = req.body.PARENT_COMMENT_UUID;
    } else {
        parentId = "";
    }

    const date = new Date().toISOString()

    const comment= {
        COMMENT_UUID: COMMENT_UUID,
        POST_UUID: POST_UUID,
        NODE_UUID: NODE_UUID,
        USER_UUID: USER_UUID,
        content: req.body.content,
        PARENT_COMMENT_UUID: parentId,
        createdAt: date,
        updatedAt: null
      };

      await CommentValidation.validateComment(comment);

      res.result = await CommentRepository.create(comment);
      next();
}

module.exports = {comment}