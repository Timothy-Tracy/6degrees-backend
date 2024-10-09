import { NextFunction } from "express";
import { models } from "../../db/neo4j/models/models";
import { PostError, UserError } from "../../../lib/error/customErrors";
import applogger from '../../../lib/logger/applogger';
import z, { ZodSchema } from "zod";
import { encode, decode } from 'html-entities';
import DOMPurify from "isomorphic-dompurify";
import { generateSlug } from "random-word-slugs";
import { NodeService } from "../../nodes/domain/NodeService";
import { QueryBuilder, QueryRunner } from "neogma";
import neogma from "../../db/neo4j/neogma/neogma";
import { PostService } from "./PostService";
import { filterData } from "../../../lib/util/filterData";
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

    static async createPost(req: any, res:any, next:NextFunction){
        if(!res.locals.user){
            logger.warn('no user yet')

            let username = req.query.username
            res.locals.user = await models.USER.findOne({where:{username:username}})
            if (!res.locals.user){
                throw new UserError("error finding user from username", 500)
            }
          
        }
        const user = res.locals.user
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
        if(!res.locals.user){
            logger.warn('no user yet')
            let username = req.query.username
            const user = await models.USER.findOne({where:{username:username}})
            if (!user){
                throw new UserError("error finding user from username", 500)
            }
            res.locals.user = user;
        }
        
        let post = await PostService.safeFindPostByUUID(req.query.post_uuid)
        await PostService.verifyParentUser(post, res.locals.user)
        await PostService.updatePost(post, res.locals.postData)
        next()
    }
    static async deletePost(req: any, res:any, next:NextFunction){
        if(!res.locals.user){
            let username = req.query.username
            const user = await models.USER.findOne({where:{username:username}})
            if (!user){
                throw new UserError("error finding user from username", 500)
            }
            res.locals.user = user;
        }
        
        logger.warn(res.locals)
        let post = await PostService.safeFindPostByUUID(req.query.post_uuid)
        await PostService.verifyParentUser(post, res.locals.user)
        await PostService.deletePost(post)
        res.result = {data:post.dataValues,message: `Post uuid=${post.uuid} successfully deleted`}
        next()
    }
    static async fetchPost(req: any, res:any, next:NextFunction){
        let post;
        if(req.query.post_uuid){
            z.string().uuid().safeParse(req.query.post_uuid)

            post = await PostService.safeFindPostByUUID(req.query.post_uuid)
        } else if (req.query.post_query){
            post = await PostService.safeFindPostByQuery(req.query.post_query)
        } else {
            throw new PostError('Query parameters insufficient', 403)
        }
       
        let data = PostService.processDataValues(post)
        let user = await post.user()
        data = {...data, username:user.username}
        logger.info(data)
        res.result = {data:data,message: `Post uuid=${post.uuid} found`}
        next()
    }
}