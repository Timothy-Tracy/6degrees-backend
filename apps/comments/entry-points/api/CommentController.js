
var PostService = require('../../../posts/domain/PostService.js')
var NodeService = require('../../../nodes/domain/NodeService.js')
var CommentService = require('../../domain/CommentService.js')
var CommentMiddleware = require('../../domain/CommentMiddleware.js')

var AuthService = require('../../../auth/domain/AuthService.js');
const customErrors = require('../../../../lib/error/customErrors.js')
const catchAsync = customErrors.catchAsync;
var express = require('express');
var router = express.Router();
const apiRoot = '/api/comments'
const GlobalValidation = require('../../../../lib/validation/GlobalValidation.js')
const {uuidObjSchema} = require('../../../../lib/validation/schemas/GlobalSchemas.js')

//Get Comment
router.get('/:uuid', 
    catchAsync(GlobalValidation.validateParam(uuidObjSchema)),
    catchAsync(AuthService.optionalAuth),
    catchAsync(CommentMiddleware.getCommentMiddleware),
    catchAsync(CommentMiddleware.commentAccessFirewallMiddleware),
    function(req,res){
        res.status(200).json(res.result)
    }
)

//Create Comment
router.post('/', 
    catchAsync(AuthService.optionalAuth),
    catchAsync(CommentMiddleware.createCommentMiddleware), 
    function (req, res) {
        res.status(200).json(res.result)
});



module.exports = { apiRoot, router };
