
var RequestService = require('../../domain/RequestService.js')
var express = require('express');
var router = express.Router();
const apiRoot = '/api/requests'


router.post('/create-request', function(req, res) {
    console.log('receiving data ...');
    console.log('body is ',req.body);
    const data = req.body;
    RequestService.createRequest(data.UUUID, data.title, data.description);
    res.send(req.body);
});
module.exports = {apiRoot, router};