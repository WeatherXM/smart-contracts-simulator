"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.output = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const configSchema = zod_1.z.object({
    isDevelopment: zod_1.z.boolean(),
    port: zod_1.z.number(),
    rpc_url: zod_1.z.string()
}).strict();
const config = {
    // Check if app is running in development mode
    isDevelopment: process.env.NODE_ENV === 'development',
    port: process.env.PORT !== undefined ? Number(process.env.PORT) : 3001,
    rpc_url: process.env.RPC
};
// Validate configuration
exports.output = configSchema.parse(config);
