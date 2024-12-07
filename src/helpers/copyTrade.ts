import { ethers } from 'ethers';
import { traders } from '../data/traders';
import {
    TokenTransaction,
    TradeHistory,
    TradeConfig,
    TradeNotification,
    TradeType,
    TokenInfo,
    WhaleTrader
} from '../types/trading';

// Common token configurations
export const SUPPORTED_TOKENS: { [key: string]: TokenInfo } = {
    USDC: {
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        symbol: 'USDC',
        decimals: 6
    },
    WETH: {
        address: '0x4200000000000000000000000000000000000006',
        symbol: 'WETH',
        decimals: 18
    }
};

// ERC20 interface
const ERC20_ABI = [
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
];

// Keep track of processed transactions to avoid duplicates
const processedTxs = new Set<string>();

// Keep track of active monitoring sessions
const activeMonitoringSessions = new Map<string, boolean>();

/**
 * Monitors a specific address for token transactions
 * @param whaleAddress The address to monitor
 * @param config Trading configuration including token and amount threshold
 * @returns Transaction details if a significant trade is found
 */
export async function monitorWhaleAddress(
    whaleAddress: string,
    config: TradeConfig
): Promise<TokenTransaction | null> {
    try {
        const { provider, token, minimumAmount, blocksToScan = 10 } = config;
        
        // Create contract interface for the token
        const tokenContract = new ethers.Contract(
            token.address,
            ERC20_ABI,
            provider
        );

        // Create filters for both incoming and outgoing transfers
        const buyFilter = tokenContract.filters.Transfer(null, whaleAddress);
        const sellFilter = tokenContract.filters.Transfer(whaleAddress, null);

        // Get the latest block
        const latestBlock = await provider.getBlockNumber();
        const fromBlock = latestBlock - blocksToScan;

        // Get both buy and sell events
        const [buyEvents, sellEvents] = await Promise.all([
            tokenContract.queryFilter(buyFilter, fromBlock, latestBlock),
            tokenContract.queryFilter(sellFilter, fromBlock, latestBlock)
        ]);

        // Process all events
        for (const event of [...buyEvents, ...sellEvents]) {
            const txHash = event.transactionHash;
            
            // Skip if we've already processed this transaction
            if (processedTxs.has(txHash)) continue;
            
            const amount = event.args?.value.toString();
            const type: TradeType = event.args?.to.toLowerCase() === whaleAddress.toLowerCase() ? 'buy' : 'sell';
            
            // Compare the amount with minimum threshold
            if (ethers.BigNumber.from(amount).gte(ethers.BigNumber.from(minimumAmount))) {
                const block = await event.getBlock();
                
                // Mark transaction as processed
                processedTxs.add(txHash);
                
                // Format amount using token decimals
                const formattedAmount = ethers.utils.formatUnits(amount, token.decimals);
                
                return {
                    tokenAddress: token.address,
                    amount: `${formattedAmount} ${token.symbol}`,
                    timestamp: block.timestamp,
                    type,
                    hash: txHash,
                    blockNumber: block.number
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Error monitoring whale address:', error);
        return null;
    }
}

/**
 * Tracks all configured whale traders for significant trades
 * @param config Trading configuration
 * @returns Map of trader names to their latest significant transaction
 */
export async function trackAllWhales(
    config: TradeConfig
): Promise<Map<string, TokenTransaction | null>> {
    const results = new Map<string, TokenTransaction | null>();

    const monitoringPromises = traders.map(async (trader: WhaleTrader) => {
        // Use trader-specific minimum amount if configured
        const traderConfig: TradeConfig = {
            ...config,
            minimumAmount: trader.minimumAmount || config.minimumAmount
        };
        
        const result = await monitorWhaleAddress(trader.address, traderConfig);
        results.set(trader.name, result);
    });

    await Promise.all(monitoringPromises);
    return results;
}

/**
 * Formats a trade notification message
 * @param trader Trader's name
 * @param trade Transaction details
 * @returns Formatted message string
 */
export function formatTradeMessage(trader: string, trade: TokenTransaction): string {
    const emoji = trade.type === 'buy' ? '🟢' : '🔴';
    const action = trade.type === 'buy' ? 'bought' : 'sold';
    const time = new Date(trade.timestamp * 1000).toLocaleTimeString();
    const blockInfo = trade.blockNumber ? `\nBlock: ${trade.blockNumber}` : '';
    const txHash = trade.hash ? `\nTx: ${trade.hash.slice(0, 10)}...` : '';
    
    return `${emoji} ${trader} ${action} ${trade.amount} at ${time}${blockInfo}${txHash}`;
}

/**
 * Retrieves historical trades for an address
 * @param address Wallet address to get history for
 * @param config Trading configuration
 * @param blocksBack Number of blocks to look back (default: 1000)
 * @returns Trade history including all transactions
 */
export async function getTradeHistory(
    address: string,
    config: TradeConfig,
    blocksBack: number = 1000
): Promise<TradeHistory> {
    const history: TradeHistory = {
        address,
        transactions: []
    };

    try {
        const { provider, token } = config;
        const tokenContract = new ethers.Contract(
            token.address,
            ERC20_ABI,
            provider
        );
        
        const latestBlock = await provider.getBlockNumber();
        const fromBlock = latestBlock - blocksBack;

        // Get both incoming and outgoing transfers
        const buyFilter = tokenContract.filters.Transfer(null, address);
        const sellFilter = tokenContract.filters.Transfer(address, null);

        const [buyEvents, sellEvents] = await Promise.all([
            tokenContract.queryFilter(buyFilter, fromBlock, latestBlock),
            tokenContract.queryFilter(sellFilter, fromBlock, latestBlock)
        ]);

        // Process all events
        const processEvent = async (event: ethers.Event, type: TradeType) => {
            const block = await event.getBlock();
            const amount = ethers.utils.formatUnits(event.args?.value, token.decimals);
            
            history.transactions.push({
                tokenAddress: token.address,
                amount: `${amount} ${token.symbol}`,
                timestamp: block.timestamp,
                type,
                hash: event.transactionHash,
                blockNumber: block.number
            });
        };

        // Process events in parallel
        await Promise.all([
            ...buyEvents.map(event => processEvent(event, 'buy')),
            ...sellEvents.map(event => processEvent(event, 'sell'))
        ]);

        // Sort transactions by timestamp (newest first)
        history.transactions.sort((a, b) => b.timestamp - a.timestamp);

    } catch (error) {
        console.error('Error fetching trade history:', error);
    }

    return history;
}

/**
 * Checks if an address has made any trades above the minimum amount
 * @param address Address to check
 * @param config Trading configuration
 * @param timeWindow Time window in seconds to check (default: 1 hour)
 * @returns Boolean indicating if address is active
 */
export async function isActiveTrader(
    address: string,
    config: TradeConfig,
    timeWindow: number = 3600 // 1 hour
): Promise<boolean> {
    const history = await getTradeHistory(address, config, 100); // Look back 100 blocks
    const currentTime = Math.floor(Date.now() / 1000);
    
    return history.transactions.some(tx => {
        const timeDiff = currentTime - tx.timestamp;
        const amountNum = parseFloat(tx.amount.split(' ')[0]);
        const minAmount = parseFloat(ethers.utils.formatUnits(config.minimumAmount, config.token.decimals));
        
        return timeDiff <= timeWindow && amountNum >= minAmount;
    });
}

/**
 * Starts continuous whale monitoring
 * @param whaleAddress Whale address to monitor
 * @param config Trading configuration
 * @param onTrade Callback function for each trade
 * @returns Cleanup function to stop monitoring
 */
export const startWhaleMonitoring = async (
    whaleAddress: string,
    config: TradeConfig,
    onTrade: (transaction: TokenTransaction) => Promise<void>
): Promise<() => void> => {
    const sessionKey = `${whaleAddress}_${config.token.symbol}`;
    activeMonitoringSessions.set(sessionKey, true);

    // Start monitoring in background
    (async () => {
        let lastBlockNumber = await config.provider.getBlockNumber();

        while (activeMonitoringSessions.get(sessionKey)) {
            try {
                const currentBlockNumber = await config.provider.getBlockNumber();
                
                if (currentBlockNumber > lastBlockNumber) {
                    const transaction = await monitorWhaleAddress(whaleAddress, {
                        ...config,
                        blocksToScan: currentBlockNumber - lastBlockNumber
                    });

                    if (transaction) {
                        await onTrade(transaction);
                    }

                    lastBlockNumber = currentBlockNumber;
                }

                // Wait for 12 seconds (average block time on BASE)
                await new Promise(resolve => setTimeout(resolve, 12000));
            } catch (error) {
                console.error('Error monitoring whale address:', error);
                // Wait before retrying on error
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
        }
    })();

    // Return cleanup function
    return () => {
        activeMonitoringSessions.set(sessionKey, false);
    };
};