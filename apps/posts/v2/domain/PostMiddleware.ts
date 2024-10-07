import { NextFunction } from "express";
import { models } from "../../../db/neo4j/models/models";
import { PostError, UserError } from "../../../../lib/error/customErrors";
import applogger from '../../../../lib/logger/applogger';
import z, { ZodSchema } from "zod";
import { PostSchema } from "../../../validation/PostSchema";
import { encode, decode } from 'html-entities';
import DOMPurify from "isomorphic-dompurify";
import { generateSlug } from "random-word-slugs";
import { NodeService } from "../../../nodes/v2/domain/NodeService";
import { QueryBuilder, QueryRunner } from "neogma";
import neogma from "../../../db/neo4j/neogma/neogma";
import { PostService } from "./PostService";
const { v7: uuidv7 } = require('uuid');

const logger = applogger.child({'module':'PostMiddleware'});


export class PostMiddleware{
    static validateInput = (schema: ZodSchema) => (req: any, res: any, next:NextFunction)=>{
        const log = logger.child({'function': 'validateInput'})
        log.trace('')
        const post = schema.safeParse(req.body.data)
        if (!post.success) {
            logger.error('Invalid post input', { errors: post.error.errors });
            return next(new PostError('Invalid post input', 403));
        }

        Object.entries(post.data).forEach(([key, index]) => {
            post.data[key] = encode(post.data[key], { mode: 'specialChars' });
            post.data[key] = DOMPurify.sanitize(post.data[key], { ALLOWED_TAGS: [] });

        })
        
        const {data} = post
        res.locals.postData = data;
        next()
    }

    static async validatePostInput(req: any, res:any, next:NextFunction){
        const post = PostSchema.safeParse(req.body.data)
        if (!post.success) {
            logger.error('Invalid post input', { errors: post.error.errors });
            return next(new PostError('Invalid post input', 400));
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
            throw new PostError("error finding user from username", 500)
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
            throw new PostError("error creating post", 500)
        }

        await post.relateTo({alias:"USER", where:{
                uuid: user.uuid
            }
        });

        let userSN = await user?.shareNode()
        if (!userSN){
            throw new PostError("error finding user sharenode", 500)
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
            throw new UserError("error finding user from username", 404)
        }
        logger.warn(res.locals)
        let post = await PostService.safeFindPostByUUID(req.query.post_uuid)
        await PostService.updatePost(post, res.locals.postData)
        next()
    }
    static async deletePost(req: any, res:any, next:NextFunction){
        let username = req.query.username
        const user = await models.USER.findOne({where:{username:username}})
        if (!user){
            throw new UserError("error finding user from username", 500)
        }
        logger.warn(res.locals)
        let post = await PostService.safeFindPostByUUID(req.query.post_uuid)
        await PostService.deletePost(post)
        res.result = {data:post.dataValues,message: `Post uuid=${post.uuid} successfully deleted`}
        next()
    }
}