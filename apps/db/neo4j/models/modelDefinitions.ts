import { ModelFactory, ModelRelatedNodesI, NeogmaInstance, NeogmaModel, Where } from "neogma";
import neogma from './../neogma/neogma';
import { AppError } from "../../../../lib/error/customErrors";

// USER model
export type USERProperties = {
    email: string,
    username: string,
    uuid?: string,
    createdAt?: string,
    updatedAt?: string
};
export interface USERRelatedNodes {
    SHARENODE: ModelRelatedNodesI<any, any>,
    POST: ModelRelatedNodesI<any, any>

}
interface USERMethods {
    shareNode: (this: USERInstance) => Promise<SHARENODEInstance>,
    createSharenode:(this: USERInstance) => Promise<void>
}
interface USERStatics {
    getShareNodeByUsername: (username: string) => Promise<SHARENODEInstance>,
    getUserByUsername: (username: string) =>Promise<USERInstance>
}

export type USERInstance = NeogmaInstance<USERProperties, USERRelatedNodes, USERMethods>;

export const USER = ModelFactory<USERProperties, USERRelatedNodes, USERStatics, USERMethods>({
    label: 'USER',
    schema: {
        username: { type: 'string', minLength: 3, required: true },
        email: { type: 'string', minLength: 3, required: true },
        uuid: { type: 'string', required: true },
        createdAt:{
            type:'any',
            required: false
        },
        updatedAt:{
            type:'any',
            required: false
        }
    },
    primaryKeyField: 'uuid',
    methods: {
        async shareNode(this: USERInstance) {
            console.log('a');
            const shareNode = await this.findRelationships({ alias: "SHARENODE" });
            if(shareNode[0]){
                return shareNode[0].target;
            } else {
                return null
            }
            
        }
        
    },
    statics: {
        async getUserByUsername(username:string) : Promise<USERInstance>{
            const user = await USER.findOne({where:{username: username}});
            if (!user){throw new AppError('User not found in the database', 404)}
            return user;
        },
        async getShareNodeByUsername(username:string){
            const user = await this.getUserByUsername(username)
            return user.shareNode();
        },
        
    },
   
}, neogma);

// SHARENODE model
export type SHARENODEProperties = { 
    uuid?: string,
    createdAt?: string,
    updatedAt?: string,
    anon: boolean
 };
export interface SHARENODERelatedNodes {
    USER: ModelRelatedNodesI<any, any>
    SHARENODE: ModelRelatedNodesI<any, any>
}
interface SHARENODEMethods {
    getUser: (this: SHARENODEInstance) => Promise<USERInstance>
    user: (this: SHARENODEInstance) => Promise<USERInstance>
    prev: (this: SHARENODEInstance, post: POSTInstance) => Promise<any>
    safeIsRelatedToPost: (this: SHARENODEInstance, post:POSTInstance) => Promise<void>
    isRelatedToPost: (this: SHARENODEInstance, post:POSTInstance) => Promise<boolean>
    backwardPath: (this: SHARENODEInstance, post: POSTInstance) =>Promise<any>
    forwardPath: (this:SHARENODEInstance, post: POSTInstance) => Promise<any>
}   
interface SHARENODEStatics {}

export type SHARENODEInstance = NeogmaInstance<SHARENODEProperties, SHARENODERelatedNodes, SHARENODEMethods>;

export const SHARENODE = ModelFactory<SHARENODEProperties, SHARENODERelatedNodes, SHARENODEStatics, SHARENODEMethods>({
    label: "SHARENODE",
    schema: {
        uuid: { type: 'string', required: false },
        createdAt:{
            type:'any',
            required: false
        },
        updatedAt:{
            type:'any',
            required: false
        },
        anon:{
            type: 'boolean',
            required: true
        }
    },
    primaryKeyField: 'uuid',
    methods: {
        async getUser(this: SHARENODEInstance) {
            const u = await this.findRelationships({ alias: 'USER' });
            return u[0].target;
        }
    },
    statics: {
     
    }
}, neogma);


