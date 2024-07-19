const express = require('express');
const router = express.Router();
const apiRoot = '/api/admin/posts'

const PostService = require('../../domain/PostService.js')
const AdminPostService = require('../../domain/AdminPostService.js')
const NodeService = require('../../../nodes/domain/NodeService.js')
const AuthService = require('../../../auth/domain/AuthService.js');
const AdminService = require('../../../admin/domain/AdminService.js');
const GlobalValidation = require('../../../../lib/validation/GlobalValidation.js')
const {catchAsync} = require('../../../../lib/error/customErrors.js')



//get all posts from a specific user
router.get('/user/:uuid',
    catchAsync(GlobalValidation.validateUUIDParam), 
    catchAsync(AuthService.requireAuth), 
    catchAsync(AdminService.requireAdmin), 
    catchAsync(AdminPostService.findManyByUserUUID), 
    function (req, res) {
    res.status(200).json(res.result);
});


//read
router.get('/', 
    catchAsync(AuthService.requireAuth),
    catchAsync(AdminService.requireAdmin),
    catchAsync(AdminPostService.findOneAndGet), 
    async function (req, res) {
    res.status(200).json(res.result)
});

//Update
router.patch('/:uuid',
    catchAsync(GlobalValidation.validateUUIDParam),
    catchAsync(AuthService.requireAuth),
    catchAsync(AdminService.requireAdmin),
    catchAsync(AdminPostService.update),
    async function (req, res){
    res.status(200).json(res.result)
});

//Delete
router.delete('/:uuid',
    catchAsync(GlobalValidation.validateUUIDParam),
    catchAsync(AuthService.requireAuth),
    catchAsync(AdminService.requireAdmin),
    catchAsync(AdminPostService.deletePost),
    async function (req, res){
    res.status(200).json(res.result)
});

module.exports = { apiRoot, router };
