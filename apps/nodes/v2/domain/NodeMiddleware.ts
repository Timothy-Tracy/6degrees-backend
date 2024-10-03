import { NextFunction } from "express";
import { models } from "../../../db/neo4j/models/models";
import { AppError } from "../../../../lib/error/customErrors";
import { NodeService } from "./NodeService";

export class NodeMiddleware{
    static async  getPostByQuery(req: any, res: any, next:NextFunction){
        const query = req.params.query;
        res.locals.post = await models.POST.findByQuery(query)
        if(!res.locals.post){
            throw new AppError("something went wrong getting post by query", 500)
        }
        next();
    }
    static async  getShareNodeByUsername(req: any, res: any, next:NextFunction){
        const username = req.params.username;
        res.locals.user = await models.USER.getShareNodeByUsername(username)
        if(!res.locals.user){
            throw new AppError("something went wrong getting post by query", 500)
        }
        next();
    }

    static async backwardPath(req: any, res: any, next:NextFunction){
        const ress = await NodeService.backwardsDistributionPath(res.locals.post, res.locals.user)
        res.result = await NodeService.transformPathData(ress)
        next()
    }
    static async forwardPath(req: any, res: any, next:NextFunction){
        const ress = await NodeService.forwardsDistributionPath(res.locals.post, res.locals.user)
        res.result = await NodeService.transformPathData(ress)
        next()
    }
}