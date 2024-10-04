import { NextFunction } from "express";
import { models } from "../../../db/neo4j/models/models";
import { AppError } from "../../../../lib/error/customErrors";
import { NodeService } from "./NodeService";
import { integer } from "neo4j-driver";
import applogger from '../../../../lib/logger/applogger';
const logger = applogger.child({'module':'NodeMiddleware'});

export class NodeMiddleware{
    static async  getPostByQuery(req: any, res: any, next:NextFunction){
        const log = logger.child({'function': 'getPostByQuery'});
        log.trace('')
        const post_uuid = req.query.post_uuid;
        const post_query = req.query.post_query;
        if(!(post_uuid || post_query)){
            throw new AppError("You must provide a post_uuid or a post_query in the URL query paramaters", 500)
        }
        if(post_query){
            logger.info(post_query, "res.locals.post initialized by post_query")
            res.locals.post = await models.POST.findByQuery(post_query)
        } else {
            logger.info(post_uuid, "res.locals.post initialized by post_uuid")

            res.locals.post = await models.POST.findOne({where:{uuid:post_uuid}})
        }
        if(!res.locals.post){
            throw new AppError("something went wrong getting post by query", 500)
        }
        next();
        console.log('got post')

    }
    static async  getSourceSharenodeByQuery(req: any, res: any, next:NextFunction){
        const log = logger.child({'function': 'getShareNodeByUsername'});
        log.trace('')
        const source_sharenode_uuid = req.query.source_sharenode_uuid;
        const source_sharenode_username = req.query.source_sharenode_username;
        if(!(source_sharenode_uuid || source_sharenode_username)){
            throw new AppError("You must provide a source_sharenode_uuid or a source_sharenode_username in the URL query paramaters", 500)
        }
        if(source_sharenode_uuid){
            logger.info(source_sharenode_uuid, "res.locals.source_sharenode initialized by source_sharenode_uuid")
            res.locals.source_sharenode = await models.SHARENODE.findOne({where:{uuid: source_sharenode_uuid}})
        } else {
            logger.info(source_sharenode_username, "res.locals.source_sharenode initialized by source_sharenode_username")

            res.locals.source_sharenode = await models.USER.getShareNodeByUsername(source_sharenode_username)
        }
       
        if(!res.locals.source_sharenode){
            throw new AppError("something went wrong getting SHARENODE by username", 500)
        }
        next();
    }
    static async  getTargetSharenodeByQuery(req: any, res: any, next:NextFunction){
        const log = logger.child({'function': 'getShareNodeByUsername'});
        log.trace('')
        const target_sharenode_uuid = req.query.target_sharenode_uuid;
        const target_sharenode_username = req.query.target_sharenode_username;
        if(!(target_sharenode_uuid || target_sharenode_username)){
            throw new AppError("You must provide a target_sharenode_uuid or a target_sharenode_username in the URL query paramaters", 500)
        }
        if(target_sharenode_uuid){
            logger.info(target_sharenode_uuid, "res.locals.target_sharenode initialized by target_sharenode_uuid")
            res.locals.target_sharenode = await models.SHARENODE.findOne({where:{uuid: target_sharenode_uuid}})
        } else {
            logger.info(target_sharenode_username, "res.locals.target_sharenode initialized by post_uuid")

            res.locals.target_sharenode = await models.USER.getShareNodeByUsername(target_sharenode_username)
        }
       
        if(!res.locals.sharenode){
            throw new AppError("something went wrong getting SHARENODE by username", 500)
        }
        next();
    }
    static async  getShareNodeByUUID(req: any, res: any, next:NextFunction){
        const log = logger.child({'function': 'getShareNodeByUUID'});
        log.trace('')
        res.locals.sharenode = await models.SHARENODE.findOne({where:{uuid:req.params.uuid}})
        if(!res.locals.sharenode){
            throw new AppError("something went wrong getting SHARENODE by uuid", 500)
        }
        next();
    }

    static async backwardPath(req: any, res: any, next:NextFunction){
        const log = logger.child({'function': 'backwardPath'});
        log.trace('')
        const rawPathData = await res.locals.source_sharenode.backwardPath(res.locals.post)
        res.result = {
            data: await NodeService.transformPathData(rawPathData),
            message: `Found backward path data for SHARENODE ${res.locals.source_sharenode.uuid}`
        }
        next()
    }
    static async forwardPath(req: any, res: any, next:NextFunction){
        const log = logger.child({'function': 'forwardPath'});
        log.trace('')
        const rawPathData = await res.locals.source_sharenode.forwardPath(res.locals.post)
        res.result = {
            data: await NodeService.transformPathData(rawPathData),
            message: `Found forward path data for SHARENODE ${res.locals.source_sharenode.uuid}`
        }
        next()
    }
    static async interact(req: any, res: any, next:NextFunction){
        const log = logger.child({'function': 'interact'});
        log.trace('')
        
        const meShareNode = res.locals.target_sharenode
        const meHasNodeInPost = await meShareNode.isRelatedToPost(res.locals.post)
        if (meHasNodeInPost){
            res.result = {
                data: meShareNode.getDataValues(),
                message: `User  already has interacted with post ${res.locals.post.query}`
            }
            next()
        } else {
            await NodeService.createEdge(res.locals.post, meShareNode, res.locals.sharenode)
            res.result = {
                message: `User interacted with post ${res.locals.post.query} through user ${req.params.username}`
            }
        }
        res.result = meHasNodeInPost
        next()
    }

    static async interactUnauthorized(req: any, res: any, next:NextFunction){
        const log = logger.child({'function': 'interactUnauthorized'});
        log.trace('')
        const result = await NodeService.createEdgeUnauthorized(res.locals.post, res.locals.source_sharenode)
        console.log(result)
    
        res.result = {
            message: `Anon SHARENODE interacted with post=${res.locals.post.query} through user=${req.params.username} and is related to SHARENODE=${res.locals.source_sharenode.uuid}}`
            data: result.dataValues
        }
        
      
        next()
    }
    }