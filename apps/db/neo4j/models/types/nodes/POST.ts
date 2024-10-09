import z from "zod";
import { Neo4jDateTime, Neo4jDateTimeSchema, uuid, uuidSchema } from "../../../../../../types/Globals";
import { ModelRelatedNodesI, NeogmaInstance, NeogmaModel } from "neogma";
import { SHARENODEInstance } from "./SHARENODE";
import { USERInstance } from "./USER";
import { NEXTProperties } from "../relationships/NEXT";
import { PARENT_USERProperties } from "../relationships/PARENT_USER";

export const POSTPropertiesSchema = z.object({
    query: z.string(),
    title: z.string(),
    body : z.string(),
    uuid: uuidSchema,
    createdAt: Neo4jDateTimeSchema.optional(),
    updatedAt: Neo4jDateTimeSchema.optional(),


})
export type POSTProperties = z.infer<typeof POSTPropertiesSchema>

export interface POSTRelatedNodes {
    SHARENODE: ModelRelatedNodesI<any,SHARENODEInstance, NEXTProperties,NEXTProperties>
    USER: ModelRelatedNodesI<any,USERInstance, PARENT_USERProperties,PARENT_USERProperties>

}
export interface POSTMethods {
    user:(this: POSTInstance)=>Promise<USERInstance>
    sourceSharenode:((this: POSTInstance)=>Promise<SHARENODEInstance>)

}
export interface POSTStatics {
    findByQuery:(query: string)=>Promise<POSTInstance|null>,

}
export type POSTInstance = NeogmaInstance<POSTProperties, POSTRelatedNodes, POSTMethods >;
export type POSTModel= NeogmaModel<POSTProperties, POSTRelatedNodes, POSTMethods, POSTStatics>
