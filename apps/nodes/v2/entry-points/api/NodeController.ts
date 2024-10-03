import express, { NextFunction } from 'express'
import {AppError, catchAsync} from '../../../../../lib/error/customErrors'
import applogger from '../../../../../lib/logger/applogger'
import { NodeMiddleware } from '../../domain/NodeMiddleware';


export const router = express.Router();
export const apiRoot = '/api/v2/nodes'

router.get('/:query/:username/backwardpath',
    catchAsync(NodeMiddleware.getPostByQuery),
    catchAsync(NodeMiddleware.getShareNodeByUsername),
    catchAsync(NodeMiddleware.backwardPath),
    async function(req:any, res:any, next: NextFunction){
        res.status(200).json(res.result);
    }
)
router.get('/:query/:username/forwardpath',
    catchAsync(NodeMiddleware.getPostByQuery),
    catchAsync(NodeMiddleware.getShareNodeByUsername),
    catchAsync(NodeMiddleware.forwardPath),
    async function(req:any, res:any, next: NextFunction){
        res.status(200).json(res.result);
    }
)
