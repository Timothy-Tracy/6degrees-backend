import { DateTime, integer, Integer } from 'neo4j-driver';
import {models} from '../../db/neo4j/models/models'
import { AppError } from '../../../lib/error/customErrors';
import { QueryBuilder, QueryRunner, Where } from 'neogma';
import neogma from '../../db/neo4j/neogma/neogma';
import applogger from '../../../lib/logger/applogger';
import { POSTInstance } from '../../db/neo4j/models/types/nodes/POST';
import { SHARENODEInstance } from '../../db/neo4j/models/types/nodes/SHARENODE';
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
    static async getPreceedingEdge(post: POSTInstance, shareNode: SHARENODEInstance){
        const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
        const result = await new QueryBuilder()
        .match({identifier: 'node', where: {uuid: shareNode.uuid}})
        .raw(`MATCH (n)-[next:NEXT {post_uuid: "${post.uuid}"}]->(node)`)
        .return('edge')
        .run(queryRunner)
        return result.records[0].get('next').properties
    }
    static async createEdge(post: POSTInstance, shareNode: SHARENODEInstance, sourceShareNode?: SHARENODEInstance){
      logger.error(integer.toNumber(Math.trunc(Number(new Integer(0).toBigInt()))))
        if(!sourceShareNode){
            const postToNext= await post.relateTo({
                alias: "SHARENODE",
                where: {
                    uuid: shareNode.uuid,
                },
                properties: {
                    uuid: uuidv7(),
                    post_uuid: post.uuid,
                    degree: Number(new Integer(0).toBigInt()),
                    method: 'default'
                },
                assertCreatedRelationships: 1,
            })
            logger.info(postToNext)

        } else {
            const prev = await sourceShareNode.prev(post)
            const result = models.SHARENODE.relateTo({
                alias: "SHARENODE",
                where: {
                    source: {uuid: sourceShareNode.uuid},
                    target:{uuid:shareNode.uuid}
                },
                properties:{
                    uuid: uuidv7(),
                    post_uuid: post.uuid,
                    degree:Number(new Integer(prev.degree).toBigInt()+new Integer(1).toBigInt()),
                   
                    method: 'default'
                },
                assertCreatedRelationships: 1
            })
        }
    }
    static async createAnonSharenode(){
        const log = logger.child({'function': 'createAnonSharenode'})
        log.trace('');
        const anonNode = await models.SHARENODE.createOne({uuid: uuidv7(),anon:true})
        return anonNode
    }
    static async createEdgeUnauthorized(post: POSTInstance, sourceShareNode: SHARENODEInstance){
        const prevEdge = await sourceShareNode.prev(post)
        const anonNode = await models.SHARENODE.createOne({uuid: uuidv7(),anon:true})
        await models.SHARENODE.relateTo({
            alias: 'SHARENODE',
            where:{
                source: {uuid: sourceShareNode.uuid},
                target:{uuid:anonNode.uuid}
            },
            properties: {
                method: 'default',
                post_uuid: post.uuid,
                degree: Number(new Integer(prevEdge.degree).toBigInt()+new Integer(1).toBigInt()),
            }
        }).then(() => console.log('created relationship'))

        return anonNode
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