//POST Model
type POSTProperties = {
    query: string,
    title: string,
    body: string,
    uuid: string,
    createdAt?: string,
    updatedAt?: string
};
interface POSTRelatedNodes {
    SHARENODE: ModelRelatedNodesI<typeof SHARENODE,SHARENODEInstance>
    USER: ModelRelatedNodesI<typeof USER,USERInstance>

}
interface POSTMethods {
    user:(this: POSTInstance)=>Promise<USERInstance>

}
interface POSTStatics {
    findByQuery:(query: string)=>Promise<POSTInstance|null>,

}
export type POSTInstance = NeogmaInstance<POSTProperties, POSTRelatedNodes, POSTMethods >;

export const POST = ModelFactory<POSTProperties,POSTRelatedNodes,POSTStatics, POSTMethods > ({
    label: 'POST',
    schema: {
        uuid: {
            type: 'string',
            required: true
        },
        query: {
            type: 'string',
            minLength: 3,
            required: true
        },
        title: {
            type: 'string',
            minLength: 3,
            required: true
        },
        body: {
            type: 'string',
            minLength: 3,
            required: true
        },
        createdAt:{
            type:'any',
            required: false
        },
        updatedAt:{
            type:'any',
            required: false
        }
    },
    relationships:{},
    primaryKeyField: 'query',
    statics: {
        findByQuery: async function(query:string): Promise<POSTInstance|null>{
            const x = await POST.findOne({where:{query: query}})
            return x
        }
    },
    methods: {}
}, neogma); 

export const USER_SHARENODE_REL = ({
    type: 'OWNS',
    schema: {
        createdAt: {
            type: 'string',
            format: 'date-time',
            default: () => new Date().toISOString()
        }
    },
    properties: {
        source: USER,
        target: SHARENODE,
        direction: 'out'
    }
});

// Add relationships
USER.addRelationships({
    SHARENODE: {
        model: SHARENODE,
        direction: 'in',
        name: 'PARENT_USER'
    },
    POST: {
        model: USER,
        direction: 'in',
        name: 'PARENT_USER'
    }
});

SHARENODE.addRelationships({
    USER: {
        model: USER,
        direction: 'out',
        name: 'PARENT_USER'
    },
    SHARENODE: {
        model: "self",
        direction: 'out',
        name: 'NEXT',
        properties:{
            uuid:{
                property: 'uuid',
                schema:{
                    type:'string',
                    required: false
                }
            },
            post_uuid:{
                property: 'post_uuid',
                schema:{
                    type:'string',
                    required: true
                }
            },
            degree:{
                property: 'degree',
                schema:{
                    type:'any',
                    required: true
                }
            },
            method:{
                property: 'method',
                schema:{
                    type:'string',
                    required: true
                }
            },
            createdAt:{
                property: 'createdAt',
                schema:{
                    type:'string',
                    required: false
                }
            },
            updatedAt:{
                property: 'updatedAt',
                schema:{
                    type:'string',
                    required: false
                }
            }
            
        }
    }
});

POST.addRelationships({
    SHARENODE: {
        model: SHARENODE,
        direction: 'out',
        name: 'NEXT',
        properties:{
            uuid:{
                property: 'uuid',
                schema:{
                    type:'string',
                    required: true
                }
            },
            post_uuid:{
                property: 'post_uuid',
                schema:{
                    type:'string',
                    required: true
                }
            },
            degree:{
                property: 'degree',
                schema:{
                    type:'any',
                    
                    required: true
                }
            },
            createdAt:{
                property: 'createdAt',
                schema:{
                    type:'string',
                    required: false
                }
            },
            updatedAt:{
                property: 'updatedAt',
                schema:{
                    type:'string',
                    required: false
                }
            }, 
            method: {
                property: 'method',
                schema: {
                    type: 'string',
                    required: true
                }
            }
            
        }
    },
    USER: {
        model: USER,
        direction: 'out',
        name: 'PARENT_USER'
    }
})

export interface ModelsInterface{
    USER: NeogmaModel<USERProperties, USERRelatedNodes,  USERMethods, USERStatics>,
    SHARENODE: NeogmaModel<SHARENODEProperties, SHARENODERelatedNodes, SHARENODEMethods, SHARENODEStatics>,
    POST: NeogmaModel<POSTProperties, POSTRelatedNodes, POSTMethods, POSTStatics>
}
