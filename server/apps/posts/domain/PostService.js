
const { v7: uuidv7 } = require('uuid');
const NodeService = require('../../nodes/domain/NodeService.js')
const PostRepository = require('../data-access/PostRepository.js')
const NodeRepository = require('../../nodes/data-access/NodeRepository.js')

    async function create(req,res,next){
        
        console.log("PostService: creating new post")
        let UUID = uuidv7();
        const sourceNode = await NodeService.createSourceNode(UUID,req.body.USER_UUID);
        const newPost = {
            POST_UUID : UUID,
            USER_UUID : req.body.USER_UUID,
            SOURCE_NODE_UUID : sourceNode.NODE_UUID,
            title : req.body.title,
            description : req.body.description,
            fulfilled : false
        }
        res.result = await PostRepository.create(newPost);
        await NodeRepository.create(sourceNode)
        next();
    }

    async function deletePost(req, res, next) {
        console.log("PostService: Deleting Node ", req.params.uuid)
        const myresult = await PostRepository.deletePost(req.params.uuid);
        res.result = { "data": myresult }
        next()
    }



module.exports = {create, deletePost};