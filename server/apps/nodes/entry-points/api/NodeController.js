
var NodeService = require('../../domain/NodeService.js')

var express = require('express');
var router = express.Router();
const apiRoot = '/api/nodes'
const customErrors = require('../../../../lib/error/customErrors.js');
const catchAsync = customErrors.catchAsync;
const AuthService = require('../../../auth/domain/AuthService.js');


router.get('/:uuid', NodeService.findOneByUUID, async function (req, res){
    res.status(200).json(res.result)
});

router.post('/own', catchAsync(AuthService.verify), catchAsync(NodeService.takeOwnership), async function(req,res){
    res.status(200).json(res.result);
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
router.get('/', PostService.getAll, async function (req, res){
    res.status(200).json(res.result)
});
router.get('/', PostService.getAllFromUser, async function (req, res){
    res.status(200).json(res.result)
});


*/
router.delete('/:uuid', NodeService.deleteNode, async function (req, res){
    res.status(200).json(res.result)
});

module.exports = { apiRoot, router };
