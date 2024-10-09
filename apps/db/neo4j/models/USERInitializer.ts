import { AppError } from "../../../../lib/error/customErrors";
import { Neo4jDateTimeSchema, translateDateTime, uuidSchema } from "../../../../types/Globals";
import { models } from "./models";
import { USERInstance, USERModel } from "./types/nodes/USER";
const { v7: uuidv7 } = require('uuid');

export class USERInitializer {
    static init(){
        this.initRelationships()
        this.initMethods()
        this.initStatics()
    }
    static initRelationships(){
        models.USER.addRelationships({
            SHARENODE: {
                model: models.SHARENODE,
                direction: 'in',
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
            POST: {
                model: models.USER,
                direction: 'in',
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
            }
    })
    
    }
    static initMethods(){
        models.USER.prototype.shareNode = async function(this: USERInstance) {
            console.log('a');
            const shareNode = await this.findRelationships({ alias: "SHARENODE" });
            if(shareNode[0]){
                return shareNode[0].target;
            } else {
                return null
            }
        }
        models.USER.prototype.createSharenode = async function(this: USERInstance){
            const alreadyHasSharenode = await this.shareNode()
            if(alreadyHasSharenode != null){
                throw new AppError('User already has sharenode', 500)
            } else {
                const result = await models.SHARENODE.createOne({
                  uuid:uuidv7(),
                  anon:false
                })
                await result.relateTo({alias:'USER',
                  where:{
                    uuid:this.uuid
                  }
                })
                
            }
          }
    }
    static initStatics(){
        models.USER.getUserByUsername = async function(username:string) : Promise<USERInstance>{
            const user = await models.USER.findOne({where:{username: username}});
            if (!user){throw new AppError('User not found in the database', 404)}
            return user;
        }

        models.USER.getShareNodeByUsername = async function(username:string){
            const user = await models.USER.getUserByUsername(username)
            return user.shareNode();
        }
    }

}
