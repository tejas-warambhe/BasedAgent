"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const alchemy_sdk_1 = require("alchemy-sdk");
const ethers_1 = require("ethers");
const apiKey = 'YccgqlOoLQ1RcnSi1KyRBe1zWz3tkCSo';
const settings = {
    apiKey: apiKey,
    network: alchemy_sdk_1.Network.BASE_MAINNET
};
const alchemy = new alchemy_sdk_1.Alchemy(settings);
const filetering = {
    address: '0x997020E5F59cCB79C74D527Be492Cc610CB9fA2B',
};
const parseWowTokenCreatedLogs = (logs) => {
    return logs.map((log) => {
        try {
            // Decode the log using ethers
            const decodedLog = {
                factoryAddress: ethers_1.ethers.utils.getAddress(log.topics[1].slice(26)),
                tokenCreator: ethers_1.ethers.utils.getAddress(log.topics[2].slice(26)),
                // Decode the rest of the parameters from the log data
                data: ethers_1.ethers.utils.defaultAbiCoder.decode([
                    'address', // platformReferrer
                    'address', // protocolFeeRecipient
                    'address', // bondingCurve
                    'string', // tokenURI
                    'string', // name
                    'string', // symbol
                    'address', // tokenAddress
                    'address' // poolAddress
                ], log.data)
            };
            return {
                factoryAddress: decodedLog.factoryAddress,
                tokenCreator: decodedLog.tokenCreator,
                platformReferrer: decodedLog.data[0],
                protocolFeeRecipient: decodedLog.data[1],
                bondingCurve: decodedLog.data[2],
                tokenURI: decodedLog.data[3],
                name: decodedLog.data[4],
                symbol: decodedLog.data[5],
                tokenAddress: decodedLog.data[6],
                poolAddress: decodedLog.data[7]
            };
        }
        catch (error) {
            console.error('Error parsing log:', error);
            return null;
        }
    }).filter((log) => log !== null);
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // alchemy.ws.on( {
        //     address: filetering.address,
        // } , (log) => {
        //     console.log('New log:', log);
        //     const parsedLogs = parseWowTokenCreatedLogs(log);
        //     console.log('Parsed Logs:', JSON.stringify(parsedLogs, null, 2));
        // });
        const logs = yield alchemy.core.getLogs({
            fromBlock: "0x1646EA3",
            address: "0x997020E5F59cCB79C74D527Be492Cc610CB9fA2B",
            topics: [
                "0xc14d4a89f40f2ad9a3bacaae76b1d8567b797e367ed13e62996afbb52625457f",
                "0x000000000000000000000000997020e5f59ccb79c74d527be492cc610cb9fa2b",
                "0x000000000000000000000000282e626f1635669c075183867347b5d91c9e7ed1",
            ],
        });
        const parsedLogs = parseWowTokenCreatedLogs(logs);
        console.log('Parsed Logs:', JSON.stringify(parsedLogs, null, 2));
    }
    catch (error) {
        console.error('Error fetching logs:', error);
    }
});
const runMain = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield main();
    }
    catch (error) {
        console.log(error);
    }
});
runMain();
