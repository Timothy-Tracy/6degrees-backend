import { NextFunction } from "express";
import { models } from "../../../db/neo4j/models/models";
import { AppError } from "../../../../lib/error/customErrors";
import applogger from '../../../../lib/logger/applogger';
import z from "zod";
import { PostSchema } from "../../../validation/PostSchema";
import { encode, decode } from 'html-entities';
import DOMPurify from "isomorphic-dompurify";
import { generateSlug } from "random-word-slugs";
import { NodeService } from "../../../nodes/v2/domain/NodeService";
import { QueryBuilder, QueryRunner } from "neogma";
import neogma from "../../../db/neo4j/neogma/neogma";
const { v7: uuidv7 } = require('uuid');

const logger = applogger.child({'module':'PostMiddleware'});


export class PostMiddleware{
    static async validatePostInput(req: any, res:any, next:NextFunction){
        const post = PostSchema.safeParse(req.body.data)
        if (!post.success) {
            logger.error('Invalid post input', { errors: post.error.errors });
            return next(new AppError('Invalid post input', 400));
        }
        logger.info(post)
        const { title, body } = post.data;

        const newTitle = encode(post.data.title, { mode: 'specialChars' });
        const newBody = encode(post.data.body, { mode: 'specialChars' });
        const sanitizedTitle = DOMPurify.sanitize(newTitle, { ALLOWED_TAGS: [] });
        const sanitizedBody = DOMPurify.sanitize(newBody, {
            ALLOWED_TAGS: []
        });

        res.locals.postData = { title: sanitizedTitle, body: sanitizedBody };
        next()
    }

    static async createPost(req: any, res:any, next:NextFunction){
        let username = req.query.username
        const user = await models.USER.findOne({where:{username:username}})
        if (!user){
            throw new AppError("error finding user from username", 500)
        }
        logger.warn(res.locals)
        let post  = await models.POST.createOne({
            
                uuid:uuidv7(),
                query: generateSlug(),
                title: res.locals.postData.title,
                body: res.locals.postData.body
        })
        logger.warn(post)
        if (!post){
            throw new AppError("error creating post", 500)
        }

        await post.relateTo({alias:"USER", where:{
                uuid: user.uuid
            }
        });

        let userSN = await user?.shareNode()
        if (!userSN){
            throw new AppError("error finding user sharenode", 500)
        }
        await NodeService.createEdge(post, userSN)
        
        res.result ={
            data: post.dataValues
        }
        next()
    }
    static async updatePost(req: any, res:any, next:NextFunction){
        let username = req.query.username
        const user = await models.USER.findOne({where:{username:username}})
        if (!user){
            throw new AppError("error finding user from username", 500)
        }
        logger.warn(res.locals)
        let post  = await models.POST.findOne({where:{uuid:req.query.post_uuid} })
        logger.warn(post)
        if (!post){
            throw new AppError("error finding post", 500)
        }

        Object.entries(res.locals.postData).forEach(([key, index]) => {
            post[key] = res.locals.postData[key]
        })

        await post.save()
        
        
        next()
    }
    static async deletePost(req: any, res:any, next:NextFunction){
        let username = req.query.username
        const user = await models.USER.findOne({where:{username:username}})
        if (!user){
            throw new AppError("error finding user from username", 500)
        }
        logger.warn(res.locals)
        let post  = await models.POST.findOne({where:{
            uuid:req.query.post_uuid
        }
            
               
        })
        logger.warn(post)
        if (!post){
            throw new AppError("error finding post", 500)
        }
        const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
        const result = await new QueryBuilder()
        .match({identifier: 'post', where: {uuid: post.uuid}})
        .raw(`OPTIONAL MATCH ()-[nexts:NEXT* {post_uuid: "${post.uuid}"}]->() WITH  nexts, post FOREACH (rel IN nexts | DELETE rel)DETACH DELETE post`)
        .run(queryRunner)

        res.result = {
            data:
                post.dataValues
            ,
            message: `Post uuid=${post.uuid} successfully deleted`
        }

        next()
    }
}