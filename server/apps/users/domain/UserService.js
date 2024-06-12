
const { v7: uuidv7 } = require('uuid');
const NodeService = require('../../nodes/domain/NodeService.js')
const UserRepository = require('../data-access/UserRepository.js')
var crypto = require('crypto');


    function createUser(email, pwd,firstName, lastName,  mobile){
        console.log("Creating a new user")
        let newUserUUID = uuidv7();
        var hash = crypto.createHash('sha256').update(pwd.toString()).digest('base64');
        const newUser = {
            USER_UUID : newUserUUID,
            first_name : firstName,
            last_name : lastName,
            email : email,
            password : hash,
            mobile : mobile,
        }
        UserRepository.createUser(newUser);
        return (newUser);
    }



module.exports = {createUser};