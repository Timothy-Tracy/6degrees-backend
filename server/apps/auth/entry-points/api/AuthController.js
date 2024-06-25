var express = require('express');
var router = express.Router();
const apiRoot = '/api/auth';
const customErrors = require('../../../../lib/error/customErrors.js')
const catchAsync = customErrors.catchAsync;
const AuthService = require('../../domain/AuthService.js')

router.post('/login', catchAsync(AuthService.login), function (req, res) {
    res.status(200).json(res.token)
});
router.post('/verify', catchAsync(AuthService.verify), function (req, res) {
    res.status(200).json(res.tokenData)
});

// router.get('/register', UserService.findAll, async function (req, res){
//     res.status(200).json(res.result)
// });

// router.get('/:UUID', UserService.findOneByUUID, async function (req, res){
//     console.log("UserController: Finding User By UUID ")

//     res.status(200).json(res.result)
// });

// router.delete('/', UserService.deleteUser, async function (req, res){
//     res.status(200).json(res.result)
// });

module.exports = { apiRoot, router };