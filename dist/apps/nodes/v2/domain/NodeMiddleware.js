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
    static safe(anyVariable, name = 'unknownVariable') {
        logger.debug(`safety checking ${name}`);
        if (anyVariable == null) {
            throw new customErrors_1.AppError(`${name} is not initialized, but is required for execution`, 500);
        }
        return anyVariable;
    }
    static async getPostByQuery(req, res, next) {
        const log = logger.child({ 'function': 'getPostByQuery' });
        log.trace('');
        const post_uuid = req.query.post_uuid;
        const post_query = req.query.post_query;
        if (post_uuid) {
            logger.info(post_uuid, "res.locals.post initialized by post_uuid");
            res.locals.post = await models_1.models.POST.findOne({ where: { uuid: post_uuid } });
        }
        else if (post_query) {
            logger.info(post_query, "res.locals.post initialized by post_query");
            res.locals.post = await models_1.models.POST.findByQuery(post_query);
        }
        const initialized = res.locals.post != null ? true : false;
        logger.info(`res.locals.post initialized=${initialized}`);
        next();
    }
    static async getSourceSharenodeByQuery(req, res, next) {
        const log = logger.child({ 'function': 'getShareNodeByUsername' });
        log.trace('');
        const source_sharenode_uuid = req.query.source_sharenode_uuid;
        const source_sharenode_username = req.query.source_sharenode_username;
        if (source_sharenode_uuid) {
            logger.info(source_sharenode_uuid, "res.locals.source_sharenode initialized by source_sharenode_uuid");
            res.locals.source_sharenode = await models_1.models.SHARENODE.findOne({ where: { uuid: source_sharenode_uuid } });
        }
        else if (source_sharenode_username) {
            logger.info(source_sharenode_username, "res.locals.source_sharenode initialized by source_sharenode_username");
            res.locals.source_sharenode = await models_1.models.USER.getShareNodeByUsername(source_sharenode_username);
        }
        const initialized = res.locals.source_sharenode != null ? true : false;
        logger.info(`res.locals.source_sharenode initialized=${initialized}`);
        next();
    }
    static async getTargetSharenodeByQuery(req, res, next) {
        const log = logger.child({ 'function': 'getShareNodeByUsername' });
        log.trace('');
        const target_sharenode_uuid = req.query.target_sharenode_uuid;
        const target_sharenode_username = req.query.target_sharenode_username;
        if (target_sharenode_uuid) {
            logger.info(target_sharenode_uuid, "res.locals.target_sharenode initialized by target_sharenode_uuid");
            res.locals.target_sharenode = await models_1.models.SHARENODE.findOne({ where: { uuid: target_sharenode_uuid } });
        }
        else if (target_sharenode_username) {
            logger.info(target_sharenode_username, "res.locals.target_sharenode initialized by post_uuid");
            res.locals.target_sharenode = await models_1.models.USER.getShareNodeByUsername(target_sharenode_username);
        }
        const initialized = res.locals.target_sharenode != null ? true : false;
        logger.info(`res.locals.target_sharenode initialized=${initialized}`);
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
        let message = '';
        //If no target_sharenode has been provided, we will assume it is an anon interaction, so we need to create anon sharenode
        const post = NodeMiddleware.safe(res.locals.post, 'res.locals.post');
        const source_sharenode = NodeMiddleware.safe(res.locals.source_sharenode, 'res.locals.source_sharenode');
        logger.error(res.locals);
        if (res.locals.target_sharenode == null) {
            if (req.cookies.target_sharenode_uuid) {
                res.locals.target_sharenode = await models_1.models.SHARENODE.findOne({ where: { uuid: req.cookies.target_sharenode_uuid } });
                logger.info('got target sharenode from cookie');
            }
            else {
                logger.info('creating anon');
                res.locals.target_sharenode = await NodeService_1.NodeService.createAnonSharenode();
                logger.info(`Created anon SHARENODE uuid=${res.locals.target_sharenode.uuid}`);
                message = message + `Created anon SHARENODE uuid=${res.locals.target_sharenode.uuid}, `;
            }
        }
        const target_sharenode = NodeMiddleware.safe(res.locals.target_sharenode, 'res.locals.target_sharenode');
        logger.error(req.query);
        //check if the sharenode has interacted with the post before
        const targetHasNodeInPost = await target_sharenode.isRelatedToPost(post);
        if (targetHasNodeInPost) {
            logger.info('target has node in post=true');
            message = message + `SHARENODE uuid=${target_sharenode.uuid} has already interacted with POST uuid=${post.uuid}, `;
            logger.info(message);
            res.result = {
                data: target_sharenode.getDataValues(),
                message: message
            };
            next();
        }
        else {
            logger.info('target has node in post=false');
            await NodeService_1.NodeService.createEdge(post, target_sharenode, source_sharenode);
            message = message + `target SHARENODE uuid=${target_sharenode.uuid} interacted with POST uuid=${post.uuid} through source SHARENODE uuid=${source_sharenode.uuid}`;
            res.result = {
                message: message
            };
        }
        next();
    }
}
exports.NodeMiddleware = NodeMiddleware;
NodeMiddleware.requireQueryParameter = (arr) => (req, res, next) => {
    const message = `Error. This request requires the query parameters ${arr.join(' or ')}`;
    let bool = false;
    arr.forEach((key) => {
        if (req.query[key]) {
            bool = true;
        }
    });
    if (!bool) {
        throw new customErrors_1.AppError(message, 403);
    }
    next();
};
//# sourceMappingURL=NodeMiddleware.js.map