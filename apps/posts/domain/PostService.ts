import { PostError } from "../../../lib/error/customErrors"
import { models } from "../../db/neo4j/models/models"
import applogger from '../../../lib/logger/applogger';
import { QueryBuilder, QueryRunner } from "neogma";
import neogma from "../../db/neo4j/neogma/neogma";
import { UpdatePost } from "../../validation/PostSchema";
import { ProcessNeo4jTimestamp } from "../../../lib/util/ProcessNeo4jTimestamp";
import { POSTInstance } from "../../db/neo4j/models/types/nodes/POST";
import { USERInstance } from "../../db/neo4j/models/types/nodes/USER";
const logger = applogger.child({'module':'PostService'});



export class PostService{
    static async safeFindPostByUUID(uuid: string){
        const log = logger.child({'function': 'safeFindPostByUUID'})
        log.trace(uuid)
        let post  = await models.POST.findOne({where:{uuid:uuid} })
        if (!post){
            throw new PostError(`POST uuid=${uuid} not found. `, 404)
        }
        return post
    }
    static async safeFindPostByQuery(query: string){
        const log = logger.child({'function': 'safeFindPostByUUID'})
        log.trace(query)
        let post  = await models.POST.findByQuery(query)
        if (!post){
            throw new PostError(`POST query=${query} not found. `, 404)
        }
        return post
    }

    static async updatePost(post: POSTInstance, updatedData: UpdatePost){
        const log = logger.child({'function': 'updatePost'})
        log.trace(post.uuid)
        
        Object.entries(updatedData).forEach(([key, index]) => {
            if(key in Object.keys){
                (post as any)[key] = (updatedData as any)[key]
            }
            
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

    static async verifyParentUser(post:POSTInstance, user:USERInstance){
        const postOwner = await post.user()
        if(postOwner.uuid != user.uuid){
            throw new PostError(`USER uuid=${user.uuid} is not the owner of POST uuid=${post.uuid}`, 401)
        }
    }

    static processDataValues(post:POSTInstance){
        let obj:any = post.dataValues
        let {createdAt, updatedAt} = obj
        let x:any = createdAt
        let y:any = updatedAt
        x= x ? x?.toString():undefined
        y= y ? y?.toString():undefined
       
        return {...obj, createdAt:x, updatedAt:y}

    }

    static async extractData(post:POSTInstance){
        let data:any = post.dataValues
        const user = await post.user() || undefined
        const username = user? user.username : "undefined"
        data.username = username
        data.createdAt = data.createdAt.toString()
        data.updatedAt = data.updatedAt.toString()
        data.source_sharenode_username = username 

        return data
    }
}