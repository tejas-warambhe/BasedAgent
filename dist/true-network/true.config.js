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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameWhaleReputationSchema = exports.config = exports.getTrueNetworkInstance = void 0;
const sdk_1 = require("@truenetworkio/sdk");
// If you are not in a NodeJS environment, please comment the code following code:
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getTrueNetworkInstance = () => __awaiter(void 0, void 0, void 0, function* () {
    const trueApi = yield sdk_1.TrueApi.create(exports.config.account.secret);
    yield trueApi.setIssuer(exports.config.issuer.hash);
    return trueApi;
});
exports.getTrueNetworkInstance = getTrueNetworkInstance;
exports.config = {
    network: sdk_1.testnet,
    account: {
        address: 'mdanpktfZWRY6brvrSoJrewfJ3aDgUuDkUxpEAdSYDpH6N1',
        secret: (_a = process.env.TRUE_NETWORK_SECRET_KEY) !== null && _a !== void 0 ? _a : ''
    },
    issuer: {
        name: 'based_eth_india',
        hash: '0xa9e1464364a6e3b60d1e0d00817147d092cabea14cb5c9def4ab24d1bd8c76a3'
    },
    algorithm: {
        id: undefined,
        path: undefined,
        schemas: []
    },
};
exports.gameWhaleReputationSchema = sdk_1.Schema.create({
    score: sdk_1.I32,
});
