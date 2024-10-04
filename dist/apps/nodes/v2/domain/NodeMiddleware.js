"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeMiddleware = void 0;
const models_1 = require("../../../db/neo4j/models/models");
const customErrors_1 = require("../../../../lib/error/customErrors");
const NodeService_1 = require("./NodeService");
const applogger_1 = __importDefault(require("../../../../lib/logger/applogger"));
const logger = applogger_1.default.child({ 'module': 'NodeMiddleware' });
class NodeMiddleware {
    static async getPostByQuery(req, res, next) {
        const log = logger.child({ 'function': 'getPostByQuery' });
        log.trace('');
        const post_uuid = req.query.post_uuid;
        const post_query = req.query.post_query;
        if (!(post_uuid || post_query)) {
            throw new customErrors_1.AppError("You must provide a post_uuid or a post_query in the URL query paramaters", 500);
        }
        if (post_query) {
            logger.info(post_query, "res.locals.post initialized by post_query");
            res.locals.post = await models_1.models.POST.findByQuery(post_query);
        }
        else {
            logger.info(post_uuid, "res.locals.post initialized by post_uuid");
            res.locals.post = await models_1.models.POST.findOne({ where: { uuid: post_uuid } });
        }
        if (!res.locals.post) {
            throw new customErrors_1.AppError("something went wrong getting post by query", 500);
        }
        next();
        console.log('got post');
    }
    static async getSourceSharenodeByQuery(req, res, next) {
        const log = logger.child({ 'function': 'getShareNodeByUsername' });
        log.trace('');
        const source_sharenode_uuid = req.query.source_sharenode_uuid;
        const source_sharenode_username = req.query.source_sharenode_username;
        if (!(source_sharenode_uuid || source_sharenode_username)) {
            throw new customErrors_1.AppError("You must provide a source_sharenode_uuid or a source_sharenode_username in the URL query paramaters", 500);
        }
        if (source_sharenode_uuid) {
            logger.info(source_sharenode_uuid, "res.locals.source_sharenode initialized by source_sharenode_uuid");
            res.locals.source_sharenode = await models_1.models.SHARENODE.findOne({ where: { uuid: source_sharenode_uuid } });
        }
        else {
            logger.info(source_sharenode_username, "res.locals.source_sharenode initialized by source_sharenode_username");
            res.locals.source_sharenode = await models_1.models.USER.getShareNodeByUsername(source_sharenode_username);
        }
        if (!res.locals.source_sharenode) {
            throw new customErrors_1.AppError("something went wrong getting SHARENODE by username", 500);
        }
        next();
    }
    static async getTargetSharenodeByQuery(req, res, next) {
        const log = logger.child({ 'function': 'getShareNodeByUsername' });
        log.trace('');
        const target_sharenode_uuid = req.query.target_sharenode_uuid;
        const target_sharenode_username = req.query.target_sharenode_username;
        if (!(target_sharenode_uuid || target_sharenode_username)) {
            throw new customErrors_1.AppError("You must provide a target_sharenode_uuid or a target_sharenode_username in the URL query paramaters", 500);
        }
        if (target_sharenode_uuid) {
            logger.info(target_sharenode_uuid, "res.locals.target_sharenode initialized by target_sharenode_uuid");
            res.locals.target_sharenode = await models_1.models.SHARENODE.findOne({ where: { uuid: target_sharenode_uuid } });
        }
        else {
            logger.info(target_sharenode_username, "res.locals.target_sharenode initialized by post_uuid");
            res.locals.target_sharenode = await models_1.models.USER.getShareNodeByUsername(target_sharenode_username);
        }
        if (!res.locals.sharenode) {
            throw new customErrors_1.AppError("something went wrong getting SHARENODE by username", 500);
        }
        next();
    }
    static async getShareNodeByUUID(req, res, next) {
        const log = logger.child({ 'function': 'getShareNodeByUUID' });
        log.trace('');
        res.locals.sharenode = await models_1.models.SHARENODE.findOne({ where: { uuid: req.params.uuid } });
        if (!res.locals.sharenode) {
            throw new customErrors_1.AppError("something went wrong getting SHARENODE by uuid", 500);
        }
        next();
    }
    static async backwardPath(req, res, next) {
        const log = logger.child({ 'function': 'backwardPath' });
        log.trace('');
        const rawPathData = await res.locals.source_sharenode.backwardPath(res.locals.post);
        res.result = {
            data: await NodeService_1.NodeService.transformPathData(rawPathData),
            message: `Found backward path data for SHARENODE ${res.locals.source_sharenode.uuid}`
        };
        next();
    }
    static async forwardPath(req, res, next) {
        const log = logger.child({ 'function': 'forwardPath' });
        log.trace('');
        const rawPathData = await res.locals.source_sharenode.forwardPath(res.locals.post);
        res.result = {
            data: await NodeService_1.NodeService.transformPathData(rawPathData),
            message: `Found forward path data for SHARENODE ${res.locals.source_sharenode.uuid}`
        };
        next();
    }
    static async interact(req, res, next) {
        const log = logger.child({ 'function': 'interact' });
        log.trace('');
        const meShareNode = res.locals.target_sharenode;
        const meHasNodeInPost = await meShareNode.isRelatedToPost(res.locals.post);
        if (meHasNodeInPost) {
            res.result = {
                data: meShareNode.getDataValues(),
                message: `User  already has interacted with post ${res.locals.post.query}`
            };
            next();
        }
        else {
            await NodeService_1.NodeService.createEdge(res.locals.post, meShareNode, res.locals.sharenode);
            res.result = {
                message: `User interacted with post ${res.locals.post.query} through user ${req.params.username}`
            };
        }
        res.result = meHasNodeInPost;
        next();
    }
    static async interactUnauthorized(req, res, next) {
        const log = logger.child({ 'function': 'interactUnauthorized' });
        log.trace('');
        const result = await NodeService_1.NodeService.createEdgeUnauthorized(res.locals.post, res.locals.source_sharenode);
        console.log(result);
        res.result = {
            message: `Anon SHARENODE interacted with post=${res.locals.post.query} through user=${req.params.username} and is related to SHARENODE=${res.locals.source_sharenode.uuid}}`,
            data: result.dataValues
        };
        next();
    }
}
exports.NodeMiddleware = NodeMiddleware;
//# sourceMappingURL=NodeMiddleware.js.map