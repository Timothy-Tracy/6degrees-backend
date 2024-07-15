var UserService = require('../../domain/UserService.js')
var UserValidation = require('../../domain/UserValidation.js')

var UserRepository = require('../../data-access/UserRepository.js')
let AuthService = require('../../../auth/domain/AuthService.js');
var express = require('express');
var router = express.Router();
const apiRoot = '/api/users';
const customErrors = require('../../../../lib/error/customErrors.js')
const catchAsync = customErrors.catchAsync;

//create
router.post('/', catchAsync(UserValidation.validateNewUserInput), catchAsync(UserService.create),async function (req, res) {
    res.status(200).json(res.result)
});
//Update
router.patch('/', catchAsync(AuthService.requireAuth), catchAsync(UserValidation.validateMutableUserInput), catchAsync(UserService.update), async function (req, res){
    res.status(200).json(res.result)
});

router.delete('/', catchAsync(AuthService.requireAuth), catchAsync(UserService.deleteUser), async function (req, res){
    res.status(200).json(res.result)
});

router.get('/', UserService.findAll, async function (req, res){
    res.status(200).json(res.result)
});

router.get('/:UUID', UserService.findOneByUUID, async function (req, res){
    console.log("UserController: Finding User By UUID ")

    res.status(200).json(res.result)
});




module.exports = { apiRoot, router };