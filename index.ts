import express from 'express';
import connectDB from "./src/config/db";
import { startAgent } from './test';
import { initializeTelegramBot } from './bot';
const app = express();
const PORT= process.env.PORT || 4001;

app.use(express.json());

const main = async () => {

    
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

connectDB().then(async () => {
    await main();
    await startAgent();
    await initializeTelegramBot();
})