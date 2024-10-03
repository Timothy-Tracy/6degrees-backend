import { DateTime, Integer } from 'neo4j-driver';
import {models} from '../../../db/neo4j/models/models'
import { POSTInstance, SHARENODE, SHARENODEInstance, USERInstance } from '../../../db/neo4j/models/modelDefinitions';
import { AppError } from '../../../../lib/error/customErrors';
import { QueryBuilder, QueryRunner, Where } from 'neogma';
import neogma from '../../../db/neo4j/neogma/neogma';
const { v7: uuidv7 } = require('uuid');

export class NodeService {
    static async createEdge(post: POSTInstance, shareNode: SHARENODEInstance, degree: number){
        const relationshipSearch = await post.findRelationships({
            alias:'SHARENODE',
            where: {
                relationship:{},
                target:{
                    uuid:shareNode.uuid
                }
            }
        })
        const relationship = relationshipSearch[0].relationship
        if (relationship){
            throw new AppError('Edge already exists', 500);
        } else {
            post.relateTo(    {
                alias:'SHARENODE',
                 where: {
                         uuid: shareNode.uuid,
                 },
                 properties: {
                     uuid: uuidv7(),
                     degree: degree
                 },
                 assertCreatedRelationships: 1,
             })

             
        }
        
    }
    static async nodeIsRelatedToPost(post: POSTInstance, shareNode: SHARENODEInstance){
        const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
        const result = await new QueryBuilder()
        .match({identifier: 'sn', where: {uuid: shareNode.uuid}})
        .match({identifier: 'p', where: {uuid: post.uuid}})
        .raw('MATCH PATH = (sn)-[:EDGE*]-(p)')
        .return('PATH')
        .run(queryRunner)
        
        return result.records.length > 0 ? true:false
    }
    static async getNodeByUser(user: USERInstance){
        const sn = await user.shareNode()
        return sn
    }


}