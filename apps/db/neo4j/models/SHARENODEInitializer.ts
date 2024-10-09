import { Neo4jDateTimeSchema, translateDateTime, uuidSchema } from "../../../../types/Globals";
import { models } from "./models";
import { SHARENODEInstance, SHARENODEModel } from "./types/nodes/SHARENODE";
import { USERModel } from "./types/nodes/USER";
import { degreeSchema, methodSchema } from "./types/relationships/NEXT";
import applogger from '../../../../lib/logger/applogger';
import { AppError, PostError } from '../../../../lib/error/customErrors';
import { QueryBuilder, QueryRunner } from "neogma";
import neogma from "../neogma/neogma";
import { POSTInstance } from "./types/nodes/POST";

const logger = applogger.child({'module':'models'});


export class SHARENODEInitializer {
    static init(){
        this.initRelationships()
        this.initMethods()
    }
    static initRelationships(){
        models.SHARENODE.addRelationships({
            USER: {
                model: models.USER,
                direction: 'out',
                name: 'PARENT_USER',
                properties:{
                    uuid:{
                        property: "uuid",
                        schema:{type:'any',required: false,
                        conform:(value) => uuidSchema.optional().safeParse(value).success
                        }
                    },
                    createdAt:{
                        property: 'createdAt',
                        schema:{
                            type:'string',
                            required: false,
                            conform:(value) => Neo4jDateTimeSchema.safeParse(translateDateTime(value)).success
        
                        }
                    },
                    updatedAt:{
                        property: 'updatedAt',
                        schema:{
                            type:'string',
                            required: false,
                            conform:(value) => Neo4jDateTimeSchema.safeParse(translateDateTime(value)).success
                        }
                    }
                }
            },
            SHARENODE: {
                model: "self",
                direction: 'out',
                name: 'NEXT',
                properties:{
                    uuid:{
                        property: "uuid",
                        schema:{type:'any',required: false,
                        conform:(value) => uuidSchema.optional().safeParse(value).success
                        }
                    },
                    post_uuid:{
                        property: 'post_uuid',
                        schema:{
                            type:'string',
                            required: true,
                            conform:(value) => uuidSchema.safeParse(value).success
                        }
                    },
                    degree:{
                        property: 'degree',
                        schema:{
                            type:'any',
                            
                            required: true,
                            conform:(value) => degreeSchema.safeParse(value).success
                        }
                    },
                    createdAt:{
                        property: 'createdAt',
                        schema:{
                            type:'string',
                            required: false,
                            conform:(value) => Neo4jDateTimeSchema.safeParse(translateDateTime(value)).success
        
                        }
                    },
                    updatedAt:{
                        property: 'updatedAt',
                        schema:{
                            type:'string',
                            required: false,
                            conform:(value) => Neo4jDateTimeSchema.safeParse(translateDateTime(value)).success
                        }
                    }, 
                    method: {
                        property: 'method',
                        schema: {
                            type: 'string',
                            required: true,
                            conform:(value) => methodSchema.safeParse(value).success
                        }
                    }
                    
                }
            }
        });

    }
    static initMethods(){
        models.SHARENODE.prototype.user = async function(this:SHARENODEInstance){
            const log = logger.child({'function': 'models.SHARENODE.prototype.user'});
            log.trace('');
            const result = await this.findRelationships({alias:'USER'}) 
            if(!result[0].target){throw new AppError('ShareNodeError: Cannot find user', 500)}   
          return result[0].target;
        }

        models.SHARENODE.prototype.isRelatedToPost = async function(this:SHARENODEInstance, post:POSTInstance){
            const log = logger.child({'function': 'models.SHARENODE.prototype.isRelatedToPost'});
              log.trace('');
            const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
                const result = await new QueryBuilder()
                .raw(`MATCH ()-[n:NEXT* {post_uuid: "${post.uuid}"}]->(sn:SHARENODE {uuid: "${this.uuid}"}) `)
                .return('n')
                .run(queryRunner)
        
                log.error(result.records[0] ? true: false)
                return result.records[0] ? true: false;
          }
          models.SHARENODE.prototype.safeIsRelatedToPost = async function(this:SHARENODEInstance, post:POSTInstance){
            const log = logger.child({'function': 'models.SHARENODE.prototype.safeIsRelatedToPost'});
            log.trace('');
            if(! await this.isRelatedToPost(post)){throw new AppError(`ShareNodeError: ShareNode is not related to post ${post.query} ${post.uuid}`, 500)}
          }
          models.SHARENODE.prototype.backwardPath = async function(this:SHARENODEInstance, post:POSTInstance){
            const log = logger.child({'function': 'models.SHARENODE.prototype.backwardPath'});
            log.trace('');
            this.safeIsRelatedToPost(post)    
            const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
            const result = await new QueryBuilder()
            .match({identifier: 'sn', where: {uuid: this.uuid}})
            .raw(`OPTIONAL MATCH path = (:POST)-[:NEXT* {post_uuid: "${post.uuid}"}]->(sn) WITH collect(path) as path`)
            .return('path')
            .run(queryRunner)
            console.log(result.records[0].get('path'))
            return result.records[0].get('path');
        }
        
        models.SHARENODE.prototype.forwardPath = async function(this:SHARENODEInstance, post:POSTInstance){
          const log = logger.child({'function': 'models.SHARENODE.prototype.forwardPath'});
          log.trace('');
          this.safeIsRelatedToPost(post)
          const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
          const result = await new QueryBuilder()
          .match({identifier: 'sn', where: {uuid: this.uuid}})
          .raw(`MATCH path = (sn)-[:NEXT* {post_uuid: "${post.uuid}"}]->(:SHARENODE) WITH collect(path) as path`)
          .return('path')
          .run(queryRunner)
          return result.records[0].get('path');
        }
        
        models.SHARENODE.prototype.prev = async function(this:SHARENODEInstance, post:POSTInstance){
          const log = logger.child({'function': 'models.SHARENODE.prototype.prev'});
          log.trace('');
          const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
                const result = await new QueryBuilder()
                .raw(`MATCH ()-[next:NEXT {post_uuid: "${post.uuid}"}]->(node:SHARENODE {uuid: "${this.uuid}"})`)
                .return('next')
                .run(queryRunner)
          return result.records[0].get('next').properties
        }
        
    }
        

}
