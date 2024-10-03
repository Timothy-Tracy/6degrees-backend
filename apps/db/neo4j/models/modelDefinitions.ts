import { ModelFactory, ModelRelatedNodesI, NeogmaInstance, NeogmaModel } from "neogma";
import neogma from './../neogma/neogma';

// USER model
export type USERProperties = {
    email: string,
    username: string,
    uuid: string
};
export interface USERRelatedNodes {
    SHARENODE: ModelRelatedNodesI<any, any>
}
interface USERMethods {
    shareNode: (this: USERInstance) => Promise<SHARENODEInstance>
}
interface USERStatics {}

export type USERInstance = NeogmaInstance<USERProperties, USERRelatedNodes, USERMethods>;

export const USER = ModelFactory<USERProperties, USERRelatedNodes, USERStatics, USERMethods>({
    label: 'USER',
    schema: {
        username: { type: 'string', minLength: 3, required: true },
        email: { type: 'string', minLength: 3, required: true },
        uuid: { type: 'string', required: true }
    },
    primaryKeyField: 'uuid',
    methods: {
        async shareNode(this: USERInstance) {
            console.log('a');
            const shareNode = await this.findRelationships({ alias: "SHARENODE" });
            return shareNode[0].target;
        }
    },
    statics: {},
   
}, neogma);

// SHARENODE model
export type SHARENODEProperties = { uuid: string };
export interface SHARENODERelatedNodes {
    USER: ModelRelatedNodesI<any, any>
    SHARENODE: ModelRelatedNodesI<any, any>
}
interface SHARENODEMethods {
    getUser: (this: SHARENODEInstance) => Promise<USERInstance>
}
interface SHARENODEStatics {}

export type SHARENODEInstance = NeogmaInstance<SHARENODEProperties, SHARENODERelatedNodes, SHARENODEMethods>;

export const SHARENODE = ModelFactory<SHARENODEProperties, SHARENODERelatedNodes, SHARENODEStatics, SHARENODEMethods>({
    label: "SHARENODE",
    schema: {
        uuid: { type: 'string', required: true }
    },
    primaryKeyField: 'uuid',
    methods: {
        async getUser(this: SHARENODEInstance) {
            const u = await this.findRelationships({ alias: 'USER' });
            return u[0].target;
        }
    },
    statics: {}
}, neogma);


//POST Model
type POSTProperties = {
    query: string,
    title: string,
    body: string,
    uuid: string
};
interface POSTRelatedNodes {}
interface POSTMethods {}
interface POSTStatics {}
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
        }
    },
    
    primaryKeyField: 'query',
    statics: {},
    methods: {}
}, neogma); 

// Add relationships
USER.addRelationships({
    SHARENODE: {
        model: SHARENODE,
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
        name: 'edge'
    }
});

POST.addRelationships({
    SHARENODE: {
        model: SHARENODE,
        direction: 'out',
        name: 'edge'
    }
})

export type USERModelType = NeogmaModel<USERProperties, USERRelatedNodes, USERStatics, USERMethods>;
export type SHARENODEModelType = NeogmaModel<SHARENODEProperties, SHARENODERelatedNodes, SHARENODEStatics, SHARENODEMethods>;