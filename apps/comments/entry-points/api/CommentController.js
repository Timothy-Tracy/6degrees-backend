
var PostService = require('../../../posts/domain/PostService.js')
var NodeService = require('../../../nodes/domain/NodeService.js')
var CommentService = require('../../domain/CommentService.js')
var AuthService = require('../../../auth/domain/AuthService.js');
const customErrors = require('../../../../lib/error/customErrors.js')
const catchAsync = customErrors.catchAsync;
var express = require('express');
var router = express.Router();
const apiRoot = '/api/comments'
const GlobalValidation = require('../../../../lib/validation/GlobalValidation.js')
const {uuidObjSchema} = require('../../../../lib/validation/schemas/GlobalSchemas.js')

router.get('/:uuid', 
    catchAsync(GlobalValidation.validateParam(uuidObjSchema)),
    catchAsync(CommentService.findOne()),
    function(req,res){
        res.status(200).json(res.result)
    }
)

router.post('/', catchAsync(AuthService.optionalAuth),catchAsync(CommentService.comment), function (req, res) {
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
