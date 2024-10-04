"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeMiddleware = void 0;
const models_1 = require("../../../db/neo4j/models/models");
const customErrors_1 = require("../../../../lib/error/customErrors");
const NodeService_1 = require("./NodeService");
class NodeMiddleware {
    static async getPostByQuery(req, res, next) {
        res.locals.post = await models_1.models.POST.findByQuery(req.params.query);
        if (!res.locals.post) {
            throw new customErrors_1.AppError("something went wrong getting post by query", 500);
        }
        next();
        console.log('got post');
    }
    static async getShareNodeByUsername(req, res, next) {
        res.locals.sharenode = await models_1.models.USER.getShareNodeByUsername(req.params.username);
        if (!res.locals.sharenode) {
            throw new customErrors_1.AppError("something went wrong getting post by query", 500);
        }
        next();
    }
    static async backwardPath(req, res, next) {
        const rawPathData = await res.locals.sharenode.backwardPath(res.locals.post);
        res.result = {
            data: await NodeService_1.NodeService.transformPathData(rawPathData),
            message: `Found backward path data for SHARENODE ${res.locals.shareNode.uuid}`
        };
        next();
    }
    static async forwardPath(req, res, next) {
        const rawPathData = await res.locals.sharenode.forwardPath(res.locals.post);
        res.result = {
            data: await NodeService_1.NodeService.transformPathData(rawPathData),
            message: `Found forward path data for SHARENODE ${res.locals.shareNode.uuid}`
        };
        next();
    }
    static async interact(req, res, next) {
        const me = await models_1.models.USER.getUserByUsername(req.params.me).catch((error) => { throw new customErrors_1.AppError('me user not found', 404, error); });
        const meShareNode = await me.shareNode();
        const meHasNodeInPost = await meShareNode.isRelatedToPost(res.locals.post);
        if (meHasNodeInPost) {
            res.result = {
                data: meShareNode.getDataValues(),
                message: `User ${me.username} already has interacted with post ${res.locals.post.query}`
            };
            next();
        }
        else {
            await NodeService_1.NodeService.createEdge(res.locals.post, meShareNode, res.locals.sharenode);
            res.result = {
                message: `User ${me.username} interacted with post ${res.locals.post.query} through user ${req.params.username}`
            };
        }
        res.result = meHasNodeInPost;
        next();
    }
    static async interactUnauthorized(req, res, next) {
        const result = await NodeService_1.NodeService.createEdgeUnauthorized(res.locals.post, res.locals.sharenode);
        console.log(result);
        res.result = {
            message: `Anon SHARENODE interacted with post=${res.locals.post.query} through user=${req.params.username} and is related to SHARENODE=${res.locals.sharenode.uuid}}`,
            data: result.dataValues
        };
        next();
    }
}
exports.NodeMiddleware = NodeMiddleware;
//# sourceMappingURL=NodeMiddleware.js.map