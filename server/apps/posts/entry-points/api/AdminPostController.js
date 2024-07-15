
var PostService = require('../../domain/PostService.js')
var AdminPostService = require('../../domain/AdminPostService.js')
var NodeService = require('../../../nodes/domain/NodeService.js')
var AuthService = require('../../../auth/domain/AuthService.js');
var AdminService = require('../../../admin/domain/AdminService.js');
const customErrors = require('../../../../lib/error/customErrors.js')
const catchAsync = customErrors.catchAsync;
var express = require('express');
var router = express.Router();
const apiRoot = '/api/admin/posts'

//get all posts from a specific user
router.get('/user/:USER_UUID', catchAsync(AuthService.requireAuth), catchAsync(AdminService.requireAdmin), catchAsync(AdminPostService.findManyByUserUUID), function (req, res) {
    res.status(200).json(res.result);
});

module.exports = { apiRoot, router };
