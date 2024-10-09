import { DateTime } from "neo4j-driver";
import z from "zod";

export type uuid = z.infer<typeof uuidSchema>
export const uuidSchema = z.string().uuid()

export type Neo4jDateTime = DateTime
