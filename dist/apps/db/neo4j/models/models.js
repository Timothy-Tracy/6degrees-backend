"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.models = void 0;
//models.ts
const neogma_1 = require("neogma");
const modelDefinitions_1 = require("./modelDefinitions");
const neogma_2 = __importDefault(require("../neogma/neogma"));
const customErrors_1 = require("../../../../lib/error/customErrors");
const applogger_1 = __importDefault(require("../../../../lib/logger/applogger"));
const { v7: uuidv7 } = require('uuid');
const logger = applogger_1.default.child({ 'module': 'models' });
exports.models = {
    USER: modelDefinitions_1.USER,
    SHARENODE: modelDefinitions_1.SHARENODE,
    POST: modelDefinitions_1.POST
};
exports.models.SHARENODE.prototype.user = async function () {
    const log = logger.child({ 'function': 'models.SHARENODE.prototype.user' });
    log.trace('');
    const result = await this.findRelationships({ alias: 'USER' });
    if (!result[0].target) {
        throw new customErrors_1.AppError('ShareNodeError: Cannot find user', 500);
    }
    return result[0].target;
};
exports.models.SHARENODE.prototype.isRelatedToPost = async function (post) {
    const log = logger.child({ 'function': 'models.SHARENODE.prototype.isRelatedToPost' });
    log.trace('');
    const queryRunner = new neogma_1.QueryRunner({ driver: neogma_2.default.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
    const result = await new neogma_1.QueryBuilder()
        .raw(`MATCH ()-[n:NEXT* {post_uuid: "${post.uuid}"}]->(sn:SHARENODE {uuid: "${this.uuid}"}) `)
        .return('n')
        .run(queryRunner);
    log.error(result.records[0] ? true : false);
    return result.records[0] ? true : false;
};
exports.models.SHARENODE.prototype.safeIsRelatedToPost = async function (post) {
    const log = logger.child({ 'function': 'models.SHARENODE.prototype.safeIsRelatedToPost' });
    log.trace('');
    if (!await this.isRelatedToPost(post)) {
        throw new customErrors_1.AppError(`ShareNodeError: ShareNode is not related to post ${post.query} ${post.uuid}`, 500);
    }
};
exports.models.SHARENODE.prototype.backwardPath = async function (post) {
    const log = logger.child({ 'function': 'models.SHARENODE.prototype.backwardPath' });
    log.trace('');
    this.safeIsRelatedToPost(post);
    const queryRunner = new neogma_1.QueryRunner({ driver: neogma_2.default.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
    const result = await new neogma_1.QueryBuilder()
        .match({ identifier: 'sn', where: { uuid: this.uuid } })
        .raw(`OPTIONAL MATCH path = (:POST)-[:NEXT* {post_uuid: "${post.uuid}"}]->(sn) WITH collect(path) as path`)
        .return('path')
        .run(queryRunner);
    console.log(result.records[0].get('path'));
    return result.records[0].get('path');
};
exports.models.SHARENODE.prototype.forwardPath = async function (post) {
    const log = logger.child({ 'function': 'models.SHARENODE.prototype.forwardPath' });
    log.trace('');
    this.safeIsRelatedToPost(post);
    const queryRunner = new neogma_1.QueryRunner({ driver: neogma_2.default.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
    const result = await new neogma_1.QueryBuilder()
        .match({ identifier: 'sn', where: { uuid: this.uuid } })
        .raw(`MATCH path = (sn)-[:NEXT* {post_uuid: "${post.uuid}"}]->(:SHARENODE) WITH collect(path) as path`)
        .return('path')
        .run(queryRunner);
    return result.records[0].get('path');
};
exports.models.SHARENODE.prototype.prev = async function (post) {
    const log = logger.child({ 'function': 'models.SHARENODE.prototype.prev' });
    log.trace('');
    const queryRunner = new neogma_1.QueryRunner({ driver: neogma_2.default.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
    const result = await new neogma_1.QueryBuilder()
        .raw(`MATCH ()-[next:NEXT {post_uuid: "${post.uuid}"}]->(node:SHARENODE {uuid: "${this.uuid}"})`)
        .return('next')
        .run(queryRunner);
    return result.records[0].get('next').properties;
};
exports.models.USER.prototype.createSharenode = async function () {
    const alreadyHasSharenode = await this.shareNode();
    if (alreadyHasSharenode != null) {
        throw new customErrors_1.AppError('User already has sharenode', 500);
    }
    else {
        const result = await exports.models.SHARENODE.createOne({
            uuid: uuidv7(),
            anon: false
        });
        await result.relateTo({ alias: 'USER',
            where: {
                uuid: this.uuid
            }
        });
    }
};
//# sourceMappingURL=models.js.map