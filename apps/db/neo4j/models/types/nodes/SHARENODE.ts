import z from "zod";
import { Neo4jDateTime, Neo4jDateTimeSchema, uuid, uuidSchema } from "../../../../../../types/Globals";
import { ModelRelatedNodesI, NeogmaInstance, NeogmaModel } from "neogma";
import { USERInstance } from "./USER";
import { PARENT_USERProperties } from "../relationships/PARENT_USER";
import { NEXTProperties } from "../relationships/NEXT";
import { POSTInstance } from "./POST";

export const SHARENODEPropertiesSchema = z.object({
    uuid: uuidSchema,
    anon: z.boolean(),
    createdAt: Neo4jDateTimeSchema.optional(),
    updatedAt: Neo4jDateTimeSchema.optional(),


})
export type SHARENODEProperties = z.infer<typeof SHARENODEPropertiesSchema>


export interface SHARENODERelatedNodes {
    USER: ModelRelatedNodesI<any, USERInstance, PARENT_USERProperties,PARENT_USERProperties>
    SHARENODE: ModelRelatedNodesI<any, SHARENODEInstance, NEXTProperties,NEXTProperties>
}
export interface SHARENODEMethods {
    user: (this: SHARENODEInstance) => Promise<USERInstance>
    prev: (this: SHARENODEInstance, post: POSTInstance) => Promise<any>
    safeIsRelatedToPost: (this: SHARENODEInstance, post:POSTInstance) => Promise<void>
    isRelatedToPost: (this: SHARENODEInstance, post:POSTInstance) => Promise<boolean>
    backwardPath: (this: SHARENODEInstance, post: POSTInstance) =>Promise<any>
    forwardPath: (this:SHARENODEInstance, post: POSTInstance) => Promise<any>
}   
export interface SHARENODEStatics {}

export type SHARENODEInstance = NeogmaInstance<SHARENODEProperties, SHARENODERelatedNodes, SHARENODEMethods>;
export type SHARENODEModel =  NeogmaModel<SHARENODEProperties, SHARENODERelatedNodes, SHARENODEMethods, SHARENODEStatics>