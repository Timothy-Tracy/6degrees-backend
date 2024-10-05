"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./AuthStrategy");
require("./GoogleStrategy");
const passport_1 = __importDefault(require("passport"));
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/passport', passport_1.default.authenticate("local"), (req, res) => {
    res.status(200).json({ token: req.user });
});
router.get('/google', passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get('/google/callback', passport_1.default.authenticate("google"), (req, res) => {
    res.status(200).json({ token: req.user });
});
exports.default = router;
//# sourceMappingURL=index.js.map