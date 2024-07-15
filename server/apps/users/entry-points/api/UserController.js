const express = require('express');
const router = express.Router();
const apiRoot = '/api/users';

const UserService = require('../../domain/UserService.js')
const UserValidation = require('../../domain/UserValidation.js')
const AuthService = require('../../../auth/domain/AuthService.js');

const {catchAsync} = require('../../../../lib/error/customErrors.js')

// //create
// router.post('/', catchAsync(UserValidation.validateNewUserInput), catchAsync(UserService.create),async function (req, res) {
//     res.status(200).json(res.result)
// });

//Update
router.patch('/', 
    catchAsync(AuthService.requireAuth), 
    catchAsync(UserValidation.validateMutableUserInput), 
    catchAsync(UserService.update), 
    async function (req, res){
    res.status(200).json(res.result)
});
//Delete
router.delete('/', 
    catchAsync(AuthService.requireAuth), 
    catchAsync(UserService.deleteUser), 
    async function (req, res){
    res.status(200).json(res.result)
});

//Change Password
router.post('/password', 
    catchAsync(AuthService.requireAuth),
    catchAsync(UserValidation.validatePasswordInput), 
    catchAsync(UserService.changePassword), 
    async function (req, res) {
    res.status(200).json(res.result)
});

module.exports = { apiRoot, router };