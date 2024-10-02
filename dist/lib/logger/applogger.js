"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
/*
    References:
        https://github.com/pinojs/pino

    Import:
    const mylogger = require('/path/to/logger.js');

    Child Logger:
    const logger = mylogger.child({'module':'filename.js'});

    const log = logger.child({'function':'functionName'});

    Usage:
    log.trace(options/json, message)
    log.debug(options/json, message)
    log.info(options/json, message)
    log.warn(options/json, message)
    log.error(options/json, message)
*/
const applogger = (0, pino_1.default)({
    level: process.env.PINO_LOG_LEVEL || 'trace',
    transport: {
        targets: [
            {
                target: 'pino-pretty',
                level: process.env.PINO_LOG_LEVEL || 'trace',
                options: {
                    destination: process.stdout.fd,
                    colorize: true
                }
            }
        ]
    }
});
exports.default = applogger;
//# sourceMappingURL=applogger.js.map