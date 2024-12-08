import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { buyWowToken, initializeAgent, sellWoWToken } from './helpers/agentFunctions';
import TokenSchema from './models/Token.schema';
import { sendNotification } from './telegramBot';
import MemeTracker from './models/MemeTracker.scema';

dotenv.config();

const telegramToken = "8010496670:AAE-GcfRbsY2ChM-qRJzOZk-MK_xFLGukVU";
const openaiToken = process.env.OPENAI_API_KEY;

if (!telegramToken || !openaiToken) {
    throw new Error('Missing required environment variables');
}

const bot = new TelegramBot(telegramToken, { polling: true });
const openai = new OpenAI({ apiKey: openaiToken });

export const initializeSentimentTracker = () => {

    async function analyzeMessage(message: string) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    // content: "You are a trading analyst. Analyze the given message and determine if it's a trading call. If it is, extract the ticker symbol. Return JSON in this format: {isTradingCall: boolean, ticker: string or null, type: 'buy' or 'sell' or null}"
                    content: "You are a person who is always concise and to the point, never misses any important detail provided as input, so now you have to analyze the given message where the ticker would be a token whose prefix is $ (for example $COW, here the ticker is COW, your task is to determine the sentiment in binary terms which is either buy or sell, there's no middle grould, the format should always Return JSON in this format: {isTradingCall: boolean, ticker: string or null, type: 'buy' or 'sell'}"
                }, {
                    role: "user",
                    content: message
                }],
                temperature: 0.7,
            });

            const analysis = JSON.parse(response.choices[0].message.content || '{}');
            return analysis;
        } catch (error) {
            console.error('Error analyzing message:', error);
            return { isTradingCall: false, ticker: null, type: null };
        }
    }

    // Listen for any kind of message
    bot.on('channel_post', async (msg: any) => {
        console.log('debugging msg', msg);
        if (!msg.text) return;

        console.log('Received message:', msg.text);

        const analysis = await analyzeMessage(msg.text);

        if (analysis.isTradingCall && analysis.ticker) {
            console.log(`Trading Call Detected!`);
            console.log(`Ticker: ${analysis.ticker}`);
            console.log(`Type: ${analysis.type}`);
            const tickerDetails = await checkTickerAvailability(analysis.ticker);
            // Ticker is available
            if (tickerDetails != '') {
                console.log('Ticker is available');
                // getDeployedERC20Tokens(tickerDetails.tokenCreator, tickerDetails.tokenAddress);

                const { agent, config } = await initializeAgent();
                console.log('Chat Id', msg.chat.id);
                const chatIds = await MemeTracker.find({ chatId: msg.chat.id });
                console.log('Chat Id from DB', chatIds);
                if (analysis.type.toLowerCase() == 'buy') {
                    await buyWowToken(
                        agent,
                        config,
                        tickerDetails?.tokenAddress!,
                    );
                    chatIds.forEach(async (chat) => {
                        // await sendNotification(chat.chatId, `Bought a Token having address ${tickerDetails?.tokenAddress} and symbol ${tickerDetails?.symbol} worth 0.000138 ETH`);
                        await sendNotification(chat.chatId, `Bought a Token having address ${tickerDetails?.tokenAddress} and symbol ${tickerDetails?.symbol} worth 0.000138 ETH`);
                    });
                } else {
                    await sellWoWToken
                        (
                            agent,
                            config,
                            tickerDetails?.tokenAddress!,
                        );
                    chatIds.forEach(async (chat) => {   
                        await sendNotification(chat.chatId, `Sold a Token having address ${tickerDetails?.tokenAddress} and symbol ${tickerDetails?.symbol} worth 0.000138 ETH`);    

                    });
                }
            }
            // You can add your custom logic here to handle the trading call
            // For example, store it in a database, send notifications, etc.
        }
    });

    console.log('Bot is running...');
}

const checkTickerAvailability = async (ticker: string) => {
try{
    const findTicker = await TokenSchema.findOne({ symbol: ticker.toUpperCase() });

    if (findTicker) {
        return findTicker;
    }
    return '';
}catch(error){
    console.log(error);
}
   
}