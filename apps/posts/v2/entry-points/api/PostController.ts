import express, { NextFunction } from 'express'
import {AppError, catchAsync} from '../../../../../lib/error/customErrors'
import applogger from '../../../../../lib/logger/applogger'
import {  PostMiddleware } from '../../domain/PostMiddleware';
import { AuthMiddleware } from '../../../../auth/v2/domain/AuthMiddleware';

const logger = applogger.child({'module':'NodeController'});



export const router = express.Router();
export const apiRoot = '/api/v2/posts'

//Create
router.post('/', 
    catchAsync(PostMiddleware.validatePostInput),
    catchAsync(PostMiddleware.createPost),

    //catchAsync(AuthMiddleware.requireAuthSession),
    // catchAsync(PostValidation.validateNewPostInput), 
    // catchAsync(PostService.create), 
    function (req:any, res:any) {
    res.status(200).json(res.result)
});


//Create
router.put('/', 
    catchAsync(PostMiddleware.validatePostInput),

    catchAsync(PostMiddleware.updatePost),

    //catchAsync(AuthMiddleware.requireAuthSession),
    // catchAsync(PostValidation.validateNewPostInput), 
    // catchAsync(PostService.create), 
    function (req:any, res:any) {
    res.status(200).json(res.result)
});
//Create
router.delete('/', 
    catchAsync(PostMiddleware.deletePost),

    //catchAsync(AuthMiddleware.requireAuthSession),
    // catchAsync(PostValidation.validateNewPostInput), 
    // catchAsync(PostService.create), 
    function (req:any, res:any) {
    res.status(200).json(res.result)
});


//PostService.findOneByQueryStandalone('silly-gray-microphone')
export default {router,apiRoot}