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
exports.attestGameWhaleReputationToUser = void 0;
// import { gameWhaleReputationSchema } from '../../true-network/true.config'
const true_config_1 = require("../true-network/true.config");
const attestGameWhaleReputationToUser = (address, score) => __awaiter(void 0, void 0, void 0, function* () {
    const api = yield (0, true_config_1.getTrueNetworkInstance)();
    const attestation = yield true_config_1.gameWhaleReputationSchema.getAttestation(api, address);
    const output = yield true_config_1.gameWhaleReputationSchema.attest(api, address, {
        score: attestation.score + score,
    });
    // Output is usually the transaction hash for verification on-chain.
    console.log(output);
    // Make sure to disconnect the network after operation(s) is done.
    yield api.network.disconnect();
});
exports.attestGameWhaleReputationToUser = attestGameWhaleReputationToUser;
// attestGamePlayToUser()
