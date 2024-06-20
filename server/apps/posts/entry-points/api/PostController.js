
var PostService = require('../../domain/PostService.js')
var NodeService = require('../../../nodes/domain/NodeService.js')

var express = require('express');
var router = express.Router();
const apiRoot = '/api/posts'


router.post('/', PostService.create, function (req, res) {
    res.status(200).json(res.result)
});
router.post('/distribute/:uuid', NodeService.distribute, function (req, res) {
    res.status(200).json(res.result)
});
router.get('/:query', NodeService.createFromDistribution, function (req, res) {
    res.status(200).json(res.result)
});
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
