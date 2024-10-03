"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeService = void 0;
const customErrors_1 = require("../../../../lib/error/customErrors");
const neogma_1 = require("neogma");
const neogma_2 = __importDefault(require("../../../db/neo4j/neogma/neogma"));
const { v7: uuidv7 } = require('uuid');
class NodeService {
    static async createEdge(post, shareNode, degree) {
        const relationshipSearch = await post.findRelationships({
            alias: 'SHARENODE',
            where: {
                relationship: {},
                target: {
                    uuid: shareNode.uuid
                }
            }
        });
        const relationship = relationshipSearch[0].relationship;
        if (relationship) {
            throw new customErrors_1.AppError('Edge already exists', 500);
        }
        else {
            post.relateTo({
                alias: 'SHARENODE',
                where: {
                    uuid: shareNode.uuid,
                },
                properties: {
                    uuid: uuidv7(),
                    degree: degree
                },
                assertCreatedRelationships: 1,
            });
        }
    }
    static async nodeIsRelatedToPost(post, shareNode) {
        const queryRunner = new neogma_1.QueryRunner({ driver: neogma_2.default.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
        const result = await new neogma_1.QueryBuilder()
            .match({ identifier: 'sn', where: { uuid: shareNode.uuid } })
            .match({ identifier: 'p', where: { uuid: post.uuid } })
            .raw('MATCH PATH = (sn)-[:EDGE*]-(p)')
            .return('PATH')
            .run(queryRunner);
        return result.records.length > 0 ? true : false;
    }
    static async getNodeByUser(user) {
        const sn = await user.shareNode();
        return sn;
    }
}
exports.NodeService = NodeService;
//# sourceMappingURL=NodeService.js.map