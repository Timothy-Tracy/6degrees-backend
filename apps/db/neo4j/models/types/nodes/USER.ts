import z from "zod";
import { Neo4jDateTime, Neo4jDateTimeSchema, uuid, uuidSchema } from "../../../../../../types/Globals";
import { ModelRelatedNodesI, NeogmaInstance, NeogmaModel } from "neogma";
import { PARENT_USERProperties } from "../relationships/PARENT_USER";
import { SHARENODEInstance } from "./SHARENODE";


export const USERPropertiesSchema = z.object({
    username: z.string(),
    email: z.string().email(),
    uuid: uuidSchema,
    createdAt: Neo4jDateTimeSchema.optional(),
    updatedAt: Neo4jDateTimeSchema.optional(),
    role:z.enum(['USER', 'ADMIN']).default('USER')


})
export type USERProperties = z.infer<typeof USERPropertiesSchema>

export interface USERRelatedNodes {
    SHARENODE: ModelRelatedNodesI<any,any, PARENT_USERProperties, PARENT_USERProperties>
    POST: ModelRelatedNodesI<any, any, PARENT_USERProperties, PARENT_USERProperties>
}

export interface USERMethods {
    shareNode: (this: USERInstance) => Promise<SHARENODEInstance>,
    createSharenode:(this: USERInstance) => Promise<void>
}
export interface USERStatics {
    getShareNodeByUsername: (username: string) => Promise<SHARENODEInstance>,
    getUserByUsername: (username: string) =>Promise<USERInstance>
}

export type USERInstance = NeogmaInstance<USERProperties, USERRelatedNodes, USERMethods>;

export type USERModel= NeogmaModel<USERProperties, USERRelatedNodes,  USERMethods, USERStatics>