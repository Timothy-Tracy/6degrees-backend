import { PostError } from "../../../../lib/error/customErrors"
import { models } from "../../../db/neo4j/models/models"
import applogger from '../../../../lib/logger/applogger';
import { POSTInstance } from "../../../db/neo4j/models/modelDefinitions";
import { QueryBuilder, QueryRunner } from "neogma";
import neogma from "../../../db/neo4j/neogma/neogma";
const logger = applogger.child({'module':'PostService'});



export class PostService{
    static async safeFindPostByUUID(uuid: string){
        const log = logger.child({'function': 'safeFindPostByUUID'})
        log.trace(uuid)
        let post  = await models.POST.findOne({where:{uuid:uuid} })
        if (!post){
            throw new PostError(`Post not found. uuid=${uuid}`, 404)
        }
        return post
    }

    static async updatePost(post: POSTInstance, updatedData: object){
        const log = logger.child({'function': 'updatePost'})
        log.trace(post.uuid)
        
        Object.entries(updatedData).forEach(([key, index]) => {
            post[key] = updatedData[key]
        })

        await post.save()
    }
    static async deletePost(post: POSTInstance){
        const log = logger.child({'function': 'deletePost'})
        log.trace(post.uuid)
        const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
        const result = await new QueryBuilder()
        .match({identifier: 'post', where: {uuid: post.uuid}})
        .raw(`OPTIONAL MATCH ()-[nexts:NEXT* {post_uuid: "${post.uuid}"}]->() WITH  nexts, post FOREACH (rel IN nexts | DELETE rel)DETACH DELETE post`)
        .run(queryRunner)
    }
}