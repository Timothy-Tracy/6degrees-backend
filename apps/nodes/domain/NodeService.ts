import { DateTime, integer, Integer } from 'neo4j-driver';
import {models} from '../../db/neo4j/models/models'
import { AppError } from '../../../lib/error/customErrors';
import { QueryBuilder, QueryRunner, Where } from 'neogma';
import neogma from '../../db/neo4j/neogma/neogma';
import applogger from '../../../lib/logger/applogger';
import { POSTInstance } from '../../db/neo4j/models/types/nodes/POST';
import { SHARENODEInstance } from '../../db/neo4j/models/types/nodes/SHARENODE';
import { generateDateTime } from '../../../lib/util/generateDateTime';
const logger = applogger.child({'module':'NodeService'});
const { v7: uuidv7 } = require('uuid');
  
export class NodeService {
    static async getPreceedingEdge(post: POSTInstance, shareNode: SHARENODEInstance){
        const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
        const result = await new QueryBuilder()
        .match({identifier: 'node', where: {uuid: shareNode.uuid}})
        .raw(`MATCH (n)-[next:NEXT {post_uuid: "${post.uuid}"}]->(node)`)
        .return('edge')
        .run(queryRunner)
        return result.records[0].get('next').properties
    }
    static async createEdge(post: POSTInstance, shareNode: SHARENODEInstance, sourceShareNode?: SHARENODEInstance){
      const log = logger.child({'function': 'createEdge'})  
      log.info('EDGE BEING CREATED')
      if(!sourceShareNode){
            const postToNext= await post.relateTo({
                alias: "SHARENODE",
                where: {
                    uuid: shareNode.uuid,
                },
                properties: {
                    uuid: uuidv7(),
                    post_uuid: post.uuid,
                    degree: 0,
                    hash:`${post.uuid}<-${post.uuid}->${shareNode.username}`,

                    method: 'default',
                    createdAt: generateDateTime(),
                    updatedAt: generateDateTime()
                },
                assertCreatedRelationships: 1,
            })
            logger.info(postToNext)

        } else {
            const prev = await sourceShareNode.prevEdge(post)
            const resultt = await models.SHARENODE.relateTo({
                alias: "SHARENODE",
                where: {
                    source: {uuid: sourceShareNode.uuid},
                    target:{uuid:shareNode.uuid}
                },
                properties:{
                    uuid: uuidv7(),
                    post_uuid: post.uuid,
                    degree:Number(prev.degree) + 1,
                    hash:`${sourceShareNode.username}<-${post.uuid}->${shareNode.username}`,
                    method: 'default',
                    createdAt: generateDateTime(),
                    updatedAt: generateDateTime()
                },
                assertCreatedRelationships: 1
            })

            
        }
    }
    // static async createAnonSharenode(){
    //     const log = logger.child({'function': 'createAnonSharenode'})
    //     log.trace('');
    //     const anonNode = await models.SHARENODE.createOne({uuid: uuidv7(),anon:true})
    //     return anonNode
    // }
    // static async createEdgeUnauthorized(post: POSTInstance, sourceShareNode: SHARENODEInstance){
    //     const prevEdge = await sourceShareNode.prevEdge(post)
    //     const anonNode = await models.SHARENODE.createOne({uuid: uuidv7(),anon:true})
    //     await models.SHARENODE.relateTo({
    //         alias: 'SHARENODE',
    //         where:{
    //             source: {uuid: sourceShareNode.uuid},
    //             target:{uuid:anonNode.uuid}
    //         },
    //         properties: {
    //             method: 'default',
    //             post_uuid: post.uuid,
    //             degree: Number(new Integer(prevEdge.degree).add(new Integer(1))),
    //         }
    //     }).then(() => console.log('created relationship'))

    //     return anonNode
    // }


}