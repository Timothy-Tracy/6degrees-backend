"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const neogma_1 = require("neogma");
const dotenv_1 = __importDefault(require("dotenv"));
const customErrors_1 = require("../../../../lib/error/customErrors");
dotenv_1.default.config();
if (!process.env.DB_URL) {
    throw new customErrors_1.AppError('DB_URL does not exist in environment variables', 500);
}
if (!process.env.DB_USERNAME) {
    throw new customErrors_1.AppError('DB_USERNAME does not exist in environment variables', 500);
}
if (!process.env.DB_PASSWORD) {
    throw new customErrors_1.AppError('DB_PASSWORD does not exist in environment variables', 500);
}
if (!process.env.DB_DATABASE) {
    throw new customErrors_1.AppError('DB_DATABASE does not exist in environment variables', 500);
}
const neogma = new neogma_1.Neogma({
    url: process.env.DB_URL,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    /* --> (optional) the database to be used by default for sessions */
    database: process.env.DB_DATABASE,
}, {
    /* --> (optional) logs every query that Neogma runs, using the given function */
    logger: console.log,
    /* --> any driver configuration can be used */
    encrypted: false,
});
exports.default = neogma;
//# sourceMappingURL=neogma.js.map