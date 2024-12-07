import { ethers } from 'ethers';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const BASE_RPC = 'https://mainnet.base.org';

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)'
];

export async function getWalletBalances(walletAddress: string): Promise<{ eth: string; usdc: string }> {
    try {
        const provider = new ethers.providers.JsonRpcProvider(BASE_RPC);
        
        // Get ETH balance
        const ethBalance = await provider.getBalance(walletAddress);
        const formattedEthBalance = ethers.utils.formatEther(ethBalance);
        
        // Get USDC balance
        const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
        const usdcBalance = await usdcContract.balanceOf(walletAddress);
        const usdcDecimals = await usdcContract.decimals();
        const formattedUsdcBalance = parseFloat(ethers.utils.formatUnits(usdcBalance, usdcDecimals)).toFixed(2);
        
        return {
            eth: formattedEthBalance,
            usdc: formattedUsdcBalance
        };
    } catch (error) {
        console.error('Error fetching balances:', error);
        throw error;
    }
}