//test.ts
import neogma from "./neogma";
import { models } from "../models/models";

const { v7: uuidv7 } = require('uuid');

async function test(){
    const user = await models.USER.findOne({ where: {username: 'timothytracytest',},throwIfNotFound: true,});
    if(user){
        console.log(user)
        const snf = await user.shareNode()
        console.log(snf)
        if (snf) {
            const uf = await models.SHARENODE.findRelationships({alias:"USER", where: {source:{uuid:snf.uuid}}})
            console.log(uf[0].target)
        }

    }
    
    
   
   
}

test()