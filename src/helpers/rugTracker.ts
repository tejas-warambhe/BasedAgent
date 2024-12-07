import { Alchemy, AssetTransfersCategory, Network } from 'alchemy-sdk';
import dotenv from 'dotenv';

dotenv.config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

if (!ALCHEMY_API_KEY) {
    throw new Error('Missing ALCHEMY_API_KEY in environment variables');
}

// Configure Alchemy SDK
const config = {
    apiKey: ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET
};

const alchemy = new Alchemy(config);

async function getDeployedERC20Tokens(walletAddress: string) {
    try {
        // Get all token contracts created by this address
        const response = await alchemy.core.getAssetTransfers({
            fromBlock: "0x0",
            fromAddress: walletAddress,
            category: [AssetTransfersCategory.ERC20],
            withMetadata: true,
            excludeZeroValue: true,
        });

        // Create a Set to store unique token contract addresses
        const uniqueTokenContracts = new Set<string>();

        // Filter for contract creation transactions (where 'to' is null)
        response.transfers.forEach(transfer => {
            if (transfer.to === null && transfer.asset) {
                uniqueTokenContracts.add(transfer.asset);
            }
        });

        // Get token details for each contract
        const tokenDetails = await Promise.all(
            Array.from(uniqueTokenContracts).map(async (contractAddress) => {
                try {
                    const metadata = await alchemy.core.getTokenMetadata(contractAddress);
                    return {
                        address: contractAddress,
                        name: metadata.name,
                        symbol: metadata.symbol,
                        decimals: metadata.decimals
                    };
                } catch (error) {
                    console.error(`Error fetching metadata for ${contractAddress}:`, error);
                    return null;
                }
            })
        );

        // Filter out null values and return results
        const validTokens = tokenDetails.filter(token => token !== null);

        return {
            totalTokensDeployed: validTokens.length,
            tokens: validTokens
        };
    } catch (error) {
        console.error('Error in getDeployedERC20Tokens:', error);
        throw error;
    }
}

// Example usage
async function main() {
    try {
        const walletAddress = '0xYourWalletAddress'; // Replace with actual wallet address
        const result = await getDeployedERC20Tokens(walletAddress);
        console.log(`Total ERC20 tokens deployed: ${result.totalTokensDeployed}`);
        console.log('Tokens:', result.tokens);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Uncomment to run the example
// main();