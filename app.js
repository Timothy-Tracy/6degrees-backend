
//Libraries
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const pino = require('pino-http');
const cors = require('cors');
//const NORM = require('./dist/apps/db/neo4j/norm/NORM')
const neogma = require('./dist/apps/db/neo4j/neogma/neogma')
const test = require('./dist/apps/db/neo4j/neogma/test')


//My Routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./apps/posts/entry-points/api/PostController.js');
var AdminPostsRouter = require('./apps/posts/entry-points/api/AdminPostController.js');
var AdminUsersRouter = require('./apps/users/entry-points/api/AdminUserController.js');

var usersRouter = require('./apps/users/entry-points/api/UserController.js');
var nodesRouter = require('./apps/nodes/entry-points/api/NodeController.js');
var authRouter = require('./apps/auth/entry-points/api/AuthController.js');
var commentRouter = require('./apps/comments/entry-points/api/CommentController.js');
var searchRouter = require('./apps/search/entry-points/api/SearchController.js');

var nodesV2Router = require('./dist/apps/nodes/v2/entry-points/api/NodeController');

var errorHandler = require('./lib/error/errorHandler.js');
var app = express();
app.use(express.json());
//app.use(pino);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin:'http://localhost:3000',
  credentials: true
}));
app.use(searchRouter.apiRoot, searchRouter.router);

app.use(AdminPostsRouter.apiRoot, AdminPostsRouter.router);
app.use(AdminUsersRouter.apiRoot, AdminUsersRouter.router);
app.use(postsRouter.apiRoot, postsRouter.router);
app.use(usersRouter.apiRoot, usersRouter.router);
app.use(nodesRouter.apiRoot, nodesRouter.router);
app.use(authRouter.apiRoot, authRouter.router);
app.use(commentRouter.apiRoot, commentRouter.router);
app.use(nodesV2Router.apiRoot, nodesV2Router.router);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
app.use(errorHandler.globalErrorHandler);
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });



module.exports = app;

