import applogger from '../../../../lib/logger/applogger'
const logger = applogger.child({ 'module': 'NORM' });
import { AppError, DatabaseError } from '../../../../lib/error/customErrors'
import { Node } from 'neo4j-driver';
import { NORM } from '../norm/NORM';
import { Integer } from 'neo4j-driver-core';
import { ResultProcessor } from '../norm/ResultProcessor';
interface Properties {
    [key: string]: any;
}type NumberOrInteger = number | Integer | bigint;
class NodeObj {
    labels : Array<string>
    properties: Properties
    identity: NumberOrInteger | null
    elementId: string
    constructor(labels:string[], properties:Properties, identity?: NumberOrInteger, elementId?: string) {
        this.labels = labels
        this.properties = properties
        this.identity = identity || null
        this.elementId = elementId || ''
    }
  
    async create(){
      if (!this.isNew()) {
        throw new AppError('This node has already been saved', 500)
      }
     const orm = new NORM()
      // Update the current instance with the saved data
      const result =await orm.createNode(this.labels[0], this.properties, 'n')
        const rp = new ResultProcessor(result)
        const n = rp.first().get('n')
        Object.assign(this, new NodeObj(n.labels, n.properties,n.identity, n.elementID))
      }
      
    
    // async update(updateProperties: Properties){
    //   this.assertORM()
      
    //   // Update the current instance with the saved data
    //   await this.orm.updateNode(this.node.labels[0], this.node.properties, updateProperties).then((result)=>{
    //     const savedNode = new NodeObj(this.orm, result.identity, result.labels, result.properties,  result.elementId)
    //     Object.assign(this, savedNode)
    //   }
    //   )
    // }


    
  
    getId(): string {return this.elementId}
    isNew(): boolean {return this.elementId === ''}

  }
  
  export { NodeObj }