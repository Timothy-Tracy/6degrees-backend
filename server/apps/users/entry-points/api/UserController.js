var UserService = require('../../domain/UserService.js')
var UserRepository = require('../../data-access/UserRepository.js')
var express = require('express');
var router = express.Router();
const apiRoot = '/api/users';


router.post('/', UserService.createUser, UserRepository.createUser, function (req, res) {
    res.json({message:'success'})
});

router.get('/fetch', async function (req, res) {
    console.log('Incoming Data GET Request for a User via UUID');
    console.log('query is ', req.query.uuid);
    

    const data = await UserService.fetchUserByUUID(req.query.uuid)
        .then(
            function(result){
                console.log("resolved, sending ", result)
                return result;
                }
            ,function(err){
                console.log(err)
                return err;
        })
        console.log("resolved, sending ", data)
        res.send(data)
    
});

router.get('/', function (req, res){
   res.send(UserRepository.findAll());
});

module.exports = { apiRoot, router };