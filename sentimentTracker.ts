import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const telegramToken = process.env.TELEGRAM_TOKEN;
const openaiToken = process.env.OPENAI_API_KEY;

if (!telegramToken || !openaiToken) {
    throw new Error('Missing required environment variables');
}

const bot = new TelegramBot(telegramToken, { polling: true });
const openai = new OpenAI({ apiKey: openaiToken });

async function analyzeMessage(message: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "system",
                content: "You are a trading analyst. Analyze the given message and determine if it's a trading call. If it is, extract the ticker symbol. Return JSON in this format: {isTradingCall: boolean, ticker: string or null, type: 'buy' or 'sell' or null}"
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
bot.on('channel_post', async (msg:any) => {
    if (!msg.text) return;

    console.log('Received message:', msg.text);
    
    const analysis = await analyzeMessage(msg.text);
    
    if (analysis.isTradingCall && analysis.ticker) {
        console.log(`Trading Call Detected!`);
        console.log(`Ticker: ${analysis.ticker}`);
        console.log(`Type: ${analysis.type}`);
        
        // You can add your custom logic here to handle the trading call
        // For example, store it in a database, send notifications, etc.
    }
});

console.log('Bot is running...');
