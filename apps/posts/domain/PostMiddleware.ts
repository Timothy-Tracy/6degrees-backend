import { NextFunction } from "express";
import { models } from "../../db/neo4j/models/models";
import { PostError, UserError } from "../../../lib/error/customErrors";
import applogger from '../../../lib/logger/applogger';
import z, { ZodSchema } from "zod";
import { encode } from 'html-entities';
import DOMPurify from "isomorphic-dompurify";
import { generateSlug } from "random-word-slugs";
import { NodeService } from "../../nodes/domain/NodeService";
import { PostService } from "./PostService";
import { filterData } from "../../../lib/util/filterData";
import { toNeo4jDateTime } from "../../../types/Globals";
import { generateDateTime } from "../../../lib/util/generateDateTime";
import uuid from "../../../lib/util/generateUUID";
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
    static async initPostObject(req: any, res:any, next:NextFunction){

        if(req.query.post_uuid){
            res.locals.post = await PostService.safeFindPostByUUID(req.query.post_uuid)
        } else if(req.query.post_query){
            res.locals.post = await PostService.safeFindPostByQuery(req.query.post_query)
        } else {
            throw new PostError('Error Initializing POST from query parameters. req.query.post_uuid or req.query.post_query not detected. It is possible that query parameters where unintentionally not required for this route', 400)
        }
        next()
    }

    static async createPost(req: any, res:any, next:NextFunction){
        const log = logger.child({'function': 'createPost'})

        if(!res.locals.user){
            log.error("res.locals.user not initialized")
                throw new UserError("res.locals.user not initialized", 500)
        }
        const user = res.locals.user
        logger.warn(res.locals)
        let post  = await models.POST.createOne({
            
                uuid:uuidv7(),
                query: generateSlug(),
                title: res.locals.postData.title,
                body: res.locals.postData.body,
                createdAt: toNeo4jDateTime(generateDateTime()),
                updatedAt: toNeo4jDateTime(generateDateTime())
        })
        if (!post){
            throw new PostError("error creating post", 500)
        }

        const parent_user_relation = await post.relateTo({alias:"USER", where:{
                uuid: user.uuid
            }, 
            properties: {
                uuid: uuid(),
                createdAt: generateDateTime(),
                updatedAt: generateDateTime()

            }
        });

        let userSN = await user?.shareNode()
        if (!userSN){
            throw new PostError("error finding user sharenode", 500)
        }
        await NodeService.createEdge(post, userSN)
        
        res.result ={
            data: post.dataValues,
            response_data: post.dataValues
        }
        next()
    }
    static async updatePost(req: any, res:any, next:NextFunction){
        const log = logger.child({'function': 'updatePost'})
        if(!res.locals.user){
            log.error("res.locals.user not initialized")
                throw new UserError("res.locals.user not initialized", 500)
        }
        await PostService.verifyParentUser(res.locals.post, res.locals.user)
        await PostService.updatePost(res.locals.post, res.locals.postData)
        next()
    }
    static async deletePost(req: any, res:any, next:NextFunction){
        const log = logger.child({'function': 'deletePost'})
        if(!res.locals.user){
            log.error("res.locals.user not initialized")
                throw new UserError("res.locals.user not initialized", 500)
        }
        await PostService.verifyParentUser(res.locals.post, res.locals.user)
        await PostService.deletePost(res.locals.post)
        res.result = {response_data:res.locals.post.dataValues,message: `Post uuid=${res.locals.post.uuid} successfully deleted`}
        next()
    }
    static async fetchPost(req: any, res:any, next:NextFunction){
        let data = PostService.processDataValues(res.locals.post)
        let user = await res.locals.post.user()
        data = {...data, username:user.username}
        logger.info(data)
        res.result = {data:data,response_data:data,message: `Post uuid=${res.locals.post.uuid} found`}
        next()
    }


    static async adminDeletePost(req: any, res:any, next:NextFunction){
        const log = logger.child({'function': 'adminDeletePost'})
        if(!res.locals.user || res.locals.user.role != 'ADMIN'){
            log.error("res.locals.user not initialized")
                throw new UserError("res.locals.user not initialized or not admin", 500)
        }
        await PostService.deletePost(res.locals.post)
        res.result = {response_data:res.locals.post.dataValues,message: `Post uuid=${res.locals.post.uuid} successfully deleted by ADMIN`}
        next()
    }

    static async adminUpdatePost(req: any, res:any, next:NextFunction){
        const log = logger.child({'function': 'adminUpdatePost'})
        if(!res.locals.user || res.locals.user.role != 'ADMIN'){
            log.error("res.locals.user not initialized")
                throw new UserError("res.locals.user not initialized or not admin", 500)
        }
        await PostService.updatePost(res.locals.post, res.locals.postData)
        next()
    }

    
}