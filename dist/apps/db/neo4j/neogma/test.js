"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models/models");
const NodeService_1 = require("../../../nodes/v2/domain/NodeService");
const { v7: uuidv7 } = require('uuid');
async function test() {
    const user = await models_1.models.USER.findOne({ where: { username: 'timothytracytest', }, throwIfNotFound: true, });
    if (user) {
        //console.log(user)
        const snf = await user.shareNode();
        //console.log(snf)
        if (snf) {
            const post = await models_1.models.POST.findByQuery('the-source-post');
            //console.log(post)
            //await NodeService.createEdge(post, snf, 3)
            const getNodeByUser = await NodeService_1.NodeService.getNodeByUser(user);
            console.log(getNodeByUser);
            // const uhnip = await NodeService.nodeIsRelatedToPost(post, getNodeByUser)
            // console.log(uhnip)
            const bdp = await NodeService_1.NodeService.backwardsDistributionPath(post, getNodeByUser);
            console.log(bdp);
            // const fdp = await NodeService.fowardsDistributionPath(post,snf)
            // console.log(fdp)
            const tbpd = await NodeService_1.NodeService.transformPathData(bdp);
            console.log(tbpd);
            // const tfpd = await NodeService.transformPathData(fdp)
            // console.log(tfpd)
            //const uf = await models.SHARENODE.findRelationships({alias:"USER", where: {source:{uuid:snf.uuid}}})
            //console.log(uf[0].target)
        }
    }
}
test();
//# sourceMappingURL=test.js.map