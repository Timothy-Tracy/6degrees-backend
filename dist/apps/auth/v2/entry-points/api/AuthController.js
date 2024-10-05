"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoot = exports.router = void 0;
require("./../../domain/strategies/AuthStrategy");
require("./../../domain/strategies/GoogleStrategy");
const passport_1 = __importDefault(require("passport"));
const express_1 = require("express");
const AuthService_1 = __importDefault(require("../../domain/AuthService"));
const customErrors_1 = require("../../../../../lib/error/customErrors");
exports.router = (0, express_1.Router)();
exports.apiRoot = '/api/v2/auth';
exports.router.post('/passport', passport_1.default.authenticate("local"), (req, res) => {
    res.status(200).json({ token: req.user });
});
exports.router.get('/google', passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
exports.router.get('/google/callback', passport_1.default.authenticate("google"), (req, res) => {
    res.status(200).json({ token: req.user });
});
exports.router.post('/login', (0, customErrors_1.catchAsync)(AuthService_1.default.login), (req, res) => {
    res.status(200).json({ token: res.locals.auth });
});
exports.router.post('/register', (0, customErrors_1.catchAsync)(AuthService_1.default.register), (req, res) => {
    res.status(200).json(res.locals);
});
exports.router.get('/status', (req, res) => {
    console.log(req.session);
    console.log(req.user);
    req.isAuthenticated() ? res.status(200).json({ message: "Authenticated" }) : res.status(401).json({ message: "Not Authenticated" });
});
exports.router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err)
            res.status(500).json({ message: "Logout failed" });
        res.status(200).json({ message: "Logged out" });
    });
});
exports.router.get('/hello', (req, res) => {
    if (req.session?.viewCount == undefined) {
        req.session.viewCount = 0;
    }
    else {
        req.session.viewCount++;
    }
    res.send(`Hello! You have visited this page ${req.session.viewCount} times`);
});
exports.router.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    }
    else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});
//# sourceMappingURL=AuthController.js.map