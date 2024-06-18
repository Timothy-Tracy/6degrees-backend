
const { v7: uuidv7 } = require('uuid');
const NodeService = require('../../nodes/domain/NodeService.js')
const UserRepository = require('../data-access/UserRepository.js')


var crypto = require('crypto');

async function create(req, res, next) {
    //todo
    //req.body is valid
    console.log("Creating a new user", JSON.stringify(req.body))
    let newUserUUID = uuidv7();

    var hash = crypto.createHash('sha256').update(req.body.password.toString()).digest('base64');
    const newUser = {
        USER_UUID: newUserUUID,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: hash,
        mobile: req.body.mobile,
    }
    const myresult = await UserRepository.create(newUser);
    res.result = { "data": myresult }
    next()
}

async function findAll(req, res, next) {
    const myresult = await UserRepository.findAll();
    res.result = { "data": myresult }
    next()
}
async function findOneByUUID(req, res, next) {
    const myresult = await UserRepository.findOneByUUID(req.params.UUID);
    res.result = { "data": myresult }
    next()
}

async function deleteUser(req, res, next) {

    const myresult = await UserRepository.deleteUser(req.body.USER_UUID);
    res.result = { "data": myresult }
    next()
}



module.exports = {  findAll, findOneByUUID, create, deleteUser };