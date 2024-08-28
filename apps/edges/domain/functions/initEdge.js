const randomWordSlugs = require('random-word-slugs')
const { v7: uuidv7 } = require('uuid');

const mylogger = require('../../../../lib/logger/logger.js');

const log = mylogger.child({ 
    'app': 'edges',
    'function': 'initEdge' 
});
async function initEdge(node) {

    
    log.trace({node});

    let uuid = uuidv7();
    let obj = {
        EDGE_UUID: uuid,
        SOURCE_NODE_UUID: node.NODE_UUID,
        NODE_UUID: node.NODE_UUID,

        EDGE_QUERY: randomWordSlugs.generateSlug(),
        degree: node.degree,
    }
    
    return (obj);
}


module.exports = initEdge