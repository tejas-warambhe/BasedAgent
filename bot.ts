import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { initializeAgent } from './src/ai agent/agentFunctions';
import { getWalletBalances } from './src/helpers/getBalance';
import { traders } from './src/data/traders';
import {
    trackAllWhales,
    monitorWhaleAddress,
    formatTradeMessage,
    getTradeHistory,
    isActiveTrader,
    SUPPORTED_TOKENS
} from './src/helpers/copyTrade';
import { ethers } from 'ethers';
import { TradeConfig } from './src/types/trading';

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

    bot.onText(/\/copytrade(?:\s+(\w+))?(?:\s+(\d+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const tokenSymbol = (match?.[1] || 'USDC').toUpperCase();
        const customAmount = match?.[2];
        
        try {
            const token = SUPPORTED_TOKENS[tokenSymbol];
            if (!token) {
                const supportedSymbols = Object.keys(SUPPORTED_TOKENS).join(', ');
                await bot.sendMessage(chatId, `❌ Unsupported token. Available tokens: ${supportedSymbols}`);
                return;
            }

            // Create inline keyboard with trader options
            const keyboard = {
                inline_keyboard: traders.map(trader => [{
                    text: `${trader.name} - ${trader.description}`,
                    callback_data: `copy_${trader.id}_${tokenSymbol}_${customAmount || ''}`
                }])
            };

            await bot.sendMessage(
                chatId,
                `🔍 Select a whale trader to copy ${tokenSymbol} trades:`,
                { reply_markup: keyboard }
            );
            
        } catch (error) {
            console.error('Error in /copytrade command:', error);
            await bot.sendMessage(chatId, '❌ Error setting up copy trade. Please try again later.');
        }
    });

    // Handle inline keyboard callbacks for trader selection
    bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message?.chat.id;
        if (!chatId) return;

        const data = callbackQuery.data;
        if (!data?.startsWith('copy_')) return;

        const [, traderId, tokenSymbol, customAmount] = data.split('_');
        const trader = traders.find(t => t.id === traderId);
        if (!trader) return;

        try {
            const token = SUPPORTED_TOKENS[tokenSymbol];
            const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
            const defaultAmount = tokenSymbol === 'USDC' ? '1000' : '0.1';
            const amount = customAmount || defaultAmount;
            
            const config: TradeConfig = {
                provider,
                token,
                minimumAmount: ethers.utils.parseUnits(amount, token.decimals),
                blocksToScan: 10
            };
            
            await bot.sendMessage(
                chatId,
                `🔍 Monitoring ${trader.name}'s trades for ${amount} ${tokenSymbol}+ transactions...`
            );
            
            // Start monitoring specific trader
            const trade = await monitorWhaleAddress(trader.address, config);
            
            if (trade) {
                const message = formatTradeMessage(trader.name, trade);
                await bot.sendMessage(chatId, message);
            } else {
                await bot.sendMessage(
                    chatId,
                    `😴 No significant trades detected for ${trader.name} in the last few blocks.`
                );
            }
            
            // Remove inline keyboard after selection
            await bot.editMessageReplyMarkup(
                { inline_keyboard: [] },
                {
                    chat_id: chatId,
                    message_id: callbackQuery.message?.message_id
                }
            );

        } catch (error) {
            console.error('Error in trader selection:', error);
            await bot.sendMessage(chatId, '❌ Error monitoring trader. Please try again later.');
        }
    });

    bot.onText(/\/tradehistory (.+?)(?:\s+(\w+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const address = match?.[1];
        const tokenSymbol = (match?.[2] || 'USDC').toUpperCase();
        
        if (!address || !ethers.utils.isAddress(address)) {
            await bot.sendMessage(chatId, '❌ Please provide a valid Ethereum address.');
            return;
        }
        
        try {
            const token = SUPPORTED_TOKENS[tokenSymbol];
            if (!token) {
                const supportedSymbols = Object.keys(SUPPORTED_TOKENS).join(', ');
                await bot.sendMessage(chatId, `❌ Unsupported token. Available tokens: ${supportedSymbols}`);
                return;
            }

            const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
            const config: TradeConfig = {
                provider,
                token,
                minimumAmount: '0' // Get all trades for history
            };
            
            await bot.sendMessage(chatId, `🔍 Fetching ${tokenSymbol} trade history...`);
            
            const history = await getTradeHistory(address, config);
            
            if (history.transactions.length === 0) {
                await bot.sendMessage(chatId, '😴 No trades found for this address in the recent blocks.');
                return;
            }
            
            // Send the last 5 trades
            const recentTrades = history.transactions.slice(0, 5);
            const messages = recentTrades.map((trade, index) => {
                const emoji = trade.type === 'buy' ? '🟢' : '🔴';
                const time = new Date(trade.timestamp * 1000).toLocaleString();
                const txInfo = trade.hash ? `\nTx: ${trade.hash.slice(0, 10)}...` : '';
                return `${index + 1}. ${emoji} ${trade.type.toUpperCase()}: ${trade.amount}\n   📅 ${time}${txInfo}`;
            });
            
            await bot.sendMessage(chatId, `📊 Recent ${tokenSymbol} Trades:\n\n` + messages.join('\n\n'));
            
        } catch (error) {
            console.error('Error in /tradehistory command:', error);
            await bot.sendMessage(chatId, '❌ Error fetching trade history. Please try again later.');
        }
    });

    bot.onText(/\/active (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const address = match?.[1];
        
        if (!address || !ethers.utils.isAddress(address)) {
            await bot.sendMessage(chatId, '❌ Please provide a valid Ethereum address.');
            return;
        }
        
        try {
            const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
            const config: TradeConfig = {
                provider,
                token: SUPPORTED_TOKENS.USDC,
                minimumAmount: ethers.utils.parseUnits('1000', 6)
            };
            
            await bot.sendMessage(chatId, '🔍 Checking trading activity...');
            
            const isActive = await isActiveTrader(address, config);
            
            if (isActive) {
                await bot.sendMessage(chatId, '✅ This address has been actively trading in the last hour!');
            } else {
                await bot.sendMessage(chatId, '⚪ This address has not made any significant trades in the last hour.');
            }
            
        } catch (error) {
            console.error('Error in /active command:', error);
            await bot.sendMessage(chatId, '❌ Error checking trading activity. Please try again later.');
        }
    });


    // Log that bot is running
    console.log('Telegram bot is running...');

}