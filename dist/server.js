"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
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
const errorHandler_1 = require("./lib/error/errorHandler");
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const RedisService_1 = __importDefault(require("./apps/db/redis/RedisService"));
const AuthController_1 = __importDefault(require("./apps/auth/v2/entry-points/api/AuthController"));
const NodeController_1 = __importDefault(require("./apps/nodes/v2/entry-points/api/NodeController"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    store: RedisService_1.default.store,
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 60000
    }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// app.use(pinoHttp);
// view engine setup
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// app.use(searchRouter.apiRoot, searchRouter.router);
// app.use(AdminPostsRouter.apiRoot, AdminPostsRouter.router);
// app.use(AdminUsersRouter.apiRoot, AdminUsersRouter.router);
// app.use(postsRouter.apiRoot, postsRouter.router);
// app.use(usersRouter.apiRoot, usersRouter.router);
// app.use(nodesRouter.apiRoot, nodesRouter.router);
// app.use(authRouter.apiRoot, authRouter.router);
// app.use(commentRouter.apiRoot, commentRouter.router);
app.use(AuthController_1.default.apiRoot, AuthController_1.default.router);
app.use(NodeController_1.default.apiRoot, NodeController_1.default.router);
// catch 404 and forward to error handler
app.use((req, res, next) => {
    next((0, http_errors_1.default)(404));
});
app.use(errorHandler_1.globalErrorHandler);
app.listen(3003, () => {
    console.log(`🌍 Now listening on http://localhost:${3003}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map