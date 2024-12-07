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
exports.startWhaleMonitoring = exports.SUPPORTED_TOKENS = void 0;
exports.monitorWhaleAddress = monitorWhaleAddress;
exports.trackAllWhales = trackAllWhales;
exports.formatTradeMessage = formatTradeMessage;
exports.getTradeHistory = getTradeHistory;
exports.isActiveTrader = isActiveTrader;
const ethers_1 = require("ethers");
const traders_1 = require("../data/traders");
// Common token configurations
exports.SUPPORTED_TOKENS = {
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
const processedTxs = new Set();
// Keep track of active monitoring sessions
const activeMonitoringSessions = new Map();
/**
 * Monitors a specific address for token transactions
 * @param whaleAddress The address to monitor
 * @param config Trading configuration including token and amount threshold
 * @returns Transaction details if a significant trade is found
 */
function monitorWhaleAddress(whaleAddress, config) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { provider, token, minimumAmount, blocksToScan = 10 } = config;
            // Create contract interface for the token
            const tokenContract = new ethers_1.ethers.Contract(token.address, ERC20_ABI, provider);
            // Create filters for both incoming and outgoing transfers
            const buyFilter = tokenContract.filters.Transfer(null, whaleAddress);
            const sellFilter = tokenContract.filters.Transfer(whaleAddress, null);
            // Get the latest block
            const latestBlock = yield provider.getBlockNumber();
            const fromBlock = latestBlock - blocksToScan;
            // Get both buy and sell events
            const [buyEvents, sellEvents] = yield Promise.all([
                tokenContract.queryFilter(buyFilter, fromBlock, latestBlock),
                tokenContract.queryFilter(sellFilter, fromBlock, latestBlock)
            ]);
            // Process all events
            for (const event of [...buyEvents, ...sellEvents]) {
                const txHash = event.transactionHash;
                // Skip if we've already processed this transaction
                if (processedTxs.has(txHash))
                    continue;
                const amount = (_a = event.args) === null || _a === void 0 ? void 0 : _a.value.toString();
                const type = ((_b = event.args) === null || _b === void 0 ? void 0 : _b.to.toLowerCase()) === whaleAddress.toLowerCase() ? 'buy' : 'sell';
                // Compare the amount with minimum threshold
                if (ethers_1.ethers.BigNumber.from(amount).gte(ethers_1.ethers.BigNumber.from(minimumAmount))) {
                    const block = yield event.getBlock();
                    // Mark transaction as processed
                    processedTxs.add(txHash);
                    // Format amount using token decimals
                    const formattedAmount = ethers_1.ethers.utils.formatUnits(amount, token.decimals);
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
        }
        catch (error) {
            console.error('Error monitoring whale address:', error);
            return null;
        }
    });
}
/**
 * Tracks all configured whale traders for significant trades
 * @param config Trading configuration
 * @returns Map of trader names to their latest significant transaction
 */
function trackAllWhales(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = new Map();
        const monitoringPromises = traders_1.traders.map((trader) => __awaiter(this, void 0, void 0, function* () {
            // Use trader-specific minimum amount if configured
            const traderConfig = Object.assign(Object.assign({}, config), { minimumAmount: trader.minimumAmount || config.minimumAmount });
            const result = yield monitorWhaleAddress(trader.address, traderConfig);
            results.set(trader.name, result);
        }));
        yield Promise.all(monitoringPromises);
        return results;
    });
}
/**
 * Formats a trade notification message
 * @param trader Trader's name
 * @param trade Transaction details
 * @returns Formatted message string
 */
