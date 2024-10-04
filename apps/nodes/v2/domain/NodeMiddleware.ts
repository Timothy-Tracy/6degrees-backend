import { NextFunction } from "express";
import { models } from "../../../db/neo4j/models/models";
import { AppError } from "../../../../lib/error/customErrors";
import { NodeService } from "./NodeService";
import { integer } from "neo4j-driver";

export class NodeMiddleware{
    static async  getPostByQuery(req: any, res: any, next:NextFunction){
        res.locals.post = await models.POST.findByQuery(req.params.query)
        if(!res.locals.post){
            throw new AppError("something went wrong getting post by query", 500)
        }
        next();
        console.log('got post')

    }
    static async  getShareNodeByUsername(req: any, res: any, next:NextFunction){
        res.locals.sharenode = await models.USER.getShareNodeByUsername(req.params.username)
        if(!res.locals.sharenode){
            throw new AppError("something went wrong getting post by query", 500)
        }
        next();
    }

    static async backwardPath(req: any, res: any, next:NextFunction){
        const rawPathData = await res.locals.sharenode.backwardPath(res.locals.post)
        res.result = {
            data: await NodeService.transformPathData(rawPathData),
            message: `Found backward path data for SHARENODE ${res.locals.shareNode.uuid}`
        }
        next()
    }
    static async forwardPath(req: any, res: any, next:NextFunction){
        const rawPathData = await res.locals.sharenode.forwardPath(res.locals.post)
        res.result = {
            data: await NodeService.transformPathData(rawPathData),
            message: `Found forward path data for SHARENODE ${res.locals.shareNode.uuid}`
        }
        next()
    }
    static async interact(req: any, res: any, next:NextFunction){
       
        const me = await models.USER.getUserByUsername(req.params.me).catch((error:any)=>{throw new AppError('me user not found', 404, error)})
        const meShareNode = await me.shareNode()
        const meHasNodeInPost = await meShareNode.isRelatedToPost(res.locals.post)
        if (meHasNodeInPost){
            res.result = {
                data: meShareNode.getDataValues(),
                message: `User ${me.username} already has interacted with post ${res.locals.post.query}`
            }
            next()
        } else {
            await NodeService.createEdge(res.locals.post, meShareNode, res.locals.sharenode)
            res.result = {
                message: `User ${me.username} interacted with post ${res.locals.post.query} through user ${req.params.username}`
            }
        }
        res.result = meHasNodeInPost
        next()
    }

    static async interactUnauthorized(req: any, res: any, next:NextFunction){
        const result = await NodeService.createEdgeUnauthorized(res.locals.post, res.locals.sharenode)
        console.log(result)
    
        res.result = {
            message: `Anon SHARENODE interacted with post=${res.locals.post.query} through user=${req.params.username} and is related to SHARENODE=${res.locals.sharenode.uuid}}`
            data: result.dataValues
        }
        
      
        next()
    }
    }