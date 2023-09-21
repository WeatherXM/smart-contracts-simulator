"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const formatter = (info) => {
    if (info.stack !== null && info.stack !== undefined) {
        return `${info.timestamp} ${info.level}: ${info.message} - ${info.stack}`;
    }
    else {
        return `${info.timestamp} ${info.level}: ${info.message}`;
    }
};
exports.logger = (0, winston_1.createLogger)({
    levels: winston_1.config.syslog.levels,
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.splat(), winston_1.format.printf(formatter)),
    transports: [
        new winston_1.transports.Console({
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
            format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.splat(), winston_1.format.printf(formatter))
        })
    ]
});
