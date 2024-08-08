const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'CommentServiceMiddleware' });

const CommentService = require('./CommentService.js')
const AuthValidation = require('../../auth/domain/AuthValidation.js');
const AccessService = require('../../access/domain/AccessService.js')


//TODO MAJOR REFACTORING
async function createCommentMiddleware(req,res,next){
    const log = logger.child({'function' : 'createCommentMiddleware'});
    log.trace();
    let USER_UUID, parentId;
    let COMMENT_UUID = uuidv7();
    //check if JWT is present
    
    if (res.locals.auth.hasAuth == true){
        //if authorization is present
        USER_UUID = res.locals.auth.tokenData.USER_UUID;
    } else {
        //else if authorization is not present
        await AuthValidation.assertUserUUIDInBody(req, res)
        USER_UUID = req.body.USER_UUID
    }

    //Assert Node UUID is present in the body.
    await AuthValidation.assertNodeUUIDInBody(req, res)

    
    const NODE_UUID = req.body.NODE_UUID;

    //if it has a parent comment
    if (req.body.PARENT_COMMENT_UUID){
        parentId = req.body.PARENT_COMMENT_UUID;
    } else {
        parentId = "";
    }

    const comment= {
        NODE_UUID: NODE_UUID,
        USER_UUID: USER_UUID,
        body: req.body.body,
        visibility: req.body.visibility,
        PARENT_COMMENT_UUID: parentId
      };

      res.result = await CommentService.createComment(comment);
      next();
}

async function getCommentMiddleware (req,res,next)  {
    const log = logger.child({'function' : 'getCommentMiddleware'});
    log.trace();
    const result = await CommentService.findOne(req.params.uuid);
    let comment = result.data
    res.result = comment;
    next() 
}

async function commentAccessFirewallMiddleware(req, res, next){
    const log = logger.child({'function' : 'commentAccessFirewallMiddleware'});
    log.trace();
    let comment = res.result;

    if(comment.visibility.includes('public')){
       next();
    } else {
        
    

    let source = {}
    let accessType = ''
    if(res.locals.auth.hasAuth){
        source.type= 'user'
        source.label='USER'
        source.properties = {
            'USER_UUID': res.locals.auth.tokenData.USER_UUID
        }
    }else{
        source.type = 'guest'
    }
    
    const sourceAccessLevels = await AccessService.getSourceAccessLevels(
        source
        ,
        {
            type:'user',
            label:'USER',
            properties:{'username':comment.username}
           
        })

        const canAcc = await AccessService.canAccess({sourceAccessLevels: sourceAccessLevels, targetAccessLevels:comment.visibility})

        if (canAcc.boolean){
            log.info('access granted')
            res.result = comment;
            next()
        } else {
            log.info('access denied')
            res.result = {error:'Access Denied'}
            next()
        }
    }
}


module.exports = {
    createCommentMiddleware, 
    getCommentMiddleware,
    commentAccessFirewallMiddleware
}