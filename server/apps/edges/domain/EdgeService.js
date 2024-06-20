const { v7: uuidv7 } = require('uuid');
const EdgeRepository =require('../data-access/EdgeRepository.js');
const randomWordSlugs = require('random-word-slugs')

async function createDistribution(node){
    console.log("EdgeService: Creating Distribution")
    
            let UUID = uuidv7();
            console.log('nu', node.NODE_UUID)
            var obj = {
                EDGE_UUID : UUID,
                POST_UUID : node.POST_UUID,
                SOURCE_NODE_UUID : node.NODE_UUID,
                DESTINATION_NODE_UUID : null,
                EDGE_QUERY : randomWordSlugs.generateSlug(),
                degree : node.degree,
            }
            
            const result = await EdgeRepository.create(obj)
            console.log("EdgeService: Source Node Created")
            return(result);
        }

async function findOneByQuery(query){
    const result = await EdgeRepository.findOneByQuery(query);
    console.log(result);
    return(result.result);
}

module.exports = {createDistribution, findOneByQuery}