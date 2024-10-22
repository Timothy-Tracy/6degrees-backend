import { toNeo4jDateTime } from "../../../../types/Globals";
import { models } from "./models";
const dt = {
    "year": {
        "low": 2024,
        "high": 0
    },
    "month": {
        "low": 10,
        "high": 0
    },
    "day": {
        "low": 7,
        "high": 0
    },
    "hour": {
        "low": 4,
        "high": 0
    },
    "minute": {
        "low": 53,
        "high": 0
    },
    "second": {
        "low": 58,
        "high": 0
    },
    "nanosecond": {
        "low": 416000000,
        "high": 0
    },
    "timeZoneOffsetSeconds": {
        "low": 0,
        "high": 0
    }
}
export async  function test(){
    const x = await models.POST.createOne({
        uuid: '1',
        query:'0',
        title: '0',
        body:'0',
        createdAt:toNeo4jDateTime(dt),
    })
    console.log(x)
}
test()