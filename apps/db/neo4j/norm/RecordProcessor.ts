import { QueryResult, RecordShape, Node} from "neo4j-driver";
import {Record} from 'neo4j-driver-core/types'

export class RecordProcessor{
    record:Record
    keys: Array<PropertyKey>
    excludedKeys: Array<PropertyKey>
    constructor(record: Record){
        
        this.record = record
        this.keys = this.record.keys
        this.excludedKeys = []
    }
    excludeKeys(keys:Array<PropertyKey>){
        keys.forEach((key)=>{
            this.excludedKeys.push(key)
        })

    }
    get(key:PropertyKey){
        return this.record.get(key)
    }
    toObject():object{
        return this.record.toObject()
    }
    toNode(key:PropertyKey): Node{
        return this.record.get(key)
    }
    


}