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
exports.getWalletBalances = getWalletBalances;
const ethers_1 = require("ethers");
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const BASE_RPC = 'https://mainnet.base.org';
// ERC20 ABI for balanceOf function
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)'
];
function getWalletBalances(walletAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provider = new ethers_1.ethers.providers.JsonRpcProvider(BASE_RPC);
            // Get ETH balance
            const ethBalance = yield provider.getBalance(walletAddress);
            const formattedEthBalance = ethers_1.ethers.utils.formatEther(ethBalance);
            // Get USDC balance
            const usdcContract = new ethers_1.ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
            const usdcBalance = yield usdcContract.balanceOf(walletAddress);
            const usdcDecimals = yield usdcContract.decimals();
            const formattedUsdcBalance = parseFloat(ethers_1.ethers.utils.formatUnits(usdcBalance, usdcDecimals)).toFixed(2);
            return {
                eth: formattedEthBalance,
                usdc: formattedUsdcBalance
            };
        }
        catch (error) {
            console.error('Error fetching balances:', error);
            throw error;
        }
    });
}
