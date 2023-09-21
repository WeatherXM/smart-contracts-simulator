"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.make = void 0;
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const make = () => {
    const router = (0, express_1.Router)();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    router.get('/api/v1/txs/claim/:userAddress', async (req, res, next) => {
        const user = req.params.userAddress;
        const amount = req.query.amount;
        res.status(http_status_codes_1.StatusCodes.OK).json({
            from: user
        });
    });
    return router;
};
exports.make = make;
