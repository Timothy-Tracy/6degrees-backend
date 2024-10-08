
var NodeService = require('../../domain/NodeService.js')
const NodeMiddleware = require('../../domain/NodeMiddleware.js')
const joi = require('joi')
var express = require('express');
var router = express.Router();
const apiRoot = '/api/nodes'
const customErrors = require('../../../../lib/error/customErrors.js');
const catchAsync = customErrors.catchAsync;
const AuthService = require('../../../auth/domain/AuthService.js');
const mylogger = require('../../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'NodeController' });
const GlobalSchemas = require('../../../../lib/validation/schemas/GlobalSchemas.js')
const EdgeService = require('../../../edges/domain/EdgeService.js');
const CommentMiddleware = require('../../../comments/domain/CommentMiddleware.js');
const GlobalValidation = require('../../../../lib/validation/GlobalValidation.js')

// Allows an authenticated user to find all nodes that are owned by them
router.get('/', catchAsync(AuthService.requireAuth), catchAsync(NodeService.findAllOwnedBy), async function (req, res){
    res.status(200).json(res.result)
});
router.get('/:username/node-queries', 
    catchAsync(NodeMiddleware.findAllNodeQueriesByUsername), 
    async function (req, res){
    res.status(200).json(res.result)
});

router.get('/posts/:query', catchAsync(AuthService.optionalAuth), catchAsync(NodeService.findMyNodeByPostQuery), async function (req, res){
    res.status(200).json(res.result)
});

router.get('/:uuid', catchAsync(NodeService.findOneByUUID), async function (req, res){
    res.status(200).json(res.result)
});

router.get('/interact/:query', catchAsync(AuthService.optionalAuth), catchAsync(NodeService.interact), async function (req, res){
    res.status(201).json(res.result);
})

// Allows an authenticated user to take ownership of a response node that was generated with an anonymous user owner
router.post('/own', catchAsync(AuthService.requireAuth), catchAsync(NodeService.takeOwnership), async function(req,res){
    res.status(200).json(res.result);
});

//USING QUERY 

router.get('/:input/path/', 
    catchAsync(AuthService.requireAuth),
    catchAsync(validateInput),
    catchAsync(NodeMiddleware.getNode),
    catchAsync(NodeMiddleware.findDistributionPathGraphData), async function (req, res){
    res.status(200).json(res.result)
});

router.get('/:uuid/create-edge/', 
    catchAsync(GlobalValidation.validateUUIDParam),
    catchAsync(AuthService.requireAuth), 
    catchAsync(NodeMiddleware.getNode),
    catchAsync(NodeMiddleware.createEdge), async function (req, res){
    res.status(200).json(res.result)
});

router.get('/:query/my/node', 
    catchAsync(AuthService.optionalAuth), 
    catchAsync(NodeService.findMyNodeByPostQuery), 
    async function (req, res){
    res.status(200).json(res.result)
});
router.get('/v2/:query/my/node', 
    catchAsync(AuthService.optionalAuth), 
    catchAsync(NodeMiddleware.getMyNode), 
    async function (req, res){
        let output = {};
        output.data = res.locals.myNode
        res.result = output
        logger.info({response:{data:res.result}})
    res.status(200).json(res.result)
});

router.get('/:input/node', 
    catchAsync(AuthService.optionalAuth), 
    catchAsync(validateInput),
    catchAsync(NodeMiddleware.getNode),
    async function (req, res){
        let data = res.locals.node
        res.result = {data:data}
    res.status(200).json(res.result)
});

router.get('/:query/postUuid', 
    catchAsync(AuthService.optionalAuth), 
    catchAsync(NodeMiddleware.getPostUuidByQuery), 
    async function (req, res){
    res.status(200).json(res.result)
});

router.get('/:query/parent-comments', 

    catchAsync(CommentMiddleware.findManyCommentUuidsByQuery), 
    async function (req, res){
    res.status(200).json(res.result)
});

//Create Distribution Link
router.get('/:uuid/query/', 
    catchAsync(NodeMiddleware.getQueryByNodeUuid), 
    function (req, res) {
        logger.info({response:{data:res.result}})
        res.status(200).json(res.result)
});



router.delete('/:uuid', NodeService.deleteNode, async function (req, res){
    res.status(200).json(res.result)
});

async function validateInput(req,res,next){
    
    const {error, value} = await GlobalSchemas.validUUIDSchema.validate(req.params.input,
        {
            abortEarly:false,
        }
    )
    if(error){
        let result = await EdgeService.getUuidByQuery(req.params.input, 'NODE')
        logger.info(result[0][0])
        res.locals.nodeUuid = result[0]
    }else{
        res.locals.nodeUuid = value
    }
    logger.info(res.locals.nodeUuid)
    next()
}

async function test(){
    let result = await NodeService.getOne('0190dd05-a20a-7445-818c-25a4af046840',{user:{returnProperties:['username','USER_UUID']}});
    logger.info(result)
}

//test()

module.exports = { apiRoot, router };
