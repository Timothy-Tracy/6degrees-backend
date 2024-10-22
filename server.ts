import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { globalErrorHandler } from './lib/error/errorHandler';
import passport from 'passport';
import session from 'express-session';
import redis from './apps/db/redis/RedisService';
import authRouterv2 from './apps/auth/entry-points/api/AuthController';
import nodesV2Router from './apps/nodes/entry-points/api/NodeController';
import postsV2Router from './apps/posts/entry-points/api/PostController';
import searchRouter from './apps/search/entry-points/api/SearchController';

import limiter from './lib/util/limiter';
import assertEnvironmentVariable from './lib/util/assertEnvironmentVariable';
import dotenv from 'dotenv'
import z from 'zod';
import applogger from './lib/logger/applogger';

dotenv.config()
assertEnvironmentVariable(process.env.NODE_ENV,"NODE_ENV", ()=>{
  z.enum(['production', 'development']).parse(process.env.NODE_ENV)
})
assertEnvironmentVariable(process.env.GOOGLE_CLIENT_ID,"GOOGLE_CLIENT_ID")
assertEnvironmentVariable(process.env.GOOGLE_CLIENT_SECRET,"GOOGLE_CLIENT_SECRET")
assertEnvironmentVariable(process.env.GOOGLE_CALLBACK_URL,"GOOGLE_CALLBACK_URL")
assertEnvironmentVariable(process.env.DB_URL,"DB_URL")
assertEnvironmentVariable(process.env.DB_USERNAME,"DB_USERNAME")
assertEnvironmentVariable(process.env.DB_PASSWORD,"DB_PASSWORD")
assertEnvironmentVariable(process.env.DB_DATABASE,"DB_DATABASE")

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
  ? 'https://6degrees.app'  // Make sure this is set in your production env
  : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(limiter);
app.set('trust proxy', 1); 
app.use(session({
  name: '6degrees_session_id',
  store: redis.store,
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV == 'production'? true:false,
    httpOnly: process.env.NODE_ENV == 'production'? true:false,
    maxAge: 24*60*60*1000,
    // sameSite: process.env.NODE_ENV == 'production'? 'none':undefined,
    domain: process.env.NODE_ENV == 'production'? '6degrees.app':'localhost'
  }
  ,proxy: process.env.NODE_ENV == 'production'? true:false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(authRouterv2.apiRoot, authRouterv2.router);
app.use(nodesV2Router.apiRoot, nodesV2Router.router);
app.use(postsV2Router.apiRoot, postsV2Router.router);
app.use(searchRouter.apiRoot, searchRouter.router);


// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

app.use(globalErrorHandler);
app.listen({port: process.env.NODE_ENV == 'production'? 10000: 3003, host: process.env.NODE_ENV == 'production'? '0.0.0.0':''}, () => {
    console.log(`🌍 Now listening on http://localhost:${3003}`);
});

export default app;