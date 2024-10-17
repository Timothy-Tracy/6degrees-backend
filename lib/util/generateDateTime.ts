import { DateTime, integer, Integer } from "neo4j-driver"
import { toNeo4jDateTime } from "../../types/Globals"
export function generateDateTime():DateTime{
    const {year, month,day,hour,minute,second,nanosecond,timeZoneOffsetSeconds} =DateTime.fromStandardDate(new Date())
    return new DateTime(Integer.fromNumber(integer.toNumber(year)), Integer.fromNumber(integer.toNumber(month)),Integer.fromNumber(integer.toNumber(day)),Integer.fromNumber(integer.toNumber(hour)),Integer.fromNumber(integer.toNumber(minute)),Integer.fromNumber(integer.toNumber(second)),Integer.fromNumber(integer.toNumber(nanosecond)),Integer.fromNumber(integer.toNumber(0)))

}
export default generateDateTime()