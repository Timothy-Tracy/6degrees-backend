const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'PostMiddleware' });
const PostService = require('./PostService.js');
const AccessService = require('./../../access/domain/AccessService.js')
const qs = require('qs')

async function getPostsByUser(req,res,next){

}

async function findOne(req,res,next){
    const log = logger.child({'function':'findOne'});
    log.trace(req.query)
    
    const {properties} = req.query;
    const result = await PostService.findOne({properties:properties})

    res.result = result;
    next()

}

async function findMany(req,res,next){
    const log = logger.child({'function':'findMany'});
    log.trace(req.query)
    let output = {data:[]};
    const {target} = req.query;
    const result = await PostService.findMany({properties:target, withVisibility:true})
    

    ///get some list of uuids

    if(res.locals.source_access_levels){
        //with firewall
        output.source_access_levels = res.locals.source_access_levels
        output.message = `Found posts by ${JSON.stringify(target)} with access firewall`
        for (let i = 0; i<result.data.length; i++){
            let canAccessResult = await AccessService.canAccess({sourceAccessLevels: res.locals.source_access_levels}, {targetAccessLevels: result.data[i].visibility})
            let x = canAccessResult.boolean
                if(x===true){
                    output.data.push(result.data[i])
                
            }
            
        }
    } else {
        //without firewall
        output.message = `Found posts by ${JSON.stringify(target)} with NO access firewall`
        output.data = result.data;
        
    }

    res.result = output
    next()

}





module.exports = {
    findOne,
    getPostsByUser,
    findMany
}