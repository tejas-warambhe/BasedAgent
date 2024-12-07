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
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const telegramToken = process.env.TELEGRAM_TOKEN_SENTINENT;
const openaiToken = process.env.OPENAI_API_KEY;
if (!telegramToken || !openaiToken) {
    throw new Error('Missing required environment variables');
}
const bot = new node_telegram_bot_api_1.default(telegramToken, { polling: true });
const openai = new openai_1.default({ apiKey: openaiToken });
function analyzeMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield openai.chat.completions.create({
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
        }
        catch (error) {
            console.error('Error analyzing message:', error);
            return { isTradingCall: false, ticker: null, type: null };
        }
    });
}
// Listen for any kind of message
bot.on('channel_post', (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (!msg.text)
        return;
    console.log('Received message:', msg.text);
    const analysis = yield analyzeMessage(msg.text);
    if (analysis.isTradingCall && analysis.ticker) {
        console.log(`Trading Call Detected!`);
        console.log(`Ticker: ${analysis.ticker}`);
        console.log(`Type: ${analysis.type}`);
        // You can add your custom logic here to handle the trading call
        // For example, store it in a database, send notifications, etc.
    }
}));
console.log('Bot is running...');
