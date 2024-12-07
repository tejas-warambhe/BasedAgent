import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const telegramToken = "8010496670:AAE-GcfRbsY2ChM-qRJzOZk-MK_xFLGukVU";
const openaiToken = process.env.OPENAI_API_KEY;

if (!telegramToken || !openaiToken) {
    throw new Error('Missing required environment variables');
}

export async function initializeSentimentTrackerServer() {
    const bot = new TelegramBot(telegramToken);
    const openai = new OpenAI({ apiKey: openaiToken });

    async function analyzeMessage(message: string) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a sentiment analysis assistant. Analyze the sentiment of the following message and respond with 'positive', 'negative', or 'neutral'."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            });

            return response.choices[0].message.content?.toLowerCase();
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            return 'error';
        }
    }

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const message = msg.text;

        if (message) {
            try {
                const sentiment = await analyzeMessage(message);
                
                let responseText = '';
                switch (sentiment) {
                    case 'positive':
                        responseText = '😊 Positive sentiment detected!';
                        break;
                    case 'negative':
                        responseText = '😞 Negative sentiment detected.';
                        break;
                    case 'neutral':
                        responseText = '😐 Neutral sentiment detected.';
                        break;
                    default:
                        responseText = 'Unable to analyze sentiment.';
                }

                bot.sendMessage(chatId, responseText);
            } catch (error) {
                console.error('Error processing message:', error);
                bot.sendMessage(chatId, 'Sorry, I encountered an error processing your message.');
            }
        }
    });

    console.log('Sentiment Tracker Server initialized');
}

// If this file is run directly (for standalone server)
if (require.main === module) {
    initializeSentimentTrackerServer().catch(console.error);
}
