import express, { NextFunction } from 'express'
import {AppError, catchAsync} from '../../../../lib/error/customErrors'
import applogger from '../../../../lib/logger/applogger'
import { NodeMiddleware } from '../../domain/NodeMiddleware';
import { AuthMiddleware } from '../../../auth/domain/AuthMiddleware';
import { requireQueryParameter } from '../../../../lib/util/middleware/requireQueryParameters';

const logger = applogger.child({'module':'NodeController'});

export const router = express.Router();
export const apiRoot = '/api/v2/nodes'

router.get('/graph',
    catchAsync(requireQueryParameter(['post_uuid','post_query'])),
    catchAsync(NodeMiddleware.getPostByQuery),
    catchAsync(NodeMiddleware.graph),
    async function(req:any, res:any, next: NextFunction){
        res.status(200).json(res.result);
    }
)
//Get backwards path from a anon SHARENODE to its source POST
router.get('/backwardpath',
    catchAsync(requireQueryParameter(['post_uuid','post_query'])),
    catchAsync(NodeMiddleware.getPostByQuery),
    catchAsync(requireQueryParameter(['source_sharenode_username','source_sharenode_uuid'])),
    catchAsync(NodeMiddleware.getSourceSharenodeByQuery),
    catchAsync(NodeMiddleware.backwardPath),
    async function(req:any, res:any, next: NextFunction){
        res.status(200).json(res.result);
    }
)

//Get forwards path from a anon SHARENODE to other SHARENODES
router.get('/forwardpath',
    catchAsync(requireQueryParameter(['post_uuid','post_query'])),
    catchAsync(NodeMiddleware.getPostByQuery),
    catchAsync(requireQueryParameter(['source_sharenode_username','source_sharenode_uuid'])),
    catchAsync(NodeMiddleware.getSourceSharenodeByQuery),
    catchAsync(NodeMiddleware.forwardPath),
    async function(req:any, res:any, next: NextFunction){
        res.status(200).json(res.result);
    }
)

//Interact with anon SHARENODE with auth
// router.get('/interact',
//     catchAsync(NodeMiddleware.requireQueryParameter(['post_uuid','post_query'])),
//     catchAsync(NodeMiddleware.getPostByQuery),
//     catchAsync(NodeMiddleware.requireQueryParameter(['source_sharenode_username','source_sharenode_uuid'])),
//     catchAsync(NodeMiddleware.getSourceSharenodeByQuery),
//     catchAsync(NodeMiddleware.getTargetSharenodeByQuery),
//     catchAsync(NodeMiddleware.interact),
//     async function(req:any, res:any, next: NextFunction){
//     //     res.header('Access-Control-Allow-Credentials', true);
//     //     res.cookie('target_sharenode_uuid', res.locals.target_sharenode.uuid, { 
//     //     httpOnly: true,
//     //     secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
//     //     maxAge: 3600000 // 1 hour in milliseconds
//     //   });
//         res.status(200).json(res.result);
//     }
// )
router.get('/interact',
    catchAsync(AuthMiddleware.requireAuthSession),
    catchAsync(requireQueryParameter(['post_uuid','post_query'])),
    catchAsync(NodeMiddleware.getPostByQuery),
    catchAsync(requireQueryParameter(['source_sharenode_username','source_sharenode_uuid'])),
    catchAsync(NodeMiddleware.getSourceSharenodeByQuery),
    catchAsync(NodeMiddleware.initialize_target_sharenode),
    catchAsync(NodeMiddleware.interact),
    async function(req:any, res:any, next: NextFunction){
    //     res.header('Access-Control-Allow-Credentials', true);
    //     res.cookie('target_sharenode_uuid', res.locals.target_sharenode.uuid, { 
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    //     maxAge: 3600000 // 1 hour in milliseconds
    //   });
        res.status(200).json(res.result);
    }
)
// //Interact with anon SHARENODE no auth
// router.get('/interactUnauthorized',
//     catchAsync(NodeMiddleware.getPostByQuery),
//     catchAsync(NodeMiddleware.getSourceSharenodeByQuery),
//     catchAsync(NodeMiddleware.interactUnauthorized),
//     async function(req:any, res:any, next: NextFunction){
//         logger.error(req)
//         res.status(200).json(res.result);
//     }
// )
export default {router,apiRoot}