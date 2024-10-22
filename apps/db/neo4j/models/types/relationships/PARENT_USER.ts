import { RelationshipPropertiesI } from "neogma";
import z from "zod";
import { Neo4jDateTimeSchema, uuidSchema } from "../../../../../../types/Globals";

export const PARENT_USERPropertiesSchema = z.object({
    uuid: uuidSchema,
    createdAt: Neo4jDateTimeSchema.optional(),
    updatedAt: Neo4jDateTimeSchema.optional(),


})
export type PARENT_USERProperties = z.infer<typeof PARENT_USERPropertiesSchema>