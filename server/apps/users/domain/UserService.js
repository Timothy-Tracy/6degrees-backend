
const { v7: uuidv7 } = require('uuid');
const NodeService = require('../../nodes/domain/NodeService.js')
const UserRepository = require('../data-access/UserRepository.js')
var crypto = require('crypto');


    async function createUser(req, res, next){
        console.log("Creating a new user", JSON.stringify(req.body))
        let newUserUUID = uuidv7();
        var hash = crypto.createHash('sha256').update(req.body.password.toString()).digest('base64');
        const newUser = {
            USER_UUID : newUserUUID,
            first_name : req.body.firstName,
            last_name : req.body.lastName,
            email : req.body.email,
            password : hash,
            mobile : req.body.mobile,
        }
        res.user = newUser;
        next()


    }

    async function fetchUserByUUID(UUUID){
        
        let promise = new Promise((resolve, reject) => {
                resolve(UserRepository.fetchUserByUUID(UUUID));
                reject("Error");
            

        })

        promise.then(result => {console.log(result); return result})
        return result;
    }



module.exports = {createUser,fetchUserByUUID};