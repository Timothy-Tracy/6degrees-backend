import { QueryBuilder, QueryRunner } from "neogma";
import { Neo4jDateTimeSchema, translateDateTime, uuidSchema } from "../../../types/Globals";
import { models } from "./../../db/neo4j/models/models";
import { SHARENODEInstance } from "../../db/neo4j/models/types/nodes/SHARENODE";
import { POSTInstance } from "../../db/neo4j/models/types/nodes/POST";
import { NEXTProperties } from "../../db/neo4j/models/types/relationships/NEXT";
import neogma from "../../db/neo4j/neogma/neogma";
import applogger from '../../../lib/logger/applogger';
import { AppError } from '../../../lib/error/customErrors';

const logger = applogger.child({ 'module': 'NeogmaGraphProcessor' });

interface TransformedNode {
  id: string;
  label: string;
  [key: string]: any;
}

interface TransformedLink {
  source: string;
  target: string;
  label: string;
  [key: string]: any;
}

interface TransformedData {
  nodes: TransformedNode[];
  links: TransformedLink[];
}

class GraphProcessor {
  private sourceShareNode: SHARENODEInstance;

  constructor(sourceShareNode: SHARENODEInstance) {
    this.sourceShareNode = sourceShareNode;
  }

  async getForwardPaths(post: POSTInstance): Promise<TransformedData> {
    const log = logger.child({ 'function': 'NeogmaGraphProcessor.getForwardPaths' });
    log.trace('');

    const queryRunner = new QueryRunner({ driver: neogma.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
    const result = await new QueryBuilder()
      .match({ identifier: 'source', where: { uuid: this.sourceShareNode.uuid } })
      .raw(`MATCH path = (source:SHARENODE)-[:NEXT* {post_uuid: "${post.uuid}"}]->(:SHARENODE)`)
      .return('path')
      .run(queryRunner);
      console.log(result)

    return this.transformPathsToData(result.records.map(record => record.get('path')));
  }

  private transformPathsToData(paths: any[]): TransformedData {
    const nodes = new Map<string, TransformedNode>();
    const links = new Map<string, TransformedLink>();

    paths.forEach(path => {
      path.segments.forEach(segment => {
        const startNode = this.transformNode(segment.start);
        startNode.createdAt = translateDateTime(startNode.createdAt)?.toString()
        startNode.updatedAt = translateDateTime(startNode.updatedAt)?.toString()
        const endNode = this.transformNode(segment.end);
        console.log(endNode)
        endNode.createdAt = translateDateTime(endNode.createdAt)?.toString()
        endNode.updatedAt = translateDateTime(endNode.updatedAt)?.toString()
        const link = this.transformLink(segment.relationship, startNode.id, endNode.id);
        link.createdAt = translateDateTime(link.createdAt)?.toString()
        link.updatedAt = translateDateTime(link.updatedAt)?.toString()
        nodes.set(startNode.id, startNode);
        nodes.set(endNode.id, endNode);
        links.set(link.id, link);
      });
    });

    return {
      nodes: Array.from(nodes.values()),
      links: Array.from(links.values())
    };
  }

  private transformNode(node: any): TransformedNode {
    return {
      id: node.identity.toString(),
      label: `Node ${node.identity}`,
      ...node.properties
    };
  }

  private transformLink(relationship: any, sourceId: string, targetId: string): TransformedLink & { id: string } {
    return {
      id: `${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      label: relationship.type,
      ...relationship.properties
    };
  }

  async findShortestPath(post: POSTInstance, targetNodeId: string): Promise<TransformedData | null> {
    const log = logger.child({ 'function': 'NeogmaGraphProcessor.findShortestPath' });
    log.trace('');

    const queryRunner = new QueryRunner({ driver: neogma.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
    const result = await new QueryBuilder()
      .match({ identifier: 'source', where: { uuid: this.sourceNodeId } })
      .match({ identifier: 'target', where: { uuid: targetNodeId } })
      .raw(`MATCH path = shortestPath((source)-[:NEXT* {post_uuid: "${post.uuid}"}]->(target))`)
      .return('path')
      .run(queryRunner);

    if (result.records.length === 0) {
      return null;
    }

    return this.transformPathsToData([result.records[0].get('path')]);
  }

  



  async getNeighbors(sharenodeUUID: string, post: POSTInstance): Promise<TransformedData> {
    const log = logger.child({ 'function': 'NeogmaGraphProcessor.getNeighbors' });
    log.trace('');

    const queryRunner = new QueryRunner({ driver: neogma.driver, logger: console.log, sessionParams: { database: 'neo4j' } });
    const result = await new QueryBuilder()
      .match({ identifier: 'node', where: { uuid: sharenodeUUID } })
      .raw(`
        MATCH (node)-[r:NEXT {post_uuid: "${post.uuid}"}]-(neighbor)
        RETURN node, r, neighbor
      `)
      .run(queryRunner);

    return this.transformPathsToData(result.records.map(record => ({
      segments: [{
        start: record.get('node'),
        relationship: record.get('r'),
        end: record.get('neighbor')
      }]
    })));
  }
}

export default GraphProcessor;