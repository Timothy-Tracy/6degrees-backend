const UserService = require('./UserService.js')
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'UserMiddleware' });

async function create(req, res, next){
    const result = await UserService.create(res.locals.newUserObj)
    res.result = result;
    next()
}


async function findOneByUsername(req, res, next){
    const log = logger.child({'function':'findOnebyUsernameMiddleware'});
    log.trace();
    const result = await UserService.findOneByUsername(req.params.username)
    res.result= result;
    next()
}
module.exports = {
    create,
    findOneByUsername
}