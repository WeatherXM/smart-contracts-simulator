"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.make = void 0;
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const web3_1 = require("../../../services/web3");
const config_json_1 = __importDefault(require("../../../contracts/config.json"));
const make = () => {
    const router = (0, express_1.Router)();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    router.get('/api/v1/txs/claim/:userAddress', async (req, res, next) => {
        const from = req.params.userAddress;
        const amount = req.query.amount;
        const contractAddress = config_json_1.default.rewardPoolAddress;
        const abi = config_json_1.default.rewardPoolArtifact.abi;
        const result = await (0, web3_1.getContractMethodTxData)(from, contractAddress, abi, 'claim', [], '0');
        res.status(http_status_codes_1.StatusCodes.OK).json(result);
    });
    return router;
};
exports.make = make;
