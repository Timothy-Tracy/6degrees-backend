import { RelationshipPropertiesI } from "neogma";
import z, { number } from "zod";
import { Neo4jDateTimeSchema, uuidSchema } from "../../../../../../types/Globals";
import { Integer } from "neo4j-driver";

export const degreeSchema = z.number()
export const methodSchema = z.enum(['default']).default('default')

export const NEXTPropertiesSchema = z.object({
    uuid: uuidSchema.optional(),
    post_uuid: uuidSchema,
    createdAt: Neo4jDateTimeSchema.optional(),
    updatedAt: Neo4jDateTimeSchema.optional(),
    method: methodSchema,
    degree: degreeSchema


})


export type NEXTProperties = z.infer<typeof NEXTPropertiesSchema>