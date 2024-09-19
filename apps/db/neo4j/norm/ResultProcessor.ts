import { QueryResult, Record , ResultSummary} from "neo4j-driver";
import {Stats} from 'neo4j-driver-core/types'
import { RecordProcessor } from "./RecordProcessor";
import { AppError } from "../../../../lib/error/customErrors";

export class ResultProcessor{
    records: Array<RecordProcessor>
    summary: ResultSummary
    count: number
    stats: Stats
    containsUpdates: boolean
    constructor(result: QueryResult){
        this.records = result.records.map((record)=> new RecordProcessor(record))
        this.summary = result.summary
        this.count = this.records.length
        this.containsUpdates = this.summary.counters.containsUpdates()
        this.stats = this.summary.counters.updates()
    }
    isEmpty():boolean{
        if(this.count === 0){
            return true
        } else {
            return false
        }
    }
    isNotEmpty():boolean{
        return !this.isEmpty()
    }
    first():RecordProcessor{
        if(this.isEmpty()){
            throw new AppError('Records are empty', 500)
        }
        return this.records[0]
    }
    


}