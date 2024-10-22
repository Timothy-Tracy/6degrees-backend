import { ModelFactory} from "neogma";
import neogma from './../neogma/neogma';
import { POSTMethods, POSTProperties, POSTRelatedNodes, POSTStatics } from "./types/nodes/POST";
import { USERMethods, USERProperties, USERRelatedNodes, USERStatics, USERInstance } from "./types/nodes/USER";
import { SHARENODEProperties, SHARENODERelatedNodes, SHARENODEInstance, SHARENODEStatics, SHARENODEMethods } from "./types/nodes/SHARENODE";

// USER model
export const USER = ModelFactory<USERProperties, USERRelatedNodes, USERStatics, USERMethods>({
    label: 'USER',
    schema: {
        username: {},
        email: {},
        uuid: {},
        createdAt:{},
        updatedAt:{}
    },
    primaryKeyField: 'uuid',
}, neogma);

// SHARENODE model
export const SHARENODE = ModelFactory<SHARENODEProperties, SHARENODERelatedNodes, SHARENODEStatics, SHARENODEMethods>({
    label: "SHARENODE",
    schema: {uuid:{},createdAt:{},username:{}, updatedAt:{},anon:{}},
    primaryKeyField: 'uuid',
}, neogma);

//POST Model
export const POST = ModelFactory<POSTProperties,POSTRelatedNodes,POSTStatics, POSTMethods > ({
    label: 'POST',
    schema: {
        uuid: {},
        query: {},
        title: {},
        body: {},
        createdAt:{},
        updatedAt:{ }
    },
    primaryKeyField: 'query',
}, neogma); 