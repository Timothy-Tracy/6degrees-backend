import applogger from '../../../../lib/logger/applogger'
const logger = applogger.child({ 'module': 'NORM' });
import { AppError, DatabaseError } from '../../../../lib/error/customErrors'
import { Node } from 'neo4j-driver';
import { NORM } from '../norm/NORM';
import { Integer, NumberOrInteger } from 'neo4j-driver-core';
interface Properties {
    [key: string]: any;
}
class NodeObj<T extends NumberOrInteger = Integer, P extends Properties = Properties, Label extends string = string> extends Node<T, P, Label> {
    constructor(labels: Label[], properties?: P, identity?: T, elementId?: string) {
        super(identity || '' as unknown as T, labels, properties || {} as P, elementId || '')
    }
  
    async save(orm: NORM){
      if (!this.isNew()) {
        throw new Error('This node has already been saved')
      }
      // Update the current instance with the saved data
      await orm.createNode(this.labels[0], this.properties).then((result)=>{
        const savedNode = new NodeObj(result.labels, result.properties, result.identity, result.elementId)
        Object.assign(this, savedNode)
      }
      )
    }

    async remove(orm: Norm)
  
    getId(): string {return this.elementId}
    isNew(): boolean {return this.elementId === ''}
  }
  
  export { NodeObj }