var UserService = require('../../domain/UserService.js')
var express = require('express');
var router = express.Router();
const apiRoot = '/api/users';


router.post('/create', function(req, res) {
    console.log('receiving data ...');
    console.log('body is ',req.body);
    const data = req.body;
    UserService.createUser(data.email, data.password,data.first_name, data.last_name,  data.mobile);
    res.send(req.body);
});
module.exports = {apiRoot, router};