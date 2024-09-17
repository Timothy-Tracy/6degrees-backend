
import applogger from '../../../../lib/logger/applogger'
const logger = applogger.child({ 'module': 'NORM' });
import { AppError, DatabaseError } from '../../../../lib/error/customErrors'
import neo4j, { Driver, Node, Result, Session } from 'neo4j-driver'

import dotenv from 'dotenv';
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

    async getNode (label:string, properties:object) : Promise<Node | null>{
        const log = logger.child({ 'function': 'get' });
        let output:any = {}
        await this.initSession().run(`
          MATCH (x:${label})
          WHERE ALL(key IN keys($properties) WHERE x[key] = $properties[key])
          RETURN x
        `, {label:label, properties: properties })
          .then(result => {
            if(result.records.length === 0){
                output = null
            } else {
                log.info(result)
                output = result.records[0].get('x')
            }
            
          }).catch(error => {
            throw error
          }).finally(()=>{
            this.session.close()
          })
          return new Node(output.identity, output.labels,output.properties,output.elementID)
    }
    async createNode(label: string, properties: object): Promise<Node> {
        const log = logger.child({ 'function': 'createNode' });
        let output: any = {};
      
        try {
          const result = await this.initSession().run(`
            CREATE (x:${label} $properties)
            RETURN x
          `, { properties });
      
          if (result.records.length === 0) {
            throw new AppError('Node creation failed', 500);
          }
      
          output = result.records[0].get('x');
          log.info('Node created successfully', output);
      
          return new Node(output.identity, output.labels, output.properties, output.elementId);
        } catch (error) {
          log.error('Error creating node', error);
          throw error;
        } finally {
          await this.session.close();
        }
      }
      async updateNode(label: string, identifier: object, updateProperties: object): Promise<Node> {
        const log = logger.child({ 'function': 'updateNode' });
        let output: any = {};
      
        try {
          const result = await this.initSession().run(`
            MATCH (x:${label})
            WHERE ALL(key IN keys($identifier) WHERE x[key] = $identifier[key])
            SET x += $updateProperties
            RETURN x
          `, { identifier, updateProperties });
      
          if (result.records.length === 0) {
            throw new Error('Node not found or update failed');
          }
      
          output = result.records[0].get('x');
          log.info('Node updated successfully', output);
      
          return new Node(output.identity, output.labels, output.properties, output.elementId);
        } catch (error) {
          log.error('Error updating node', error);
          throw error;
        } finally {
          await this.session.close();
        }
      }
      
      async deleteNode(label: string, identifier: object, detach?: boolean): Promise<boolean> {
        const log = logger.child({ 'function': 'deleteNode' });
        
        
        try {
          const result = await this.initSession().run(`
            MATCH (x:${label})
            WHERE ALL(key IN keys($identifier) WHERE x[key] = $identifier[key])
            ${detach? 'DETACH':''} DELETE x
            RETURN count(x) as deletedCount
          `, { identifier });
          log.info(result)
      
          const deletedCount = result.records[0].get('deletedCount').toNumber();
      
          if (deletedCount === 0) {
            log.warn('No nodes were deleted');
            return false;
          }
      
          log.info(`${deletedCount} node(s) deleted successfully`);
          return true;
        } catch (error) {
          log.error('Error deleting node', error);
          throw error;
        } finally {
          await this.session.close();
        }
      }

    test = async() =>{
        try{
            //const t = await this.getNode('NODE', {'NODE_UUID':'0190d1d6-ca93-7009-81f5-c94ce35b8c89'})
            //const t = await this.getNode('TEST', {'test':'test'})
            const x = await this.createNode('TEST', {'test':'test'})

            const d = await this.deleteNode('TEST', {'test':'test'})

            // if(t){
            //     logger.info(t.elementId)

            // }
            // if(x){
            //     logger.info(x.toString())

            // }
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