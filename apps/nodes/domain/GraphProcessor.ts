import { QueryBuilder, QueryRunner } from "neogma";
import {  translateDateTime, uuid } from "../../../types/Globals";
import { POSTInstance } from "../../db/neo4j/models/types/nodes/POST";
import neogma from "../../db/neo4j/neogma/neogma";
import applogger from '../../../lib/logger/applogger';
import { AppError } from '../../../lib/error/customErrors';
import { Result } from "neo4j-driver";

const logger = applogger.child({ 'module': 'GraphProcessor' });


class GraphProcessor {
  queryRunner = new QueryRunner({ driver: neogma.driver, logger: console.log, sessionParams: { database: 'neo4j' } })

  constructor() {
  }

  async getForwardPaths(source_sharenode_uuid:string, post_uuid: uuid): Promise<Result> {
    const log = logger.child({ 'function': 'getForwardPaths' });
    log.trace('');

    const result = await new QueryBuilder()
      .raw(`MATCH path = (source:SHARENODE {uuid: "${source_sharenode_uuid}"})-[:NEXT* {post_uuid: "${post_uuid}"}]->(:SHARENODE)`)
      .return('path')
      .run(this.queryRunner);
      //console.log(result)
    return result;
  }


  async findShortestPath(post: POSTInstance, source_sharenode_uuid:uuid, target_sharenode_uuid: uuid): Promise<Result> {
    const log = logger.child({ 'function': 'findShortestPath' });
    log.trace('');

    const result = await new QueryBuilder()
      .match({ identifier: 'source', where: { uuid: source_sharenode_uuid } })
      .match({ identifier: 'target', where: { uuid: target_sharenode_uuid } })
      .raw(`MATCH path = shortestPath((source)-[:NEXT* {post_uuid: "${post.uuid}"}]->(target))`)
      .return('path')
      .run(this.queryRunner);


    return result
  }

  



  async getNeighbors(source_sharenode_uuid: uuid, post_uuid: uuid): Promise<Result> {
    const log = logger.child({ 'function': 'NeogmaGraphProcessor.getNeighbors' });
    log.trace('');

    const result = await new QueryBuilder()
      .match({ identifier: 'node', where: { uuid: source_sharenode_uuid } })
      .raw(`
        MATCH (node)-[r:NEXT {post_uuid: "${post_uuid}"}]-(neighbor)
        RETURN node, r, neighbor
      `)
      .run(this.queryRunner);

    // return this.transformPathsToData(result.records.map(record => ({
    //   segments: [{
    //     start: record.get('node'),
    //     relationship: record.get('r'),
    //     end: record.get('neighbor')
    //   }]
    // })));

    return result
  }


  async getPathToSharenodeInPost(source_sharenode_uuid:uuid,target_sharenode_uuid: uuid, post_uuid:uuid){
    const log = logger.child({ 'function': 'NeogmaGraphProcessor.getNeighbors' });
    log.trace('');

    const result = await new QueryBuilder()
      .raw(`
        MATCH path = (source:SHARENODE {uuid:"${source_sharenode_uuid}"})-[r:NEXT* {post_uuid: "${post_uuid}"}]-(target:SHARENODE {uuid: "${target_sharenode_uuid}"})
        RETURN path
      `)
      .run(this.queryRunner);

    // return this.transformPathsToData(result.records.map(record => record.get('path')));
    return result
  }
}

export default GraphProcessor;