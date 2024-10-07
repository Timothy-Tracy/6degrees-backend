import express, { NextFunction } from 'express'
import {AppError, catchAsync} from '../../../../../lib/error/customErrors'
import applogger from '../../../../../lib/logger/applogger'
import {  PostMiddleware } from '../../domain/PostMiddleware';
import { AuthMiddleware } from '../../../../auth/v2/domain/AuthMiddleware';
import { NodeMiddleware } from '../../../../nodes/v2/domain/NodeMiddleware';
import { NewPostSchema, UpdatePostSchema } from '../../../../validation/PostSchema';
const logger = applogger.child({'module':'NodeController'});
export const router = express.Router();
export const apiRoot = '/api/v2/posts'

//Create
router.post('/', 
    catchAsync(PostMiddleware.validateInput(NewPostSchema)),
    catchAsync(PostMiddleware.createPost),
    function (req:any, res:any) {
    res.status(200).json(res.result)
});

//Update
router.put('/', 
    catchAsync(NodeMiddleware.requireQueryParameter(['post_uuid'])),
    catchAsync(NodeMiddleware.requireQueryParameter(['username'])),
    catchAsync(PostMiddleware.validateInput(UpdatePostSchema)),
    catchAsync(PostMiddleware.updatePost),
    function (req:any, res:any) {
    res.status(200).json(res.result)
});

//Delete
router.delete('/', 
    catchAsync(NodeMiddleware.requireQueryParameter(['post_uuid'])),
    catchAsync(NodeMiddleware.requireQueryParameter(['username'])),
    catchAsync(PostMiddleware.deletePost),
    function (req:any, res:any) {
    res.status(200).json(res.result)
});

export default {router,apiRoot}