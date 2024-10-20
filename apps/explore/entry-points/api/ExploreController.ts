
import { Express, NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { Router } from 'express';

import { catchAsync } from '../../../../lib/error/customErrors';

import applogger from '../../../../lib/logger/applogger';
import { ExploreMiddleware } from '../../domain/ExploreMiddleware';
export const router = Router();
export const apiRoot = '/api/v2/explore'




router.get('/posts/all', 
    
    catchAsync(ExploreMiddleware.getPostFeed),
    (req:Request, res:Response, next:NextFunction) => {
        res.status(200).json(res.result)
    }
);

router.get('/activity/all', 
    
    catchAsync(ExploreMiddleware.getAllActivity),
    (req:Request, res:Response, next:NextFunction) => {
        res.status(200).json(res.result)
    }
);


export default {router, apiRoot}