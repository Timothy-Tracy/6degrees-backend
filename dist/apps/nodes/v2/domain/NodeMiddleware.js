"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeMiddleware = void 0;
const models_1 = require("../../../db/neo4j/models/models");
const customErrors_1 = require("../../../../lib/error/customErrors");
const NodeService_1 = require("./NodeService");
class NodeMiddleware {
    static async getPostByQuery(req, res, next) {
        const query = req.params.query;
        res.locals.post = await models_1.models.POST.findByQuery(query);
        if (!res.locals.post) {
            throw new customErrors_1.AppError("something went wrong getting post by query", 500);
        }
        next();
    }
    static async getShareNodeByUsername(req, res, next) {
        const username = req.params.username;
        res.locals.user = await models_1.models.USER.getShareNodeByUsername(username);
        if (!res.locals.user) {
            throw new customErrors_1.AppError("something went wrong getting post by query", 500);
        }
        next();
    }
    static async backwardPath(req, res, next) {
        const ress = await NodeService_1.NodeService.backwardsDistributionPath(res.locals.post, res.locals.user);
        res.result = await NodeService_1.NodeService.transformPathData(ress);
        next();
    }
    static async forwardPath(req, res, next) {
        const ress = await NodeService_1.NodeService.forwardsDistributionPath(res.locals.post, res.locals.user);
        res.result = await NodeService_1.NodeService.transformPathData(ress);
        next();
    }
}
exports.NodeMiddleware = NodeMiddleware;
//# sourceMappingURL=NodeMiddleware.js.map