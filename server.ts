import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import pinoHttp from 'pino-http';
import cors from 'cors';
import neogma from './apps/db/neo4j/neogma/neogma';

// My Routers
// import indexRouter from './routes/index';
// import usersRouter from './routes/users';
// import postsRouter from './apps/posts/entry-points/api/PostController';
// import AdminPostsRouter from './apps/posts/entry-points/api/AdminPostController';
// import AdminUsersRouter from './apps/users/entry-points/api/AdminUserController';
// import nodesRouter from './apps/nodes/entry-points/api/NodeController';
// import authRouter from './apps/auth/entry-points/api/AuthController';
// import commentRouter from './apps/comments/entry-points/api/CommentController';
// import searchRouter from './apps/search/entry-points/api/SearchController';
import { globalErrorHandler } from './lib/error/errorHandler';

import passport from 'passport';
import session from 'express-session';
import redis from './apps/db/redis/RedisService';


import authRouterv2 from './apps/auth/entry-points/api/AuthController';
import nodesV2Router from './apps/nodes/entry-points/api/NodeController';
import postsV2Router from './apps/posts/entry-points/api/PostController';
import {test} from './apps/db/neo4j/models/test';
import { generateDateTime } from './lib/util/generateDateTime';
import uuid from './lib/util/generateUUID';
//console.log(test())
const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// app.use(pinoHttp);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// app.use(searchRouter.apiRoot, searchRouter.router);
// app.use(AdminPostsRouter.apiRoot, AdminPostsRouter.router);
// app.use(AdminUsersRouter.apiRoot, AdminUsersRouter.router);
// app.use(postsRouter.apiRoot, postsRouter.router);
// app.use(usersRouter.apiRoot, usersRouter.router);
// app.use(nodesRouter.apiRoot, nodesRouter.router);
// app.use(authRouter.apiRoot, authRouter.router);
// app.use(commentRouter.apiRoot, commentRouter.router);

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