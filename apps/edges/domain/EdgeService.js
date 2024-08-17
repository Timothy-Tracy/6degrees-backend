const { v7: uuidv7 } = require('uuid');
const EdgeRepository = require('../data-access/EdgeRepository.js');
const randomWordSlugs = require('random-word-slugs')
const mylogger = require('../../../lib/logger/logger.js');
const { AppError, catchAsync } = require('../../../lib/error/customErrors.js');
const logger = mylogger.child({ 'module': 'EdgeService' }, {options:{name:'EdgeService'}});


async function createDistribution(node) {
    const log = logger.child({'function':'createDistribution'});
    log.trace();
    log.debug(node)
    let UUID = uuidv7();
    var obj = {
        EDGE_UUID: UUID,
        POST_UUID: node.POST_UUID,
        SOURCE_NODE_UUID: node.NODE_UUID,
        DESTINATION_NODE_UUID: null,
        EDGE_QUERY: randomWordSlugs.generateSlug(),
        degree: node.degree,
    }
    logger.debug(obj, "Creating Distribution")

    const result = await EdgeRepository.create(obj)
    logger.info("Edge Created")
    return (result);
}
async function createDistributionNew(NODE_UUID) {

    const log = logger.child({'function':'createDistributionNew'});
    log.trace();

    let uuid = uuidv7();
    var obj = {
        EDGE_UUID: uuid,
        SOURCE_NODE_UUID: NODE_UUID,
        EDGE_QUERY: randomWordSlugs.generateSlug(),
        degree: node.degree,
    }
    
    const result = await EdgeRepository.create(obj)
    return (result);
}

async function findOneByQuery(query) {
    const result = await EdgeRepository.findOneByQuery(query);
    return (result);
}

async function findOneByNodeUUID(NODE_UUID){
    const Repository = require('../../db/neo4j/data-access/Repository.js');
    const log = logger.child({'function':'findOneByNodeUUID'});
    log.trace();

    const result = await Repository.getRelationships(
        {
            sourceLabel:'NODE', 
            sourceProperties:{'NODE_UUID':NODE_UUID},
            relationshipType:'EDGE'
        }
    )
    return result;


}


async function getUuidByQuery(query, label){
    const Repository = require('../../db/neo4j/data-access/Repository.js');
    const log = logger.child({'function':'getUuidByQuery'});
    log.trace();
    let result = []
    let relationship = {
        type: 'EDGE',
        properties: {EDGE_QUERY: query}

    }
    let nodeResult = await Repository.getRel(
        {
            label: 'NODE',

        },
        relationship)
    
    let source = nodeResult.data[0].source.properties;
    let sourceParam = {
        label: 'NODE',
        properties: {'NODE_UUID': source.NODE_UUID}
    }

    if(label == null) throw new AppError('No label provided', 500)
    switch (label){
        case 'NODE' : {
            log.debug('case NODE')
            result.push(source.NODE_UUID)
            break
        } 
        case 'POST' : {
            log.debug('case POST')
            let postResult = await Repository.getRel(
                sourceParam,
                {
                    type: 'PARENT_POST'
                },
                {
                    label: label,
        
                }
            )
            log.debug(postResult)
            let post = postResult.data[0].target.properties;
            result.push(post.POST_UUID)
            break
        }

        case 'USER' : {
            let userResult = await Repository.getRel(
                sourceParam,
                {
                    type: 'PARENT_USER'
                },
                {
                    label: label,
        
                }
            )
            let user = userResult.data[0].target.properties;
            result.push(user.USER_UUID)
            break

        }

        case 'COMMENT' : {
            let commentResult = await Repository.getRel(
                sourceParam,
                {
                    type: 'PARENT_NODE',
                    direction:'left'
                },
                {
                    label: label,
        
                }
            )
          
            let comments = commentResult.data.map((record)=> (record.target.properties.COMMENT_UUID))
            result = comments.map((commentUuid) => ( commentUuid))
            break
        }
        default:{
            throw new AppError('switch statement for label default case', 500)
            break
        }
    }
    log.info(result)
    return result
}


async function test() {
    
    let result =await catchAsync(await getUuidByQuery('silly-gray-microphone', 'COMMENT'))
    logger.info(result)
}

//test()
module.exports = { createDistributionNew,createDistribution, findOneByQuery,findOneByNodeUUID,getUuidByQuery }