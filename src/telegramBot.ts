import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { initializeAgent } from './helpers/agentFunctions';
import { getWalletBalances } from './helpers/getBalance';
import { traders } from './data/traders';
import { ethers } from 'ethers';
import { TradeConfig } from './types/trading';
import Snipe from './models/Snipe';
// import { saveTraderSelection } from './helpers/traderSelection';

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

    bot.onText(/\/snipe/, async (msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
        reply_markup: {
            inline_keyboard: traders.map(trader => [{
                text: `${trader.name} - ${trader.description}`,
                callback_data: `snipe_${trader.id}`
            }])
        }
    };
    await bot.sendMessage(chatId, 'Choose a trader to snipe:', keyboard);
});

    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const data = callbackQuery.data;

        if (data && data.startsWith('snipe_')) {
            const traderId = data.split('_')[1];
            const trader = traders.find(t => t.id === traderId);

            if (trader && msg) {
                const chatId = msg.chat.id;
                const username = msg.chat.username || 'Unknown';

                try {
                    const newSnipe = new Snipe({
                        chatId,
                        username,
                        traderId,
                        traderAddress: trader.address
                    });
                    newSnipe.save();

                    
                    await bot.answerCallbackQuery(callbackQuery.id, { 
                        text: `Selected trader: ${trader.name}` 
                    });

                    await bot.sendMessage(chatId, `You have selected trader: ${trader.name}`);
                } catch (error) {
                    console.error('Error saving snipe selection:', error);
                    await bot.sendMessage(chatId, 'Error processing your selection. Please try again.');
                }
            }
        }
    });
}