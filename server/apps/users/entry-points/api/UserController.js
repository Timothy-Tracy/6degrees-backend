var UserService = require('../../domain/UserService.js')
var UserRepository = require('../../data-access/UserRepository.js')
var express = require('express');
var router = express.Router();
const apiRoot = '/api/users';


router.post('/create', function (req, res) {
    console.log('receiving data ...');
    console.log('body is ', req.body);
    const data = req.body;
    UserService.createUser(data.email, data.password, data.first_name, data.last_name, data.mobile);
    res.send(req.body);
});

router.get('/fetch', async function (req, res) {
    console.log('receiving data ...');
    console.log('query is ', req.query.uuid);


    await UserRepository.fetchUserByUUID(req.query.uuid, (data) => {
        res.send(data);
        console.log("sent ", data)
    });
    
});

module.exports = { apiRoot, router };