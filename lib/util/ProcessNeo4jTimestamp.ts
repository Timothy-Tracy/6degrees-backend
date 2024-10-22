import { DateTime } from "neo4j-driver";

export function ProcessNeo4jTimestamp(timestamp:DateTime){
    return timestamp.toString()
}