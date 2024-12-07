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
exports.getAllTrackedWhales = exports.getWhaleSubscribers = exports.unsubscribeFromWhale = exports.subscribeToWhale = void 0;
const WhaleTracker_schema_1 = __importDefault(require("../models/WhaleTracker.schema"));
// Keep track of active subscriptions in memory
const activeSubscriptions = new Map();
/**
 * Start tracking a whale's wallet address
 * @param whaleAddress The address to track
 * @param chatId Telegram chat ID to notify
 */
const subscribeToWhale = (whaleAddress, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedAddress = whaleAddress.toLowerCase();
    if (!activeSubscriptions.has(normalizedAddress)) {
        activeSubscriptions.set(normalizedAddress, {
            whaleAddress: normalizedAddress,
            chatIds: [chatId]
        });
        // Start monitoring this address
        startMonitoringWhale(normalizedAddress);
    }
    else {
        const subscription = activeSubscriptions.get(normalizedAddress);
        if (!subscription.chatIds.includes(chatId)) {
            subscription.chatIds.push(chatId);
        }
    }
});
exports.subscribeToWhale = subscribeToWhale;
/**
 * Stop tracking a whale for a specific chat
 */
const unsubscribeFromWhale = (whaleAddress, chatId) => {
    const normalizedAddress = whaleAddress.toLowerCase();
    const subscription = activeSubscriptions.get(normalizedAddress);
    if (subscription) {
        subscription.chatIds = subscription.chatIds.filter(id => id !== chatId);
        if (subscription.chatIds.length === 0) {
            activeSubscriptions.delete(normalizedAddress);
        }
    }
};
exports.unsubscribeFromWhale = unsubscribeFromWhale;
/**
 * Start monitoring a whale's address for transactions
 */
const startMonitoringWhale = (whaleAddress) => {
    provider.on('block', (blockNumber) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const block = yield provider.getBlock(blockNumber, true);
            if (!block || !block.transactions)
                return;
            // Filter transactions involving the whale address
            const relevantTxs = block.transactions.filter(tx => {
                var _a, _b;
                return ((_a = tx.from) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === whaleAddress.toLowerCase() ||
                    ((_b = tx.to) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === whaleAddress.toLowerCase();
            });
            for (const tx of relevantTxs) {
                try {
                    const receipt = yield provider.getTransactionReceipt(tx.hash);
                    if (!receipt)
                        continue;
                    // Get token transfer details
                    const txDetails = yield getTransactionDetails(tx, receipt);
                    if (!txDetails)
                        continue;
                    // Store in database
                    const whaleActivity = new WhaleTracker_schema_1.default({
                        whaleAddress,
                        tokenAddress: txDetails.tokenAddress,
                        tokenSymbol: txDetails.tokenSymbol,
                        transactionHash: tx.hash,
                        transactionType: tx.from.toLowerCase() === whaleAddress.toLowerCase() ? 'SELL' : 'BUY',
                        amount: txDetails.amount,
                        amountUSD: txDetails.amountUSD,
                        timestamp: new Date(),
                        network: 'BASE',
                        priceImpact: txDetails.priceImpact,
                        status: receipt.status === 1 ? 'SUCCESS' : 'FAILED'
                    });
                    yield whaleActivity.save();
                    // Notify subscribers
                    notifySubscribers(whaleAddress, whaleActivity);
                }
                catch (error) {
                    console.error('Error processing transaction:', error);
                }
            }
        }
        catch (error) {
            console.error('Error monitoring whale:', error);
        }
    }));
};
/**
 * Get detailed information about a transaction
 */
const getTransactionDetails = (tx, receipt) => __awaiter(void 0, void 0, void 0, function* () {
    // Implement token transfer detection and price impact calculation
    // This is a placeholder - you'll need to implement the specific logic
    // based on your requirements
    try {
        // You'll need to:
        // 1. Decode transfer events
        // 2. Get token prices
        // 3. Calculate USD value
        // 4. Calculate price impact
        return {
            tokenAddress: '', // Get from event
            tokenSymbol: '', // Get from token contract
            amount: '0', // Get from transfer event
            amountUSD: 0, // Calculate based on token price
            priceImpact: 0 // Calculate based on pool reserves
        };
    }
    catch (error) {
        console.error('Error getting transaction details:', error);
        return null;
    }
});
/**
 * Notify subscribers about whale activity
 */
const notifySubscribers = (whaleAddress, activity) => {
    const subscription = activeSubscriptions.get(whaleAddress.toLowerCase());
    if (!subscription)
        return;
    // Here you would implement the notification logic
    // For example, sending a message via Telegram bot
    const message = `🐋 Whale Activity Detected!\n
Address: ${activity.whaleAddress}\n
Type: ${activity.transactionType}\n
Amount: ${activity.amount} ${activity.tokenSymbol}\n
Value: $${activity.amountUSD.toFixed(2)}\n
TX: ${activity.transactionHash}`;
    // Notify each subscribed chat
    subscription.chatIds.forEach(chatId => {
        // Implement your notification logic here
        // For example: bot.sendMessage(chatId, message);
    });
};
// Export functions to get subscription information
const getWhaleSubscribers = (whaleAddress) => {
    var _a;
    return ((_a = activeSubscriptions.get(whaleAddress.toLowerCase())) === null || _a === void 0 ? void 0 : _a.chatIds) || [];
};
exports.getWhaleSubscribers = getWhaleSubscribers;
const getAllTrackedWhales = () => {
    return Array.from(activeSubscriptions.keys());
};
exports.getAllTrackedWhales = getAllTrackedWhales;
