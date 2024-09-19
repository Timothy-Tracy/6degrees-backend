
import applogger from '../../../../lib/logger/applogger'
const logger = applogger.child({ 'module': 'NORM' });
import { AppError, DatabaseError } from '../../../../lib/error/customErrors'
import neo4j, { Driver, EagerResult, Node, Result, Session, QueryResult, RxResult, Record, integer } from 'neo4j-driver'
import {TransactionConfig} from 'neo4j-driver-core/types/'
import {Query} from 'neo4j-driver-core/types/types'

import dotenv from 'dotenv';
import { NodeObj } from '../models/NodeObj';
import { Parameters } from 'neo4j-driver/types/query-runner';
dotenv.config();
class NORM {
    driver!: Driver
    session!: Session
    DB_URL!: string
    DB_USERNAME!: string
    DB_PASSWORD!: string
    DB_DATABASE!: string;

    constructor(){
        
        this.initEnv()
        this.initDriver()
        this.initSession()
    }
    initEnv = () => {
        logger.info(process.env.DB_URL)
        if(!process.env.DB_URL){
            throw new AppError('DB_URL does not exist in environment variables', 500)
        } else {
            this.DB_URL = process.env.DB_URL
        }
        if(!process.env.DB_USERNAME){
            throw new AppError('DB_USERNAME does not exist in environment variables', 500)
        }
        else {
            this.DB_USERNAME = process.env.DB_USERNAME
        }
        if(!process.env.DB_PASSWORD){
            throw new AppError('DB_PASSWORD does not exist in environment variables', 500)
        }
        else {
            this.DB_PASSWORD = process.env.DB_PASSWORD
        }
        if(!process.env.DB_DATABASE){
            throw new AppError('DB_DATABASE does not exist in environment variables', 500)
        }
        else {
            this.DB_DATABASE = process.env.DB_DATABASE
        }
    }
    initDriver = () => {
        try{
            this.driver = neo4j.driver(this.DB_URL, neo4j.auth.basic(this.DB_USERNAME, this.DB_PASSWORD))
        } catch(error:any){
            throw error
        }
        return this.driver
    }
    initSession = () => {
        try{
            this.session = this.driver.session({ database:this.DB_DATABASE });
        } catch(error){
            throw error
        }
        return this.session
    }
    
    async run(query: Query, parameters?: Parameters, transactionConfig?: TransactionConfig): Promise<Result>{
        const log = logger.child({ 'function': 'getNode' });
        let output:any = {}
        
        await this.initSession().run(query, parameters,transactionConfig)
          .then(result => {
            output = result
            
          }).catch(error => {
            log.error(error)
            throw error
          }).finally(()=>{
            this.session.close()
          })
          return output

    }

    // processResult(result:QueryResult){
    //     return result
        
    //     logger.debug(result)
    //     logger.debug(result.records)

    // }
    
    // recordHasValue(record:Record, key:PropertyKey): boolean{
    //     if(!(record && record.has(key))){
    //         return false
    //     } else{
    //         return true
    //     }
    // }
    // assertRecordHasValue(record:Record, key:PropertyKey): void{
    //     const log = logger.child({ 'function': 'assertRecordHasValue' });
    //     if(!this.recordHasValue(record,key)){
    //         throw new AppError(`EntityNotFoundError: key \'${String(key)}\'`, 404)
    //     }
    //     log.debug('Record has value')
    // }
    

    async getNode (labels:any, properties:any,variableName?: string) : Promise<QueryResult>{
        const varName = variableName||'x'
        const result = await this.run(`
          MATCH (${varName}:${labels[0]})
          WHERE ALL(key IN keys($properties) WHERE ${varName}[key] = $properties[key])
          RETURN ${varName}
        `, { properties: properties })
        return result
    }
    async getNodeById (elementId:string,variableName: string|null) : Promise<QueryResult>{
        const varName = variableName||'x'
        const result = await this.run(`
          ${this.createMatchClauseById(elementId, varName)}
          RETURN ${varName}
        `)
        return result

    }
    async createNode(label: string, properties: object): Promise<QueryResult> {
        const log = logger.child({ 'function': 'createNode' });
        try {
          const result = await this.run(`
            CREATE (x:${label} $properties)
            RETURN x
          `, { properties });
      
          if (result.records.length === 0) {
            throw new AppError('Node creation failed', 500);
          }
          log.info('Node created successfully');
      
          return result
        } catch (error) {
          log.error('Error creating node', error);
          throw error;
        } 
      }
      async updateNode(elementId:string, updateProperties: object, variableName?:string): Promise<QueryResult> {
        const varName = variableName || 'x'
        try {
          const result = await this.run(`
            ${this.createMatchClauseById(elementId, varName)}
            SET ${varName} += $updateProperties
            RETURN ${varName}
          `, {updateProperties });
          if (result.records.length === 0) {
            throw new Error('Node not found or update failed');
          }
          return result;
        } catch (error) {
          logger.error('Error updating node', error);
          throw error;
        }
      }
      
      async deleteNode(elementId: string, variableName?:string, detach?: boolean): Promise<QueryResult> {
        const log = logger.child({ 'function': 'deleteNode' });
        const varName = variableName || 'x'
        try {
          const result = await this.run(`
            ${this.createMatchClauseById(elementId, varName)}
            ${detach? 'DETACH':''} DELETE ${varName}
            RETURN count(${varName}) as deletedCount
          `);
          const deletedCount = result.records[0].get('deletedCount').toNumber();
          if (deletedCount === 0) {
            log.warn('No nodes were deleted');
            throw new AppError('No nodes were deleted', 500)
          }
      
          log.info(`${deletedCount} node(s) deleted successfully`);
          return result
        } catch (error) {
          log.error('Error deleting node', error);
          throw error;
        }
      }
      createMatchClauseById(elementId: string, variableName: string) : String{
        return `MATCH (${variableName})
            WHERE elementId(${variableName}) = '${elementId}'
            `
      }
    //   async createRelationship(
    //     source_node: Node,
    //     relationship_label: string,
    //     relationship_properties: object,
    //     target_node: Node|null,
        
    // ): Promise<Node> {
    //     const log = logger.child({ 'function': 'createRelationship' });
    //     let output: any = {};

    //     }
    //   }

    test = async() =>{
        try{
        
            try{
                let t = await this.getNode(['NODE'], {'NODE_UUID': '01910aca-02bf-7ccc-ac36-fafdee4f0901'}, 'source') 
                console.log(t)
            }catch(e){
                logger.error(e, 'caught e')
            }
            
        } catch(error){
            logger.error(error)
        }
        

    }

}

const orm = new NORM()
logger.info(orm.test())

export{
    NORM
}