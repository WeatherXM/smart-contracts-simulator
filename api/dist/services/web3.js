"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractMethodTxData = void 0;
const web3_1 = require("web3");
const config_1 = require("../infra/utils/config");
const getContractMethodTxData = async (from, to, abi, method, params = [], value = '0') => {
    const web3 = new web3_1.Web3(config_1.output.rpc_url);
    const contractInstance = new web3.eth.Contract(abi, to, { from });
    // @ts-ignore
    const gasLimit = await contractInstance.methods[method](...params).estimateGas();
    // @ts-ignore
    const data = contractInstance.methods[method](...params).encodeABI();
    return {
        from,
        to,
        data,
        gasLimit,
        value
    };
};
exports.getContractMethodTxData = getContractMethodTxData;
