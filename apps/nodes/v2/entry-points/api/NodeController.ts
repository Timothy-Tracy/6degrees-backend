import express, { NextFunction } from 'express'
import {AppError, catchAsync} from '../../../../../lib/error/customErrors'
import applogger from '../../../../../lib/logger/applogger'
import { NodeMiddleware } from '../../domain/NodeMiddleware';

const logger = applogger.child({'module':'NodeController'});



export const router = express.Router();
export const apiRoot = '/api/v2/nodes'


//Get backwards path from a anon SHARENODE to its source POST
router.get('/backwardpath',
    catchAsync(NodeMiddleware.getPostByQuery),
    catchAsync(NodeMiddleware.getSourceSharenodeByQuery),
    catchAsync(NodeMiddleware.backwardPath),
    async function(req:any, res:any, next: NextFunction){
        res.status(200).json(res.result);
    }
)

//Get forwards path from a anon SHARENODE to other SHARENODES
router.get('/forwardpath',
    catchAsync(NodeMiddleware.getPostByQuery),
    catchAsync(NodeMiddleware.getSourceSharenodeByQuery),
    catchAsync(NodeMiddleware.forwardPath),
    async function(req:any, res:any, next: NextFunction){
        res.status(200).json(res.result);
    }
)

//Interact with anon SHARENODE with auth
router.get('/interact',
    catchAsync(NodeMiddleware.getPostByQuery),
    catchAsync(NodeMiddleware.getSourceSharenodeByQuery),
    catchAsync(NodeMiddleware.getTargetSharenodeByQuery),
    catchAsync(NodeMiddleware.interact),
    async function(req:any, res:any, next: NextFunction){
        res.status(200).json(res.result);
    }
)
//Interact with anon SHARENODE no auth
router.get('/interactUnauthorized',
    catchAsync(NodeMiddleware.getPostByQuery),
    catchAsync(NodeMiddleware.getSourceSharenodeByQuery),
    catchAsync(NodeMiddleware.interactUnauthorized),
    async function(req:any, res:any, next: NextFunction){
        logger.error(req)
        res.status(200).json(res.result);
    }
)
