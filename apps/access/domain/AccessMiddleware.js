const { AppError } = require('../../../lib/error/customErrors.js');
const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'AccessMiddleware' });
const AccessService = require('./AccessService.js')

const accessFirewall = (context = {type}) => async(req,res,next) =>{
    const log = logger.child({'function' : 'accessFirewall'});
    log.trace(context);
    let targetUsername = req.params.username || req.query.target.username || null;

    if(targetUsername == null){
        throw new AppError('No username provided', 500)
    }
        
    

    let source = {}
    let accessType = ''
    if(res.locals.auth.hasAuth){
        source.type= 'user'
        source.label='USER'
        source.properties = {
            'USER_UUID': res.locals.auth.tokenData.USER_UUID
        }
    }else{
        source.type = 'guest'
    }
    
    const sourceAccessLevels = await AccessService.getSourceAccessLevels(
        source
        ,
        {
            type:'user',
            label:'USER',
            properties:{'username':targetUsername}
           
        })
        res.locals.source_access_levels = sourceAccessLevels;
        res.locals.targetUsername = targetUsername
        next();
}       

module.exports = {
    accessFirewall
}