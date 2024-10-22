import {  translateDateTime } from "../../../types/Globals";
import applogger from '../../../lib/logger/applogger';
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

class GraphDataTransformer {

  constructor() {
  }


    transformPathsToData(paths: any[]): TransformedData {
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

}

export default GraphDataTransformer;