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
Object.defineProperty(exports, "__esModule", { value: true });
const alchemy_sdk_1 = require("alchemy-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
if (!ALCHEMY_API_KEY) {
    throw new Error('Missing ALCHEMY_API_KEY in environment variables');
}
// Configure Alchemy SDK
const config = {
    apiKey: ALCHEMY_API_KEY,
    network: alchemy_sdk_1.Network.ETH_MAINNET
};
const alchemy = new alchemy_sdk_1.Alchemy(config);
function getDeployedERC20Tokens(walletAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get all token contracts created by this address
            const response = yield alchemy.core.getAssetTransfers({
                fromBlock: "0x0",
                fromAddress: walletAddress,
                category: [alchemy_sdk_1.AssetTransfersCategory.ERC20],
                withMetadata: true,
                excludeZeroValue: true,
            });
            // Create a Set to store unique token contract addresses
            const uniqueTokenContracts = new Set();
            // Filter for contract creation transactions (where 'to' is null)
            response.transfers.forEach(transfer => {
                if (transfer.to === null && transfer.asset) {
                    uniqueTokenContracts.add(transfer.asset);
                }
            });
            // Get token details for each contract
            const tokenDetails = yield Promise.all(Array.from(uniqueTokenContracts).map((contractAddress) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const metadata = yield alchemy.core.getTokenMetadata(contractAddress);
                    return {
                        address: contractAddress,
                        name: metadata.name,
                        symbol: metadata.symbol,
                        decimals: metadata.decimals
                    };
                }
                catch (error) {
                    console.error(`Error fetching metadata for ${contractAddress}:`, error);
                    return null;
                }
            })));
            // Filter out null values and return results
            const validTokens = tokenDetails.filter(token => token !== null);
            return {
                totalTokensDeployed: validTokens.length,
                tokens: validTokens
            };
        }
        catch (error) {
            console.error('Error in getDeployedERC20Tokens:', error);
            throw error;
        }
    });
}
// Example usage
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const walletAddress = '0xYourWalletAddress'; // Replace with actual wallet address
            const result = yield getDeployedERC20Tokens(walletAddress);
            console.log(`Total ERC20 tokens deployed: ${result.totalTokensDeployed}`);
            console.log('Tokens:', result.tokens);
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
// Uncomment to run the example
// main();
