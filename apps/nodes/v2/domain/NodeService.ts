import { DateTime, Integer } from 'neo4j-driver';
import {models} from '../../../db/neo4j/models/models'
import { POSTInstance, SHARENODE, SHARENODEInstance, USERInstance } from '../../../db/neo4j/models/modelDefinitions';
import { AppError } from '../../../../lib/error/customErrors';
import { QueryBuilder, QueryRunner, Where } from 'neogma';
import neogma from '../../../db/neo4j/neogma/neogma';
import applogger from '../../../../lib/logger/applogger';
const logger = applogger.child({'module':'NodeService'});
const { v7: uuidv7 } = require('uuid');
interface PathData {
    backwardPaths: Path[];
    forwardPaths: Path[];
  }
  
  interface Path {
    start: Node;
    end: Node;
    segments: Segment[];
  }
  
  interface Node {
    identity: number;
    properties: Record<string, any>;
  }
  
  interface Segment {
    start: Node;
    end: Node;
    relationship: Relationship;
  }
  
  interface Relationship {
    type: string;
    properties: Record<string, any>;
  }
  
  interface TransformedData {
    nodes: TransformedNode[];
    links: TransformedLink[];
  }
  
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
  
export class NodeService {
    static async createEdge(post: POSTInstance, shareNode: SHARENODEInstance, degree: number){
        const relationshipSearch = await post.findRelationships({
            alias:'SHARENODE',
            where: {
                relationship:{},
                target:{
                    uuid:shareNode.uuid
                }
            }
        })
        const relationship = relationshipSearch[0].relationship
        if (relationship){
            throw new AppError('Edge already exists', 500);
        } else {
            post.relateTo(    {
                alias:'SHARENODE',
                 where: {
                         uuid: shareNode.uuid,
                 },
                 properties: {
                     uuid: uuidv7(),
                     post_uuid: post.uuid,
                     degree: degree
                 },
                 assertCreatedRelationships: 1,
             })

             
        }
        
    }
    static async nodeIsRelatedToPost(post: POSTInstance, shareNode: SHARENODEInstance){
        const result = await this.backwardsDistributionPath(post, shareNode)
        console.log(result)
        return result ? true:false
    }
    static async getNodeByUser(user: USERInstance){
        const sn = await user.shareNode()
        return sn
    }
    static async backwardsDistributionPath(post:POSTInstance, shareNode: SHARENODEInstance){
        const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
        const result = await new QueryBuilder()
        .match({identifier: 'sn', where: {uuid: shareNode.uuid}})
        .raw(`OPTIONAL MATCH path = (:POST)-[:EDGE* {post_uuid: "${post.uuid}"}]->(sn) WITH collect(path) as path`)
        .return('path')
        .run(queryRunner)
        console.log(result.records[0].get('path'))
        return result.records[0].get('path');
    }
    static async forwardsDistributionPath(post:POSTInstance, shareNode: SHARENODEInstance){
        if(!await this.nodeIsRelatedToPost(post, shareNode)){
            throw new AppError('No Forwards Path, node not found in post', 500)
        }
        const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
        const result = await new QueryBuilder()
        .match({identifier: 'sn', where: {uuid: shareNode.uuid}})
        .raw(`MATCH path = (sn)-[:EDGE* {post_uuid: "${post.uuid}"}]->(:SHARENODE) WITH collect(path) as path`)
        .return('path')
        .run(queryRunner)
        return result.records[0].get('path');
    }
    static async transformPathData(data: PathData): Promise<TransformedData> {
        console.log('Starting data transformation');
        //console.log('Input data:', JSON.stringify(data, null, 2));
        const combinedData:any = data;
        console.log('Combined data length:', combinedData.length);
    
        const mydata: TransformedData = {
          nodes: [],
          links: []
        };
    
        const nodeMap = new Map<string, TransformedNode>();
    
        console.log('Initializing nodeMap');
    
        const addNode = (node: Node): void => {
          const nodeId = node.identity.toString();
          if (!nodeMap.has(nodeId)) {
            console.log(`Adding new node with id: ${nodeId}`);
            const nodeObj: TransformedNode = {
              id: nodeId,
              label: `NODE ${node.identity}`,
              ...node.properties
            };
            mydata.nodes.push(nodeObj);
            nodeMap.set(nodeId, nodeObj);
            console.log(`Node added:`, JSON.stringify(nodeObj, null, 2));
          } else {
            console.log(`Node with id ${nodeId} already exists, skipping`);
          }
        };
    
        console.log('Processing paths and segments');
    
        combinedData.forEach((path: Path, index: number) => {
          console.log(`Processing path ${index + 1}`);
          //console.log('Start node:', JSON.stringify(path.start, null, 2));
          addNode(path.start);
          //console.log('End node:', JSON.stringify(path.end, null, 2));
          addNode(path.end);
    
          console.log(`Processing ${path.segments.length} segments in path ${index + 1}`);
          path.segments.forEach((segment: Segment, segIndex: number) => {
            console.log(`Processing segment ${segIndex + 1} in path ${index + 1}`);
            const link: TransformedLink = {
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