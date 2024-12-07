import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { initializeAgent } from './helpers/agentFunctions';
import { getWalletBalances } from './helpers/getBalance';
import { traders } from './data/traders';
import { ethers } from 'ethers';
import { TradeConfig } from './types/trading';
// import { setupWhaleCommands } from './src/commands/whaleCommands';

// Load environment variables
dotenv.config();

// Replace 'YOUR_BOT_TOKEN' with your actual bot token from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined in .env file');
}

export const initializeTelegramBot = async () => {
        // Create a bot instance
    const bot = new TelegramBot(token, { polling: true });
 
    // Initialize bot commands
    // setupWhaleCommands(bot);

    // Handle /start command
    bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        // Initialize agent and get wallet address
        const { walletAddress } = await initializeAgent();
        const balance = await getWalletBalances(walletAddress || '');
        
        if (walletAddress) {
        await bot.sendMessage(chatId, `Your onchain agent wallet address is: ${walletAddress}. Fund it with some USDC and ETH on BASE to start trading.`);
        await bot.sendMessage(chatId, `Your ETH balance is: ${balance.eth}`);
        await bot.sendMessage(chatId, `Your USDC balance is: ${balance.usdc}`);
        } else {
        await bot.sendMessage(chatId, 'No wallet address found.');
        }
    } catch (error) {
        console.error('Error in /start command:', error);
        await bot.sendMessage(chatId, 'Error initializing agent. Please try again later.');
    }
    });

    bot.onText(/\/balance/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        // Initialize agent and get wallet address
        const { walletAddress } = await initializeAgent();
        const balance = await getWalletBalances(walletAddress || '');
        await bot.sendMessage(chatId, `Your ETH balance is: ${balance.eth}`);
        await bot.sendMessage(chatId, `Your USDC balance is: ${balance.usdc}`);
    } catch (error) {
        console.error('Error in /balance command:', error);
        await bot.sendMessage(chatId, 'Error getting balance. Please try again later.');
    }
    });

}