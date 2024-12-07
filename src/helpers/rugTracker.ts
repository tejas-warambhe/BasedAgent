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
    network: Network.BASE_MAINNET
};

const alchemy = new Alchemy(config);

export async function getDeployedERC20Tokens(walletAddress: string, tokenAddress: string) {
    try {
        // Get all token contracts created by this address
        const response = await alchemy.core.getAssetTransfers({
            fromBlock: "0x0",
            fromAddress: walletAddress,
            category: [AssetTransfersCategory.ERC20],
            withMetadata: true,
            excludeZeroValue: true,
        });
        // console.log(walletAddress);
        console.log(response.transfers);
        // Create a Set to store unique token contract addresses
        const uniqueTokenContracts = new Set<string>();

        // Filter for contract creation transactions (where 'to' is null)
        // response.transfers.forEach(transfer => {
        //     if (transfer.from === null && transfer.asset) {
        //         console.log(transfer.asset);
        //         uniqueTokenContracts.add(transfer.asset);
        //     }
        // });
        for(let i = 0; i < response.transfers.length; i++){
            if(response.transfers[i].from === null && response.transfers[i].asset){
                console.log(response.transfers[i].asset, ' I was here');
                uniqueTokenContracts.add(response.transfers[i].asset as string);
            }
        }
        console.log(uniqueTokenContracts);
        

        // Get token details for each contract
        // const tokenDetails = await Promise.all(
        //     Array.from(uniqueTokenContracts).map(async (contractAddress) => {
        //         try {
        //             const metadata = await alchemy.core.getTokenMetadata(contractAddress);
        //             return {
        //                 address: contractAddress,
        //                 name: metadata.name,
        //                 symbol: metadata.symbol,
        //                 decimals: metadata.decimals
        //             };
        //         } catch (error) {
        //             console.error(`Error fetching metadata for ${contractAddress}:`, error);
        //             return null;
        //         }
        //     })
        // );

        // console.log(tokenDetails);

        // Filter out null values and return results
        // const validTokens = tokenDetails.filter(token => token !== null);

        // return {
        //     totalTokensDeployed: validTokens.length,
        //     tokens: validTokens
        // };
        // console.log(validTokens);
        // console.log(tokenDetails.length);
    } catch (error) {
        console.error('Error in getDeployedERC20Tokens:', error);
        throw error;
    }
}

// Example usage
// async function main() {
//     try {
//         const walletAddress = '0xYourWalletAddress'; // Replace with actual wallet address
//         const result = await getDeployedERC20Tokens(walletAddress);
//         console.log(`Total ERC20 tokens deployed: ${result.totalTokensDeployed}`);
//         console.log('Tokens:', result.tokens);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

// Uncomment to run the example
// main();