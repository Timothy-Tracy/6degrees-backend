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
exports.models = {
    USER: modelDefinitions_1.USER,
    SHARENODE: modelDefinitions_1.SHARENODE,
    POST: modelDefinitions_1.POST
};
exports.models.SHARENODE.prototype.user = async function () {
    const result = await this.findRelationships({ alias: 'USER' });
    if (!result[0].target) {
        throw new customErrors_1.AppError('ShareNodeError: Cannot find user', 500);
    }
    return result[0].target;
};
exports.models.SHARENODE.prototype.isRelatedToPost = async function (post) {
    const queryRunner = new neogma_1.QueryRunner({ driver: neogma_2.default.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
    const result = await new neogma_1.QueryBuilder()
        .raw(`MATCH path = ()-[:NEXT* {post_uuid: "${post.uuid}"}]->(sn:SHARENODE {uuid: "${this.uuid}"}) WITH collect(path) as path`)
        .return('path')
        .run(queryRunner);
    return result.records[0] ? true : false;
};
exports.models.SHARENODE.prototype.safeIsRelatedToPost = async function (post) {
    if (!await this.isRelatedToPost(post)) {
        throw new customErrors_1.AppError(`ShareNodeError: ShareNode is not related to post ${post.query} ${post.uuid}`, 500);
    }
};
exports.models.SHARENODE.prototype.backwardPath = async function (post) {
    this.safeIsRelatedToPost(post);
    const queryRunner = new neogma_1.QueryRunner({ driver: neogma_2.default.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
    const result = await new neogma_1.QueryBuilder()
        .match({ identifier: 'sn', where: { uuid: this.uuid } })
        .raw(`OPTIONAL MATCH path = (:POST)-[:EDGE* {post_uuid: "${post.uuid}"}]->(sn) WITH collect(path) as path`)
        .return('path')
        .run(queryRunner);
    console.log(result.records[0].get('path'));
    return result.records[0].get('path');
};
exports.models.SHARENODE.prototype.forwardPath = async function (post) {
    this.safeIsRelatedToPost(post);
    const queryRunner = new neogma_1.QueryRunner({ driver: neogma_2.default.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
    const result = await new neogma_1.QueryBuilder()
        .match({ identifier: 'sn', where: { uuid: this.uuid } })
        .raw(`MATCH path = (sn)-[:EDGE* {post_uuid: "${post.uuid}"}]->(:SHARENODE) WITH collect(path) as path`)
        .return('path')
        .run(queryRunner);
    return result.records[0].get('path');
};
exports.models.SHARENODE.prototype.prev = async function (post) {
    const queryRunner = new neogma_1.QueryRunner({ driver: neogma_2.default.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
    const result = await new neogma_1.QueryBuilder()
        .match({ identifier: 'node', where: { uuid: this.uuid } })
        .raw(`MATCH ()-[next:NEXT {post_uuid: "${post.uuid}"}]->(node)`)
        .return('next')
        .run(queryRunner);
    console.log(result);
    return result.records[0].get('next').properties;
};
//# sourceMappingURL=models.js.map