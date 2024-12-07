import express from 'express';
import connectDB from "./config/db";
import { startAgent } from './agent';
import { initializeTelegramBot } from './telegramBot';
// import { startWhaleMonitoring } from './helpers/copyTrade';
import {initializeSentimentTracker} from './helpers/sentimentTracker';
// import { setupBlockMonitor } from './helpers/blockMonitor';
import { initializeSentimentTrackerServer } from './sentimentServer';
import { spawn } from 'child_process';
import path from 'path';

const app = express();
const PORT= process.env.PORT || 4000;

app.use(express.json());

const main = async () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

async function startSentimentTrackerServer() {
    return new Promise<void>((resolve, reject) => {
        const sentimentServerPath = path.join(__dirname, 'sentimentServer.ts');
        const sentimentServer = spawn('ts-node', [sentimentServerPath], {
            stdio: 'inherit',
            shell: true
        });

        sentimentServer.on('error', (error) => {
            console.error('Failed to start sentiment tracker server:', error);
            reject(error);
        });

        sentimentServer.on('close', (code) => {
            if (code === 0) {
                console.log('Sentiment Tracker Server closed successfully');
                resolve();
            } else {
                console.error(`Sentiment Tracker Server exited with code ${code}`);
                reject(new Error(`Sentiment Tracker Server exited with code ${code}`));
            }
        });
    });
}

(async () => {
    try {
        await connectDB();
        await main();
        await startAgent();
        await initializeTelegramBot();
        // await initializeSentimentTracker();
        // await startWhaleMonitoring();
        // setupBlockMonitor(3000);
        // Start Sentiment Tracker Server in a separate process
        // await startSentimentTrackerServer();
    } catch (error) {
        console.error('Error in main initialization:', error);
        process.exit(1);
    }
})();