function formatTradeMessage(trader, trade) {
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
function getTradeHistory(address_1, config_1) {
    return __awaiter(this, arguments, void 0, function* (address, config, blocksBack = 1000) {
        const history = {
            address,
            transactions: []
        };
        try {
            const { provider, token } = config;
            const tokenContract = new ethers_1.ethers.Contract(token.address, ERC20_ABI, provider);
            const latestBlock = yield provider.getBlockNumber();
            const fromBlock = latestBlock - blocksBack;
            // Get both incoming and outgoing transfers
            const buyFilter = tokenContract.filters.Transfer(null, address);
            const sellFilter = tokenContract.filters.Transfer(address, null);
            const [buyEvents, sellEvents] = yield Promise.all([
                tokenContract.queryFilter(buyFilter, fromBlock, latestBlock),
                tokenContract.queryFilter(sellFilter, fromBlock, latestBlock)
            ]);
            // Process all events
            const processEvent = (event, type) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const block = yield event.getBlock();
                const amount = ethers_1.ethers.utils.formatUnits((_a = event.args) === null || _a === void 0 ? void 0 : _a.value, token.decimals);
                history.transactions.push({
                    tokenAddress: token.address,
                    amount: `${amount} ${token.symbol}`,
                    timestamp: block.timestamp,
                    type,
                    hash: event.transactionHash,
                    blockNumber: block.number
                });
            });
            // Process events in parallel
            yield Promise.all([
                ...buyEvents.map(event => processEvent(event, 'buy')),
                ...sellEvents.map(event => processEvent(event, 'sell'))
            ]);
            // Sort transactions by timestamp (newest first)
            history.transactions.sort((a, b) => b.timestamp - a.timestamp);
        }
        catch (error) {
            console.error('Error fetching trade history:', error);
        }
        return history;
    });
}
/**
 * Checks if an address has made any trades above the minimum amount
 * @param address Address to check
 * @param config Trading configuration
 * @param timeWindow Time window in seconds to check (default: 1 hour)
 * @returns Boolean indicating if address is active
 */
function isActiveTrader(address_1, config_1) {
    return __awaiter(this, arguments, void 0, function* (address, config, timeWindow = 3600 // 1 hour
    ) {
        const history = yield getTradeHistory(address, config, 100); // Look back 100 blocks
        const currentTime = Math.floor(Date.now() / 1000);
        return history.transactions.some(tx => {
            const timeDiff = currentTime - tx.timestamp;
            const amountNum = parseFloat(tx.amount.split(' ')[0]);
            const minAmount = parseFloat(ethers_1.ethers.utils.formatUnits(config.minimumAmount, config.token.decimals));
            return timeDiff <= timeWindow && amountNum >= minAmount;
        });
    });
}
/**
 * Starts continuous whale monitoring
 * @param whaleAddress Whale address to monitor
 * @param config Trading configuration
 * @param onTrade Callback function for each trade
 * @returns Cleanup function to stop monitoring
 */
const startWhaleMonitoring = (whaleAddress, config, onTrade) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionKey = `${whaleAddress}_${config.token.symbol}`;
    activeMonitoringSessions.set(sessionKey, true);
    // Start monitoring in background
    (() => __awaiter(void 0, void 0, void 0, function* () {
        let lastBlockNumber = yield config.provider.getBlockNumber();
        while (activeMonitoringSessions.get(sessionKey)) {
            try {
                const currentBlockNumber = yield config.provider.getBlockNumber();
                if (currentBlockNumber > lastBlockNumber) {
                    const transaction = yield monitorWhaleAddress(whaleAddress, Object.assign(Object.assign({}, config), { blocksToScan: currentBlockNumber - lastBlockNumber }));
                    if (transaction) {
                        yield onTrade(transaction);
                    }
                    lastBlockNumber = currentBlockNumber;
                }
                // Wait for 12 seconds (average block time on BASE)
                yield new Promise(resolve => setTimeout(resolve, 12000));
            }
            catch (error) {
                console.error('Error monitoring whale address:', error);
                // Wait before retrying on error
                yield new Promise(resolve => setTimeout(resolve, 30000));
            }
        }
    }))();
    // Return cleanup function
    return () => {
        activeMonitoringSessions.set(sessionKey, false);
    };
});
exports.startWhaleMonitoring = startWhaleMonitoring;
