import express, { NextFunction } from 'express'
import {AppError, catchAsync} from '../../../../lib/error/customErrors'
import applogger from '../../../../lib/logger/applogger'
import {  PostMiddleware } from '../../domain/PostMiddleware';
import { AuthMiddleware } from '../../../auth/domain/AuthMiddleware';
import { NewPostSchema, UpdatePostSchema } from '../../../validation/PostSchema';
import { requireQueryParameter } from '../../../../lib/util/middleware/requireQueryParameters';
const logger = applogger.child({'module':'NodeController'});
export const router = express.Router();
export const apiRoot = '/api/v2/posts'


//Create 
router.get('/', 
    catchAsync(requireQueryParameter(['post_uuid', 'post_query'])),
    catchAsync(PostMiddleware.fetchPost),
    function (req:any, res:any) {
    res.status(200).json(res.result)
});
//Create 
router.post('/', 
    catchAsync(AuthMiddleware.requireAuthSession),
    catchAsync(PostMiddleware.validateInput(NewPostSchema)),
    catchAsync(PostMiddleware.createPost),
    function (req:any, res:any) {
    res.status(200).json(res.result)
});

//Update 
router.put('/', 
    catchAsync(AuthMiddleware.requireAuthSession),
    catchAsync(requireQueryParameter(['post_uuid'])),
    catchAsync(PostMiddleware.validateInput(UpdatePostSchema)),
    catchAsync(PostMiddleware.updatePost),
    function (req:any, res:any) {
    res.status(200).json(res.result)
});

//Delete
router.delete('/', 
    catchAsync(AuthMiddleware.requireAuthSession),
    catchAsync(requireQueryParameter(['post_uuid'])),
    catchAsync(PostMiddleware.deletePost),
    function (req:any, res:any) {
    res.status(200).json(res.result)
});

//Create noauth
router.post('/noauth', 
    catchAsync(requireQueryParameter(['username'])),
    catchAsync(PostMiddleware.validateInput(NewPostSchema)),
    catchAsync(PostMiddleware.createPost),
    function (req:any, res:any) {
    res.status(200).json(res.result)
});

//Update noauth
router.put('/noauth', 
    catchAsync(requireQueryParameter(['post_uuid'])),
    catchAsync(requireQueryParameter(['username'])),
    catchAsync(PostMiddleware.validateInput(UpdatePostSchema)),
    catchAsync(PostMiddleware.updatePost),
    function (req:any, res:any) {
    res.status(200).json(res.result)
});

//Delete noauth
router.delete('/noauth', 
    catchAsync(requireQueryParameter(['post_uuid'])),
    catchAsync(requireQueryParameter(['username'])),
    catchAsync(PostMiddleware.deletePost),
    function (req:any, res:any) {
    res.status(200).json(res.result)
});

export default {router,apiRoot}