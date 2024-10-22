import { Neo4jDateTimeSchema, translateDateTime, uuidSchema } from "../../../../types/Globals";
import { models } from "./models";
import { POSTInstance, POSTPropertiesSchema } from "./types/nodes/POST";
import { degreeSchema, methodSchema } from "./types/relationships/NEXT";
import applogger from '../../../../lib/logger/applogger';
import { AppError, PostError } from '../../../../lib/error/customErrors';
import { QueryBuilder, QueryRunner } from "neogma";
import neogma from "../neogma/neogma";
import { SHARENODEInstance } from "./types/nodes/SHARENODE";

const logger = applogger.child({'module':'models'});

export class POSTInitializer {
    static init(){
        this.initRelationships()
        this.initMethods()
        this.initStatics()
    }
    static initRelationships(){
        models.POST.addRelationships({
            SHARENODE: {
                model: models.SHARENODE,
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
                    hash:{
                        property: 'hash',
                        schema:{
                            type:'string',
                            required: false,
                            
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
                            type:'any',
                            required: true,
                            conform:(value) => Neo4jDateTimeSchema.safeParse(translateDateTime(value)).success
        
                        }
                    },
                    updatedAt:{
                        property: 'updatedAt',
                        schema:{
                            type:'any',
                            required: true,
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
            },
            USER: {
                model: models.USER,
                direction: 'out',
                name: 'PARENT_USER',
                properties:{
                    uuid:{
                        property: "uuid",
                        schema:{type:'any',required: true,
                        conform:(value) => uuidSchema.optional().safeParse(value).success
                        }
                    },
                    createdAt:{
                        property: 'createdAt',
                        schema:{
                            type:'any',
                            required: true,
                            conform:(value) => Neo4jDateTimeSchema.safeParse(translateDateTime(value)).success
        
                        }
                    },
                    updatedAt:{
                        property: 'updatedAt',
                        schema:{
                            type:'any',
                            required: true,
                            conform:(value) => Neo4jDateTimeSchema.safeParse(translateDateTime(value)).success
                        }
                    }
                }
            }
        })
    }
    static initMethods(){
        models.POST.beforeCreate = (instance: POSTInstance) =>{
            instance.createdAt = translateDateTime(instance.createdAt)
            instance.updatedAt = translateDateTime(instance.updatedAt)
            
            console.log(instance.dataValues)
            POSTPropertiesSchema.parse(instance.dataValues)
           
        
        }
            models.POST.prototype.sourceSharenode = async function(this:POSTInstance):Promise<SHARENODEInstance>{
                const log = logger.child({'function': 'models.POST.prototype.user'});
                log.trace('');
                const result = await this.findRelationships({alias:'SHARENODE'}) 
                if(!result[0].target){throw new PostError('Cannot find sharenode', 500)}   
              return result[0].target;
            }
        
          
          models.POST.prototype.user = async function(this:POSTInstance){
            const log = logger.child({'function': 'models.POST.prototype.user'});
            log.trace('');
            const result = await this.findRelationships({alias:'USER'}) 
            if(!result[0] || !result[0].target){throw new PostError('Cannot find user', 500)}   
          return result[0].target;
        }
    }
    static initStatics(){
        models.POST.findByQuery = async function(query:string): Promise<POSTInstance|null>{
            const x = await models.POST.findOne({where:{query: query}})
            return x
        }
    }
        

}
