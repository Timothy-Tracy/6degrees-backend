
var PostService = require('../../domain/PostService.js')
var NodeService = require('../../../nodes/domain/NodeService.js')
var AuthService = require('../../../auth/domain/AuthService.js');
const customErrors = require('../../../../lib/error/customErrors.js')
const catchAsync = customErrors.catchAsync;
var express = require('express');
var router = express.Router();
const apiRoot = '/api/posts'


router.post('/', catchAsync(AuthService.verify), catchAsync(PostService.create), function (req, res) {
    res.status(200).json(res.result)
});
router.post('/distribute/:uuid', NodeService.distribute, function (req, res) {
    res.status(200).json(res.result)
});

//TODO: Need to once again add create from distribution logic
router.get('/:query',  catchAsync(PostService.findOneByQuery),catchAsync(PostService.open),  function (req, res) {
    res.status(200).json(res.result)
});
// router.get('/:query', catchAsync(AuthService.optionalAuth), catchAsync(NodeService.createFromDistribution), catchAsync(PostService.findOne),  function (req, res) {
//     res.status(200).json(res.result)
// });
router.delete('/:uuid', PostService.deletePost, async function (req, res){
    res.status(200).json(res.result)
});

/*
router.get('/', PostService.getAll, async function (req, res){
    res.status(200).json(res.result)
});
router.get('/', PostService.getAllFromUser, async function (req, res){
    res.status(200).json(res.result)
});

router.get('/:UUID', PostService.findOneByUUID, async function (req, res){
    res.status(200).json(res.result)
});


*/
module.exports = { apiRoot, router };
