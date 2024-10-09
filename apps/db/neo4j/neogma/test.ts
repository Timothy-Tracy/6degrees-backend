//test.ts
import neogma from "./neogma";
import { models } from "../models/models";
import { NodeService } from "../../../nodes/domain/NodeService";

const { v7: uuidv7 } = require('uuid');

async function test(){
    const user = await models.USER.findOne({ where: {username: 'timothytracytest',},throwIfNotFound: true,});
    if(user){
        //console.log(user)
        const snf = await user.shareNode()
        //console.log(snf)
        if (snf) {
            const post = await models.POST.findByQuery('the-source-post')
            //console.log(post)
            //await NodeService.createEdge(post, snf, 3)
            // const getNodeByUser = await NodeService.getNodeByUser(user)
            // console.log(getNodeByUser)
            // const uhnip = await NodeService.nodeIsRelatedToPost(post, getNodeByUser)
            // console.log(uhnip)
            // const bdp = await NodeService.backwardsDistributionPath(post,getNodeByUser)
            // console.log(bdp)
            // const fdp = await NodeService.fowardsDistributionPath(post,snf)
            // console.log(fdp)
            // const tbpd = await NodeService.transformPathData(bdp)
            // console.log(tbpd)
           //await NodeService.createEdge(post, getNodeByUser)
            // const tfpd = await NodeService.transformPathData(fdp)
            // console.log(tfpd)
            //const uf = await models.SHARENODE.findRelationships({alias:"USER", where: {source:{uuid:snf.uuid}}})
            //console.log(uf[0].target)
        }

    }
    
    
   
   
}

test()