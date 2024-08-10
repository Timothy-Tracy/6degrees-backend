const mylogger = require('../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'AccessService' });
const Repository = require('../../db/neo4j/data-access/Repository.js');
const {catchAsync,AppError} = require('../../../lib/error/customErrors.js')


async function getTargetAccessLevels({label, properties}){
    const log = logger.child({'function': 'getAccessById'})
    log.trace();

    const res = await Repository.get({label:label, properties:properties})
    const item = res.data[0].result.properties
    return {label: label, properties, visibility: item.visibility}
}

async function canAccess({sourceAccessLevels, targetAccessLevels, targetLabel, targetProperties}){   
    let output={satisfiedConditions:[]}
    if(targetAccessLevels){

    } else {
        let resource = await getTargetAccessLevels({label: targetLabel, properties:targetProperties})
        targetAccessLevels = resource.visibility

    }
    logger.debug(targetAccessLevels, 'TARGET ACCESS LEVELS')
    output.boolean = sourceAccessLevels.some(item=> {
        if(Array.isArray(targetAccessLevels)){
            if( targetAccessLevels.includes(item)){
                output.satisfiedConditions.push(item);
                return targetAccessLevels.includes(item)
            }
        } else {
            if(item == targetAccessLevels){
                output.satisfiedConditions.push(item);
            return item == targetAccessLevels
            }
            
        }
        
    })

    return output

}
logger.info('hi')
async function getSourceAccessLevels(source = {type, label, sourceProperties}, target = {type, label, targetProperties}){
    const log = logger.child({'function': 'getAccessLevel'})
    log.trace(`${JSON.stringify(source)}`);
    let accessLevels = ['public']
    if(source.type === 'guest'){
        return accessLevels
    }

    if(source.type==='user'){
        if(target.type === 'user'){
            let getRelationshipResult = await Repository.getRelationships({
                sourceLabel: source.label,
                sourceProperties:source.properties,
                targetLabel:target.label,
                targetProperties:target.properties
            
            })
            let relationships = getRelationshipResult.map(item=>item.relationship.type)
            if(relationships.includes('FOLLOWS')){
                accessLevels.push('Followers')
            }
            if(relationships.includes('FRIENDS')){
                accessLevels.push('friends')
            }

            //log.debug(getRelationshipResult)
        }
    }
log.info(accessLevels)
return accessLevels
}
async function getPrivelidges(){
    const allIds = await getAllPostIds('timsmith');
    const reducedIds = await privelidgeReducer(allIds, ['public'], 'POST', 'POST_UUID')
    console.log(allIds)

    console.log(reducedIds)
    return ['public']
}
async function privelidgeReducer(idArray, privelidgeArray, sourceLabel, sourcePropertyKey){
    
    const log = logger.child({'function': 'privelidgeReducer'})
    log.trace()
    let result = []
    for(let i = 0; i<idArray.length; i++){
        let x = [sourcePropertyKey]
        
        const res = await Repository.get({label:sourceLabel, properties:{[sourcePropertyKey]: idArray[i]} })
        const item = res.data[0].result.properties
        if (privelidgeArray.includes(item.visibility)){
            result.push(item[sourcePropertyKey])
        }
        
        
    }
   
    log.warn(result)
}

async function test(){
    const sourceAccessLevels = await getSourceAccessLevels(
        {
            type:'user',
            label:'USER',
            properties:{'username':'janesmith'}
           
        }
        ,
        {
            type:'user',
            label:'USER',
            properties:{'username':'johnsmith'}
           
        })
        logger.info(sourceAccessLevels, 'SOURCE ACCESS LEVELS')


    const canAcc = await canAccess({sourceAccessLevels: sourceAccessLevels, targetLabel: "COMMENT", targetProperties:{"COMMENT_UUID": "0190dc21-11ef-777d-a0e0-2085fa88abdf"}})
    logger.info({canAcc}, 'Target')

}
    // test()

module.exports = {

    canAccess, 
    getTargetAccessLevels,
    canAccess,
    getSourceAccessLevels
}