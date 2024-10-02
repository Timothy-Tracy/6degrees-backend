import {Query} from 'neo4j-driver-core/types/types'
import { Parameters } from 'neo4j-driver/types/query-runner';
export class CypherBuilder{
    query: Query
    parameters:Parameters
    paramCount: number
    
    constructor(){
        this.query = ''
        this.parameters={}
        this.paramCount = 0
    }
    append(cypher:string, parameters?: Parameters): CypherBuilder{
        this.query+=cypher
        if(parameters){
            const newParamStr = `param${this.paramCount}`
            this.paramCount += 1
            this.parameters[newParamStr] = parameters
        }
        return this
    }
    match():CypherBuilder{
        this.query += ' MATCH '
        return this
    }
    create():CypherBuilder{
        this.query += ' CREATE '
        return this
    }
    optional():CypherBuilder{
        this.query += ' OPTIONAL '
        return this
    }
    node(variableName:string, labels?:Array<string>, parameters?:Parameters): CypherBuilder{
        this.query+=`(${variableName}${labels ? `:${labels?.join(':')}`:''} ${parameters? `$${`${variableName}_parameters`}`:''})`
        if(parameters){
            const newParamStr = `param${this.paramCount}`
            this.paramCount += 1
            this.parameters[newParamStr] = parameters
        }
        return this
    }
    
    relationshipBox(variableName:string, label?:string, parameters?:Parameters): CypherBuilder{
        this.query+=`[${variableName}${label ? `:${label}`:''} ${parameters? `$${`${variableName}_parameters`}`:''}]`
        if(parameters){
            const newParamStr = `param${this.paramCount}`
            this.paramCount += 1
            this.parameters[newParamStr] = parameters
        }
        return this
    }
    relationship(variableName:string, label?:string, parameters?:Parameters): CypherBuilder{
        this.query+='-'
        this.relationshipBox(variableName, label, parameters)
        this.query+='-'
        return this

    }
    leftRelationship(variableName:string, label?:string, parameters?:Parameters): CypherBuilder{
        this.query+='<-'
        this.relationshipBox(variableName, label, parameters)
        this.query+='-'
        return this

    }
    rightRelationship(variableName:string, label?:string, parameters?:Parameters): CypherBuilder{
        this.query+='-'
        this.relationshipBox(variableName, label, parameters)
        this.query+='->'
        return this

    }
    emptyNode(): CypherBuilder{
        this.query+='()'
        return this
    }
    matchByElementId(variableName: string, elementId: string ) : CypherBuilder{
        this.query+= ` MATCH (${variableName}) WHERE elementId(${variableName}) = '${elementId} '
            `
            return this
    }
    detach():CypherBuilder{
        this.query += ' DETACH '
        return this
    }
    delete(variables:Array<string>): CypherBuilder{
        this.query += ` DELETE ${variables.join(', ')}`
        return this
    }
    terminate():CypherBuilder{
        this.query+=';'
        return this
    }
    return(variables:Array<string>):CypherBuilder{
        this.query +=` RETURN ${variables.join(', ')}`
        return this
    }

    orderBy(variableName:string, someProperty:string):CypherBuilder{
        this.query+=` ORDER BY ${variableName}.${someProperty} `
        return this
    }
    skip(offset:number):CypherBuilder{
        this.query+=` SKIP  ${offset}`
        return this
    }
    limit(resultCount:number):CypherBuilder{
        this.query+=` LIMIT  ${resultCount}`
        return this
    }
    descending():CypherBuilder{
        this.query+= ' DESC '
        return this
    }
    ascending():CypherBuilder{
        this.query+= ' ASC '
        return this
    }
}