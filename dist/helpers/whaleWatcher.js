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
exports.isSubscribed = exports.getWhaleSubscribers = exports.unsubscribeFromWhale = exports.subscribeToWhale = exports.initializeWhaleWatcher = void 0;
const ethers_1 = require("ethers");
const web3_1 = require("../config/web3");
const WhaleTracker_schema_1 = __importDefault(require("../models/WhaleTracker.schema"));
const traders_1 = require("../data/traders");
// Store active subscriptions in memory
const subscriptions = new Map(); // whaleAddress -> Set of chatIds
const initializeWhaleWatcher = (bot) => {
    // Set up block monitoring
    web3_1.provider.on('block', (blockNumber) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const block = yield web3_1.provider.getBlock(blockNumber, true);
            if (!block || !block.transactions)
                return;
            // Check each transaction in the block
            for (const tx of block.transactions) {
                yield processTransaction(tx, bot);
            }
        }
        catch (error) {
            console.error('Error processing block:', error);
        }
    }));
};
exports.initializeWhaleWatcher = initializeWhaleWatcher;
const processTransaction = (tx, bot) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if transaction involves any of our tracked whales
        const whale = traders_1.traders.find(trader => {
            var _a;
            return trader.address.toLowerCase() === tx.from.toLowerCase() ||
                trader.address.toLowerCase() === ((_a = tx.to) === null || _a === void 0 ? void 0 : _a.toLowerCase());
        });
        if (!whale)
            return;
        const receipt = yield web3_1.provider.getTransactionReceipt(tx.hash);
        if (!receipt)
            return;
        // Get transaction value in ETH
        const valueInEth = ethers_1.ethers.utils.formatEther(tx.value);
        const isOutgoing = tx.from.toLowerCase() === whale.address.toLowerCase();
        // Store transaction in database
        const whaleActivity = new WhaleTracker_schema_1.default({
            whaleAddress: whale.address,
            transactionHash: tx.hash,
            transactionType: isOutgoing ? 'SELL' : 'BUY',
            amount: valueInEth,
            timestamp: new Date(),
            network: 'BASE',
            status: receipt.status === 1 ? 'SUCCESS' : 'FAILED'
        });
        yield whaleActivity.save();
        // Notify subscribers
        const subscribers = subscriptions.get(whale.address.toLowerCase());
        if (subscribers) {
            const message = formatWhaleAlert(whale, tx, valueInEth, isOutgoing);
            subscribers.forEach(chatId => {
                bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            });
        }
    }
    catch (error) {
        console.error('Error processing transaction:', error);
    }
});
const formatWhaleAlert = (whale, tx, value, isOutgoing) => {
    return `🚨 *Whale Alert!* 🐋\n\n` +
        `*${whale.name}* has ${isOutgoing ? 'sent' : 'received'}:\n` +
        `💰 *${value} ETH*\n\n` +
        `${isOutgoing ? 'To' : 'From'}: \`${isOutgoing ? tx.to : tx.from}\`\n` +
        `Transaction: [View on Explorer](https://basescan.org/tx/${tx.hash})\n\n` +
        `_${whale.description}_`;
};
// Subscribe a chat to a whale's transactions
const subscribeToWhale = (whaleAddress, chatId) => {
    var _a;
    const normalizedAddress = whaleAddress.toLowerCase();
    if (!subscriptions.has(normalizedAddress)) {
        subscriptions.set(normalizedAddress, new Set());
    }
    (_a = subscriptions.get(normalizedAddress)) === null || _a === void 0 ? void 0 : _a.add(chatId);
};
exports.subscribeToWhale = subscribeToWhale;
// Unsubscribe a chat from a whale's transactions
const unsubscribeFromWhale = (whaleAddress, chatId) => {
    var _a, _b;
    const normalizedAddress = whaleAddress.toLowerCase();
    (_a = subscriptions.get(normalizedAddress)) === null || _a === void 0 ? void 0 : _a.delete(chatId);
    if (((_b = subscriptions.get(normalizedAddress)) === null || _b === void 0 ? void 0 : _b.size) === 0) {
        subscriptions.delete(normalizedAddress);
    }
};
exports.unsubscribeFromWhale = unsubscribeFromWhale;
// Get all subscribers for a whale
const getWhaleSubscribers = (whaleAddress) => {
    return Array.from(subscriptions.get(whaleAddress.toLowerCase()) || []);
};
exports.getWhaleSubscribers = getWhaleSubscribers;
// Check if a chat is subscribed to a whale
const isSubscribed = (whaleAddress, chatId) => {
    var _a;
    return ((_a = subscriptions.get(whaleAddress.toLowerCase())) === null || _a === void 0 ? void 0 : _a.has(chatId)) || false;
};
exports.isSubscribed = isSubscribed;
