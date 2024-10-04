"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeService = void 0;
const neo4j_driver_1 = require("neo4j-driver");
const models_1 = require("../../../db/neo4j/models/models");
const neogma_1 = require("neogma");
const neogma_2 = __importDefault(require("../../../db/neo4j/neogma/neogma"));
const applogger_1 = __importDefault(require("../../../../lib/logger/applogger"));
const logger = applogger_1.default.child({ 'module': 'NodeService' });
const { v7: uuidv7 } = require('uuid');
class NodeService {
    static async getPreceedingEdge(post, shareNode) {
        const queryRunner = new neogma_1.QueryRunner({ driver: neogma_2.default.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
        const result = await new neogma_1.QueryBuilder()
            .match({ identifier: 'node', where: { uuid: shareNode.uuid } })
            .raw(`MATCH (n)-[next:NEXT {post_uuid: "${post.uuid}"}]->(node)`)
            .return('edge')
            .run(queryRunner);
        return result.records[0].get('next').properties;
    }
    static async createEdge(post, shareNode, sourceShareNode) {
        if (!sourceShareNode) {
            post.relateTo({
                alias: "SHARENODE",
                where: {
                    uuid: shareNode.uuid,
                },
                properties: {
                    uuid: uuidv7(),
                    post_uuid: post.uuid,
                    degree: neo4j_driver_1.Integer.fromNumber(0),
                    createdAt: new Date().toISOString()
                },
                assertCreatedRelationships: 1,
            });
        }
        else {
            const prev = await shareNode.prev(post);
            const result = models_1.models.SHARENODE.relateTo({
                alias: "SHARENODE",
                where: {
                    source: { uuid: sourceShareNode.uuid },
                    target: { uuid: shareNode.uuid }
                },
                properties: {
                    uuid: uuidv7(),
                    post_uuid: post.uuid,
                    degree: neo4j_driver_1.Integer.fromNumber(neo4j_driver_1.integer.toNumber(prev.degree) + 1),
                    createdAt: new Date().toISOString()
                },
                assertCreatedRelationships: 1
            });
        }
    }
    static async createEdgeUnauthorized(post, sourceShareNode) {
        const prevEdge = await sourceShareNode.prev(post);
        const anonNode = await models_1.models.SHARENODE.createOne({ uuid: uuidv7(), anon: true });
        await models_1.models.SHARENODE.relateTo({
            alias: 'SHARENODE',
            where: {
                source: { uuid: sourceShareNode.uuid },
                target: { uuid: anonNode.uuid }
            },
            properties: {
                method: 'default',
                post_uuid: post.uuid,
                degree: neo4j_driver_1.Integer.fromNumber(neo4j_driver_1.integer.toNumber(prevEdge.degree) + 1),
            }
        }).then(() => console.log('created relationship'));
        return anonNode;
    }
    static async transformPathData(data) {
        console.log('Starting data transformation');
        //console.log('Input data:', JSON.stringify(data, null, 2));
        const combinedData = data;
        console.log('Combined data length:', combinedData.length);
        const mydata = {
            nodes: [],
            links: []
        };
        const nodeMap = new Map();
        console.log('Initializing nodeMap');
        const addNode = (node) => {
            const nodeId = node.identity.toString();
            if (!nodeMap.has(nodeId)) {
                console.log(`Adding new node with id: ${nodeId}`);
                const nodeObj = {
                    id: nodeId,
                    label: `NODE ${node.identity}`,
                    ...node.properties
                };
                mydata.nodes.push(nodeObj);
                nodeMap.set(nodeId, nodeObj);
                console.log(`Node added:`, JSON.stringify(nodeObj, null, 2));
            }
            else {
                console.log(`Node with id ${nodeId} already exists, skipping`);
            }
        };
        console.log('Processing paths and segments');
        combinedData.forEach((path, index) => {
            console.log(`Processing path ${index + 1}`);
            //console.log('Start node:', JSON.stringify(path.start, null, 2));
            addNode(path.start);
            //console.log('End node:', JSON.stringify(path.end, null, 2));
            addNode(path.end);
            console.log(`Processing ${path.segments.length} segments in path ${index + 1}`);
            path.segments.forEach((segment, segIndex) => {
                console.log(`Processing segment ${segIndex + 1} in path ${index + 1}`);
                const link = {
                    source: segment.start.identity.toString(),
                    target: segment.end.identity.toString(),
                    label: segment.relationship.type,
                    ...segment.relationship.properties
                };
                mydata.links.push(link);
                //console.log('Link added:', JSON.stringify(link, null, 2));
            });
        });
        console.log('Transformation complete');
        console.log('Total nodes:', mydata.nodes.length);
        console.log('Total links:', mydata.links.length);
        return mydata;
    }
}
exports.NodeService = NodeService;
//# sourceMappingURL=NodeService.js.map