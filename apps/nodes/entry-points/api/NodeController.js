
var NodeService = require('../../domain/NodeService.js')
const NodeMiddleware = require('../../domain/NodeMiddleware.js')

var express = require('express');
var router = express.Router();
const apiRoot = '/api/nodes'
const customErrors = require('../../../../lib/error/customErrors.js');
const catchAsync = customErrors.catchAsync;
const AuthService = require('../../../auth/domain/AuthService.js');
const mylogger = require('../../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'NodeController' });

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
router.get('/path/:query', 
    catchAsync(AuthService.requireAuth),
    catchAsync(NodeService.findDistributionPathGraphData), async function (req, res){
    res.status(200).json(res.result)
});

//Create Distribution Link
router.get('/:uuid/query/', 
    catchAsync(NodeMiddleware.getQuery), 
    function (req, res) {
        logger.info({response:{data:res.result}})
        res.status(200).json(res.result)
});
/*
router.post('/create', function(req, res) {
    console.log('receiving data ...');
    console.log('body is ',req.body);
    const data = req.body;
    RequestService.createRequest(data.UUUID, data.title, data.description);
    res.send(req.body);
});
*/


/*

router.get('/', PostService.getAllFromUser, async function (req, res){
    res.status(200).json(res.result)
});


*/
router.delete('/:uuid', NodeService.deleteNode, async function (req, res){
    res.status(200).json(res.result)
});

module.exports = { apiRoot, router };
