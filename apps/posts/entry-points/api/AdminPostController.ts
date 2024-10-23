import express, { NextFunction } from 'express'
import {AppError, catchAsync} from '../../../../lib/error/customErrors'
import applogger from '../../../../lib/logger/applogger'
import {  PostMiddleware } from '../../domain/PostMiddleware';
import { AuthMiddleware } from '../../../auth/domain/AuthMiddleware';
import { NewPostSchema, UpdatePostSchema } from '../../../validation/PostSchema';
import { requireQueryParameter } from '../../../../lib/util/middleware/requireQueryParameters';
export const router = express.Router();
export const apiRoot = '/api/v2/admin/posts'
const logger = applogger.child({'module':'AdminPostController', 'route':apiRoot});


//Update 


//Admin Update Post 
router.put('/', 
    catchAsync(AuthMiddleware.requireAuthSession),
    catchAsync(AuthMiddleware.initUserObject),
    catchAsync(AuthMiddleware.requireAdmin),
    catchAsync(requireQueryParameter(['post_uuid', 'post_query'])),
    catchAsync(PostMiddleware.initPostObject),
    catchAsync(PostMiddleware.validateInput(UpdatePostSchema)),
    catchAsync(PostMiddleware.adminUpdatePost),
    function (req:any, res:any) {
    res.status(200).json(res.result)
});

//Admin Delete Post 
router.get('/delete', 
    catchAsync(AuthMiddleware.requireAuthSession),
    catchAsync(AuthMiddleware.initUserObject),
    catchAsync(AuthMiddleware.requireAdmin),
    catchAsync(requireQueryParameter(['post_uuid', 'post_query'])),
    catchAsync(PostMiddleware.initPostObject),
    catchAsync(PostMiddleware.adminDeletePost),
    function (req:any, res:any) {
    res.status(200).json(res.result)
});

export default {router,apiRoot}