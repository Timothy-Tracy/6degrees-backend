//models.ts
import { NeogmaModel, QueryBuilder, QueryRunner } from 'neogma';
import { USER, SHARENODE, POST, ModelsInterface, POSTInstance, SHARENODEInstance, USERInstance } from './modelDefinitions';
import neogma from '../neogma/neogma';
import { AppError } from '../../../../lib/error/customErrors';
import applogger from '../../../../lib/logger/applogger';
const { v7: uuidv7 } = require('uuid');

const logger = applogger.child({'module':'models'});


export const models:ModelsInterface = {
    USER,
    SHARENODE,
    POST
  };
  models.SHARENODE.prototype.user = async function(this:SHARENODEInstance){
      const log = logger.child({'function': 'models.SHARENODE.prototype.user'});
      log.trace('');
      const result = await this.findRelationships({alias:'USER'}) 
      if(!result[0].target){throw new AppError('ShareNodeError: Cannot find user', 500)}   
    return result[0].target;
  }
  models.SHARENODE.prototype.isRelatedToPost = async function(this:SHARENODEInstance, post:POSTInstance){
    const log = logger.child({'function': 'models.SHARENODE.prototype.isRelatedToPost'});
      log.trace('');
    const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
        const result = await new QueryBuilder()
        .raw(`MATCH ()-[n:NEXT* {post_uuid: "${post.uuid}"}]->(sn:SHARENODE {uuid: "${this.uuid}"}) `)
        .return('n')
        .run(queryRunner)

        log.error(result.records[0] ? true: false)
        return result.records[0] ? true: false;
  }
  models.SHARENODE.prototype.safeIsRelatedToPost = async function(this:SHARENODEInstance, post:POSTInstance){
    const log = logger.child({'function': 'models.SHARENODE.prototype.safeIsRelatedToPost'});
    log.trace('');
    if(! await this.isRelatedToPost(post)){throw new AppError(`ShareNodeError: ShareNode is not related to post ${post.query} ${post.uuid}`, 500)}
  }
  models.SHARENODE.prototype.backwardPath = async function(this:SHARENODEInstance, post:POSTInstance){
    const log = logger.child({'function': 'models.SHARENODE.prototype.backwardPath'});
    log.trace('');
    this.safeIsRelatedToPost(post)    
    const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
    const result = await new QueryBuilder()
    .match({identifier: 'sn', where: {uuid: this.uuid}})
    .raw(`OPTIONAL MATCH path = (:POST)-[:NEXT* {post_uuid: "${post.uuid}"}]->(sn) WITH collect(path) as path`)
    .return('path')
    .run(queryRunner)
    console.log(result.records[0].get('path'))
    return result.records[0].get('path');
}

models.SHARENODE.prototype.forwardPath = async function(this:SHARENODEInstance, post:POSTInstance){
  const log = logger.child({'function': 'models.SHARENODE.prototype.forwardPath'});
  log.trace('');
  this.safeIsRelatedToPost(post)
  const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
  const result = await new QueryBuilder()
  .match({identifier: 'sn', where: {uuid: this.uuid}})
  .raw(`MATCH path = (sn)-[:NEXT* {post_uuid: "${post.uuid}"}]->(:SHARENODE) WITH collect(path) as path`)
  .return('path')
  .run(queryRunner)
  return result.records[0].get('path');
}

models.SHARENODE.prototype.prev = async function(this:SHARENODEInstance, post:POSTInstance){
  const log = logger.child({'function': 'models.SHARENODE.prototype.prev'});
  log.trace('');
  const queryRunner = new QueryRunner({driver:neogma.driver, logger:console.log, sessionParams: {database: 'neo4j'}})
        const result = await new QueryBuilder()
        .raw(`MATCH ()-[next:NEXT {post_uuid: "${post.uuid}"}]->(node:SHARENODE {uuid: "${this.uuid}"})`)
        .return('next')
        .run(queryRunner)
  return result.records[0].get('next').properties
}

models.USER.prototype.createSharenode = async function(this: USERInstance){
  const alreadyHasSharenode = await this.shareNode()
  if(alreadyHasSharenode != null){
      throw new AppError('User already has sharenode', 500)
  } else {
      const result = await models.SHARENODE.createOne({
        uuid:uuidv7(),
        anon:false
      })
      await result.relateTo({alias:'USER',
        where:{
          uuid:this.uuid
        }
      })
      
  }
}