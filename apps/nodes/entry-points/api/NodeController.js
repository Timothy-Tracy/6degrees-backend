
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
const EdgeService = require('../../../edges/domain/EdgeService.js')

// Allows an authenticated user to find all nodes that are owned by them
router.get('/', catchAsync(AuthService.requireAuth), catchAsync(NodeService.findAllOwnedBy), async function (req, res){
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

router.get('/:query/node', 
    catchAsync(AuthService.optionalAuth), 
    catchAsync(NodeService.findMyNodeByPostQuery), 
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
    
    const {error, value} = GlobalSchemas.validUUIDSchema.validate(req.params.input,
        {
            abortEarly:false,
        }
    )
    if(error){
        let result = await EdgeService.getUuidByQuery(req.params.input, 'NODE')
        res.locals.nodeUuid = result[0].NODE_UUID
    }else{
        res.locals.nodeUuid = value
    }
    next()
}

async function test(){
    let result = await NodeService.getOne('0190dd05-a20a-7445-818c-25a4af046840',{user:{returnProperties:['username','USER_UUID']}});
    logger.info(result)
}

//test()

module.exports = { apiRoot, router };
