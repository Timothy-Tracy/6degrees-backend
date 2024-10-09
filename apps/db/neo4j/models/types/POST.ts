import z from "zod";
import { Neo4jDateTime, uuid } from "../../../../../types/Globals";

export type POSTProperties = {
    query: string,
    title: string,
    body: string,
    uuid: uuid,
    createdAt?: Neo4jDateTime,
    updatedAt?: Neo4jDateTime
}
