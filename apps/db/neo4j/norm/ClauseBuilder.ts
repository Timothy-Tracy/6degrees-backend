import {Query} from 'neo4j-driver-core/types/types'
import { Parameters } from 'neo4j-driver/types/query-runner';
export class ClauseBuilder{
    query: Query
    parameters:Parameters
    paramCount: number
    
    constructor(){
        this.query = ''
        this.parameters={}
        this.paramCount = 0
    }
    append(cypher:string, parameters?: Parameters): ClauseBuilder{
        this.query+=cypher
        if(parameters){
            const newParamStr = `param${this.paramCount}`
            this.paramCount += 1
            this.parameters[newParamStr] = parameters
        }
        return this
    }
    match():ClauseBuilder{
        this.query += ' MATCH '
        return this
    }
    create():ClauseBuilder{
        this.query += ' CREATE '
        return this
    }
    optional():ClauseBuilder{
        this.query += ' OPTIONAL '
        return this
    }
    node(variableName:string, label?:string, parameters?:Parameters): ClauseBuilder{
        this.query+=`(${variableName}${label ? `:${label}`:''} ${parameters? `$${`${variableName}_parameters`}`:''})`
        if(parameters){
            const newParamStr = `param${this.paramCount}`
            this.paramCount += 1
            this.parameters[newParamStr] = parameters
        }
        return this
    }
    
    relationshipBox(variableName:string, label?:string, parameters?:Parameters): ClauseBuilder{
        this.query+=`[${variableName}${label ? `:${label}`:''} ${parameters? `$${`${variableName}_parameters`}`:''}]`
        if(parameters){
            const newParamStr = `param${this.paramCount}`
            this.paramCount += 1
            this.parameters[newParamStr] = parameters
        }
        return this
    }
    relationship(variableName:string, label?:string, parameters?:Parameters): ClauseBuilder{
        this.query+='-'
        this.relationshipBox(variableName, label, parameters)
        this.query+='-'
        return this

    }
    leftRelationship(variableName:string, label?:string, parameters?:Parameters): ClauseBuilder{
        this.query+='<-'
        this.relationshipBox(variableName, label, parameters)
        this.query+='-'
        return this

    }
    rightRelationship(variableName:string, label?:string, parameters?:Parameters): ClauseBuilder{
        this.query+='-'
        this.relationshipBox(variableName, label, parameters)
        this.query+='->'
        return this

    }
    emptyNode(): ClauseBuilder{
        this.query+='()'
        return this
    }
    matchByElementId(variableName: string, elementId: string ) : ClauseBuilder{
        this.query+= ` MATCH (${variableName}) WHERE elementId(${variableName}) = '${elementId} '
            `
            return this
    }
    detach():ClauseBuilder{
        this.query += ' DETACH '
        return this
    }
    delete(variables:Array<string>): ClauseBuilder{
        this.query += ` DELETE ${variables.join(', ')}`
        return this
    }
    terminate():ClauseBuilder{
        this.query+=';'
        return this
    }
    return(variables:Array<string>):ClauseBuilder{
        this.query +=` RETURN ${variables.join(', ')}`
        return this
    }

    orderBy(variableName:string, someProperty:string):ClauseBuilder{
        this.query+=` ORDER BY ${variableName}.${someProperty} `
        return this
    }
    skip(offset:number):ClauseBuilder{
        this.query+=` SKIP  ${offset}`
        return this
    }
    limit(resultCount:number):ClauseBuilder{
        this.query+=` LIMIT  ${resultCount}`
        return this
    }
    descending():ClauseBuilder{
        this.query+= ' DESC '
        return this
    }
    ascending():ClauseBuilder{
        this.query+= ' ASC '
        return this
    }
}