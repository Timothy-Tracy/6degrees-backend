var express = require('express');
var router = express.Router();
const apiRoot = '/api/auth';
const customErrors = require('../../../../lib/error/customErrors.js')
const catchAsync = customErrors.catchAsync;
const AuthService = require('../../domain/AuthService.js')
const AuthValidation = require('../../domain/AuthValidation.js')
const UserValidation = require('../../../users/domain/UserValidation.js')
const UserService = require('../../../users/domain/UserService.js')

router.post('/login', catchAsync(AuthValidation.validateLoginInput), catchAsync(AuthService.login), function (req, res) {
    res.header('Access-Control-Allow-Credentials', true);
    res.cookie('token', res.locals.auth.JwtToken, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 3600000 // 1 hour in milliseconds
      });
    res.status(200).json(res.result)
});
router.get('/verify', catchAsync(AuthService.verify), function (req, res) {
    res.status(200).json(res.locals.auth.tokenData)
});
router.post('/register',
    catchAsync(UserValidation.validateNewUserInput),
    catchAsync(AuthService.register),
    catchAsync(UserService.create),
    function (req,res){
        res.status(200).json(res.result)
    }
)

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  });


module.exports = { apiRoot, router };