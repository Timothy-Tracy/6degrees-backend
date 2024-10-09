import { DateTime, integer, Integer, isDateTime } from "neo4j-driver";
import z from "zod";

export type uuid = z.infer<typeof uuidSchema>
export const uuidSchema = z.string().uuid()

export type Neo4jDateTime = DateTime
export const Neo4jDateTimeSchema = z.custom<Neo4jDateTime>((val)=> isDateTime(val))
export function toNeo4jDateTime(obj:any):DateTime|undefined{
    const {year, month,day,hour,minute,second,nanosecond,timeZoneOffsetSeconds} =obj
    let x = undefined
    try{
        x = new DateTime(Integer.fromNumber(integer.toNumber(year)), Integer.fromNumber(integer.toNumber(month)),Integer.fromNumber(integer.toNumber(day)),Integer.fromNumber(integer.toNumber(hour)),Integer.fromNumber(integer.toNumber(minute)),Integer.fromNumber(integer.toNumber(second)),Integer.fromNumber(integer.toNumber(nanosecond)),Integer.fromNumber(integer.toNumber(timeZoneOffsetSeconds)))
    }catch(err){}
    return x
}
export function translateDateTime(time:any):DateTime|undefined{
    let result = undefined
    if (time){
        result = toNeo4jDateTime(time)
    }
    return result
}
