var UserService = require('../../domain/UserService.js')
var UserRepository = require('../../data-access/UserRepository.js')
var express = require('express');
var router = express.Router();
const apiRoot = '/api/users';


router.post('/', UserService.create, function (req, res) {
    res.status(200).json(res.result)
});

router.get('/', UserService.findAll, async function (req, res){
    res.status(200).json(res.result)
});

router.get('/:UUID', UserService.findOneByUUID, async function (req, res){
    res.status(200).json(res.result)
});

router.delete('/', UserService.deleteUser, async function (req, res){
    res.status(200).json(res.result)
});

module.exports = { apiRoot, router };