const express = require('express');
const router = express.Router();
const apiRoot = '/api/admin/users';

const AdminUserService = require('../../domain/AdminUserService.js')

const UserService = require('../../domain/UserService.js')
const UserValidation = require('../../domain/UserValidation.js')
const AuthService = require('../../../auth/domain/AuthService.js');
const AdminService = require('../../../admin/domain/AdminService.js');

const GlobalValidation = require('../../../../lib/validation/GlobalValidation.js')
const customErrors = require('../../../../lib/error/customErrors.js')
const catchAsync = customErrors.catchAsync;

//create
router.post('/', 
    catchAsync(AuthService.requireAuth),
    catchAsync(AdminService.requireAdmin),
    catchAsync(UserValidation.validateNewUserInput), 
    catchAsync(UserService.create), 
    async function (req, res) {
    res.status(200).json(res.result)
});

//read
router.get('/', 
    catchAsync(AuthService.requireAuth),
    catchAsync(AdminService.requireAdmin),
    catchAsync(UserValidation.validateMutableUserInput), 
    catchAsync(AdminUserService.findOneAndGet), 
    async function (req, res) {
    res.status(200).json(res.result)
});

//Update
router.patch('/:uuid',
    catchAsync(GlobalValidation.validateUUIDParam),
    catchAsync(AuthService.requireAuth),
    catchAsync(AdminService.requireAdmin),
    catchAsync(UserValidation.validateMutableUserInput),
    catchAsync(AdminUserService.update),
    async function (req, res){
    res.status(200).json(res.result)
});

//Delete
router.delete('/:uuid',
    catchAsync(GlobalValidation.validateUUIDParam),
    catchAsync(AuthService.requireAuth),
    catchAsync(AdminService.requireAdmin),
    catchAsync(AdminUserService.deleteUser),
    async function (req, res){
    res.status(200).json(res.result)
});

module.exports = {router, apiRoot}