"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoot = exports.router = void 0;
const express_1 = __importDefault(require("express"));
const customErrors_1 = require("../../../../../lib/error/customErrors");
const NodeMiddleware_1 = require("../../domain/NodeMiddleware");
exports.router = express_1.default.Router();
exports.apiRoot = '/api/v2/nodes';
//Get backwards path from a SHARENODE to its source POST
exports.router.get('/:query/:username/backwardpath', (0, customErrors_1.catchAsync)(NodeMiddleware_1.NodeMiddleware.getPostByQuery), (0, customErrors_1.catchAsync)(NodeMiddleware_1.NodeMiddleware.getShareNodeByUsername), (0, customErrors_1.catchAsync)(NodeMiddleware_1.NodeMiddleware.backwardPath), async function (req, res, next) {
    res.status(200).json(res.result);
});
//Get forwards path from a SHARENODE to other SHARENODES
exports.router.get('/:query/:username/forwardpath', (0, customErrors_1.catchAsync)(NodeMiddleware_1.NodeMiddleware.getPostByQuery), (0, customErrors_1.catchAsync)(NodeMiddleware_1.NodeMiddleware.getShareNodeByUsername), (0, customErrors_1.catchAsync)(NodeMiddleware_1.NodeMiddleware.forwardPath), async function (req, res, next) {
    res.status(200).json(res.result);
});
//Interact with SHARENODE no auth
exports.router.get('/:query/:username/interactUnauthorized/', (0, customErrors_1.catchAsync)(NodeMiddleware_1.NodeMiddleware.getPostByQuery), (0, customErrors_1.catchAsync)(NodeMiddleware_1.NodeMiddleware.getShareNodeByUsername), (0, customErrors_1.catchAsync)(NodeMiddleware_1.NodeMiddleware.interactUnauthorized), async function (req, res, next) {
    res.status(200).json(res.result);
});
//# sourceMappingURL=NodeController.js.map