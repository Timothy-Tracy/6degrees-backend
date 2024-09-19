import applogger from '../../../../lib/logger/applogger'
const logger = applogger.child({ 'module': 'NORM' });
import { AppError, DatabaseError } from '../../../../lib/error/customErrors'
import { Node } from 'neo4j-driver';
import { NORM } from '../norm/NORM';
import { Integer } from 'neo4j-driver-core';
interface Properties {
    [key: string]: any;
}type NumberOrInteger = number | Integer | bigint;
class NodeObj {
    orm: NORM
    node:Node
    constructor(orm:NORM, node:Node) {
      
        this.node = node
        this.orm = orm
    }
  
    // async create(){
    //   if (!this.isNew()) {
    //     throw new AppError('This node has already been saved', 500)
    //   }
    //   this.assertORM()
    //   // Update the current instance with the saved data
    //   await this.orm.createNode(this.labels[0], this.properties).then((result)=>{
    //     const savedNode = new NodeObj(this.orm, result.identity, result.labels, result.properties,  result.elementId)
    //     Object.assign(this, savedNode)
    //   }
    //   )
    // }
    // async update(updateProperties: Properties){
    //   this.assertORM()
      
    //   // Update the current instance with the saved data
    //   await this.orm.updateNode(this.node.labels[0], this.node.properties, updateProperties).then((result)=>{
    //     const savedNode = new NodeObj(this.orm, result.identity, result.labels, result.properties,  result.elementId)
    //     Object.assign(this, savedNode)
    //   }
    //   )
    // }


    async remove(orm: NORM, detach?:boolean){
      this.assertORM()
      if(!detach){
        detach = false
      }
      await this.orm.deleteNode(this.node.labels[0], this.node.properties, detach)

    }
  
    getId(): string {return this.node.elementId}
    isNew(): boolean {return this.node.elementId === ''}
    verifyORM(): boolean{if(this.orm){return true} else {return false}}
    assertORM(): void{if (!this.verifyORM()) {throw new AppError('The ORM is not initialized', 500)}}
  }
  
  export { NodeObj }