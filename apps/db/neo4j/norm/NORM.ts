
import applogger from '../../../../lib/logger/applogger'
const logger = applogger.child({ 'module': 'NORM' });
import { AppError, DatabaseError } from '../../../../lib/error/customErrors'
import neo4j, { Driver, EagerResult, Node, Result, Session, QueryResult, RxResult, Record, integer } from 'neo4j-driver'
import {TransactionConfig} from 'neo4j-driver-core/types/'
import {Query} from 'neo4j-driver-core/types/types'

import dotenv from 'dotenv';
import { NodeObj } from '../models/NodeObj';
import { Parameters } from 'neo4j-driver/types/query-runner';
import { ResultProcessor } from './ResultProcessor';
import { RecordProcessor } from './RecordProcessor';
import { CypherBuilder } from './CypherBuilder';
dotenv.config();

interface Source{
    label?: String | null
    properties?: object|null
    elementId?: string|null
}
interface Relationship{
    label?: String | null
    type?: string | null
    direction?: string|null
    properties?: object|null
    elementId?: string|null
}
interface Target{
    label?: String | null
    properties?: object|null
    elementId?: string|null
}
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
          .then(result => {output =  result}).catch(error => {log.error(error); throw error}).finally(()=>{this.session.close()})
        return output
    }
    
    async getNodeByProperty (labels:any, properties:any,variableName?: string) : Promise<QueryResult>{
        const varName = variableName||'x'
        const result = await this.run(`
          MATCH (${varName}:${labels.join(':')})
          WHERE ALL(key IN keys($properties) WHERE ${varName}[key] = $properties[key])
          RETURN ${varName}
        `, { properties: properties })
        return result
    }
    async getNodeById (elementId:string,variableName: string|null) : Promise<QueryResult>{
        const varName = variableName||'x'
        const cb = new CypherBuilder()
        cb.matchByElementId(varName,elementId).return([varName])
        const result = await this.run(cb.query, cb.parameters)
        return result

    }

    async getWithPagination(cypher:string, parameters:Parameters, variableName:string, page:number, pageSize: number, orderBy?:string, ascending?:boolean): Promise<QueryResult>{
        const varName = variableName || 'x'
        const cb = new CypherBuilder()
        cb.append(cypher, parameters).return([varName])
        if(orderBy){
            cb.orderBy(varName, orderBy)
            if(ascending != null){
                if(ascending==true){
                    cb.ascending()
                }else{
                    cb.descending()
                }
            }
            
        }
        cb.skip((page-1)*pageSize)
        cb.limit(pageSize)
        const result = await this.run(cb.query,cb.parameters)
        return result
    }
    async createNode(labels: string, properties: object, variableName?:string): Promise<QueryResult> {
        const varName = variableName || 'x'
        const cb = new CypherBuilder()
        cb.create().node(varName,[labels],properties).return([varName]).terminate()
        const result = await this.run(cb.query,cb.parameters);
        return result
      }
      async updateNode(elementId:string, updateProperties: object, variableName?:string): Promise<QueryResult> {
        const varName = variableName || 'x'
        const cb = new CypherBuilder()
        cb.matchByElementId(varName, elementId).append(`SET ${varName} += $updateProperties`,updateProperties).return([varName]).terminate()
        const result = await this.run(cb.query,cb.parameters);
        return result;
      }
      
      async deleteNode(elementId: string, variableName?:string, detach?: boolean): Promise<QueryResult> {
        const log = logger.child({ 'function': 'deleteNode' });
        const varName = variableName || 'x'
        const cb = new CypherBuilder()
        cb.matchByElementId(varName, elementId)
        detach? cb.detach():''
        cb.delete([varName]).append(` RETURN count(${varName}) as deletedCount;`)
        const result = await this.run(cb.query,cb.parameters);
        return result
      }
    async createRelationship(sourceElementId:string, relationshipLabel:string, relationshipProperties:object, targetElementId:string){
        const cb = new CypherBuilder()
        cb.matchByElementId('source',sourceElementId).matchByElementId('target',targetElementId).create().node('source').rightRelationship('relationship',relationshipLabel,relationshipProperties).node('target').return(['source','relationship','target'])
        const result = await this.run(cb.query, cb.parameters)
        return result
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
                //let t = await this.getNodeByProperty(['NODE'], {'NODE_UUID': '01910aca-02bf-7ccc-ac36-fafdee4f0901'}, 'source') 
               
                let p = await this.getWithPagination(new CypherBuilder().match().node('user',['USER']).query.toString(),{},'user',3,10, 'identity', false)
                logger.info(p)
                //let z = await this.deleteNode('yyy', 'x', true)
                let rp = new ResultProcessor(p)
                let ids = rp.records.map((record)=> record.get('user').identity.low)
                logger.info(ids)

              
                
                
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