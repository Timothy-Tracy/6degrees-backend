import { NextFunction, Request, Response } from "express";
import { models } from "../../db/neo4j/models/models";
import z from "zod";
import { ProcessNeo4jTimestamp } from "../../../lib/util/ProcessNeo4jTimestamp";
import { PostService } from "../../posts/domain/PostService";
import { QueryBuilder, QueryRunner } from "neogma";
import neogma from "../../db/neo4j/neogma/neogma";
import { Integer } from "neo4j-driver";

export class ExploreMiddleware{
    static getPostFeed = async function(req:Request, res:Response, next:NextFunction){
        let result:any = {}
        /*Get pagination data from query parameters*/

        const size = z.string().optional().transform(Number).parse(req.query.size) || 3
        const skip = z.string().optional().transform(Number).parse(req.query.page) || 0

        /*Get posts with pagination ordered by createdAt*/ 
        result.data = await models.POST.findMany({
            limit: size,
            skip: skip*size ,
            order:[["createdAt", "DESC"]]
        })
        
        /*Format the data into strign friendly values*/ 
        const output = await Promise.all(result.data.map(async (result) => {
            return await PostService.extractData(result)
        }))

        res.result = output
        next();
    }
    static getAllActivity = async function(req:Request, res:Response, next:NextFunction){
    
        /*Get pagination data from query parameters*/
        const size = z.string().optional().transform(Number).parse(req.query.size) || 3
        const skip = z.string().optional().transform(Number).parse(req.query.page) || 0

        /*Get next relationships with pagination ordered by createdAt*/ 
        const qr = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}});
        const qb = new QueryBuilder()
        .raw(`Match(sn:SHARENODE)<-[next:NEXT]-()`)
        .orderBy(['next.createdAt']).raw(' DESC ')
        .skip(skip*size)
        .limit(size)
        .return('next')
        .run(qr)
      
        const result = await qb;
        const output = await Promise.all(result.records.map(async (record) => {
            const r = record.get('next').properties
            /*Format the data into strign friendly values*/ 
            r.createdAt = r.createdAt.toString()
            r.updatedAt = r.updatedAt.toString()
            r.degree = Integer.toString(r.degree)

            /*Find the user and sharenode associated with the NEXT relationship*/ 
            const qb2 = new QueryBuilder()
            .raw(`MATCH (u:USER)<-[:PARENT_USER]-(sn:SHARENODE)<-[next:NEXT {uuid:"${r.uuid}"}]-()`)
            .return('u')
            .run(qr)
            
            /*add the username data to the output object*/
            let sharenodeResult =  await qb2
            let sharenodeRecord = sharenodeResult.records.map((record)=>record.get('u'))
            console.log(sharenodeRecord[0].properties.username)
            r.username = sharenodeRecord[0].properties.username
            r.source_sharenode_username = r.username
            return r
        }))

        res.result = output
        next();
    }
}