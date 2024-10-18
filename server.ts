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
import limiter from './lib/util/limiter';
import assertEnvironmentVariable from './lib/util/assertEnvironmentVariable';
import dotenv from 'dotenv'
import z from 'zod';
dotenv.config()
assertEnvironmentVariable(process.env.NODE_ENV,"NODE_ENV", ()=>{z.enum(['production', 'development']).parse(process.env.NODE_ENV)})
const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);

app.use(session({
  name: 'session_id',
  store: redis.store,
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: false,
    maxAge: 24*60*60000
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(authRouterv2.apiRoot, authRouterv2.router);
app.use(nodesV2Router.apiRoot, nodesV2Router.router);
app.use(postsV2Router.apiRoot, postsV2Router.router);


// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

app.use(globalErrorHandler);
app.listen(3003, () => {
    console.log(`🌍 Now listening on http://localhost:${3003}`);
});

export default app;