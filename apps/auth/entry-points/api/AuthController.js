var express = require('express');
var router = express.Router();
const apiRoot = '/api/auth';
const customErrors = require('../../../../lib/error/customErrors.js')
const catchAsync = customErrors.catchAsync;
const AuthService = require('../../domain/AuthService.js')
const AuthValidation = require('../../domain/AuthValidation.js')


router.post('/login', catchAsync(AuthValidation.validateLoginInput), catchAsync(AuthService.login), function (req, res) {
    res.status(200).json(res.locals.auth.JwtToken)
});
router.post('/verify', catchAsync(AuthService.verify), function (req, res) {
    res.status(200).json(res.locals.auth.tokenData)
});


module.exports = { apiRoot, router };