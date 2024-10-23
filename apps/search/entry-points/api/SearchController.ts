
import { Express, NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { Router } from 'express';

import { catchAsync } from '../../../../lib/error/customErrors';

import applogger from '../../../../lib/logger/applogger';
import { SearchMiddleware } from '../../domain/SearchMiddleware';
import logRequest from '../../../../lib/util/middleware/logRequest';
export const router = Router();
export const apiRoot = '/api/v2/search'
const logger = applogger.child({'module':'SearchController'})



router.get('/posts/all', 
    logRequest(logger.child({'route':apiRoot+'/posts/all'})),

    catchAsync(SearchMiddleware.getPostFeed),
    (req:any, res:any, next:NextFunction) => {
        res.status(200).json(res.result)
    }
);

router.get('/activity/all', 
    logRequest(logger.child({'route':apiRoot+'/activity/all'})),

    catchAsync(SearchMiddleware.getAllActivity),
    (req:any, res:any, next:NextFunction) => {
        res.status(200).json(res.result)
    }
);


export default {router, apiRoot}