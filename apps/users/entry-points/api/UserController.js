const express = require('express');
const router = express.Router();
const apiRoot = '/api/users';

const UserService = require('../../domain/UserService.js')
const UserValidation = require('../../domain/UserValidation.js')
const AuthService = require('../../../auth/domain/AuthService.js');
const GlobalValidation = require('../../../../lib/validation/GlobalValidation.js')
const {usernameObjSchema} = require('../../../../lib/validation/schemas/GlobalSchemas.js')

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

//Follow
router.get('/follow/:username', 
    catchAsync(AuthService.requireAuth),
    catchAsync(GlobalValidation.validateParam(usernameObjSchema)),
    catchAsync(UserService.follow),
    async function (req, res) {
    res.status(200).json(res.result)
});
//Unfollow
router.get('/unfollow/:username', 
    catchAsync(AuthService.requireAuth),
    catchAsync(GlobalValidation.validateParam(usernameObjSchema)),
    catchAsync(UserService.unfollow),
    async function (req, res) {
    res.status(200).json(res.result)
});

//Send Friend Request
router.get('/friend-request/send/:username', 
    catchAsync(AuthService.requireAuth),
    catchAsync(GlobalValidation.validateParam(usernameObjSchema)),
    catchAsync(UserService.sendFriendRequest),
    async function (req, res) {
    res.status(200).json(res.result)
});
//Accept Friend Request
router.get('/friend-request/accept/:username', 
    catchAsync(AuthService.requireAuth),
    catchAsync(GlobalValidation.validateParam(usernameObjSchema)),
    catchAsync(UserService.acceptFriendRequest),
    async function (req, res) {
    res.status(200).json(res.result)
});

//Unfollow
router.get('/unfriend/:username', 
    catchAsync(AuthService.requireAuth),
    catchAsync(GlobalValidation.validateParam(usernameObjSchema)),
    catchAsync(UserService.unfriend),
    async function (req, res) {
    res.status(200).json(res.result)
});

module.exports = { apiRoot, router };