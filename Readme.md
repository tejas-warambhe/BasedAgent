# Based Agent

A Telegram bot that is based enough to trade degen memecoins on wow.xyz as per sentimental analysis of telegram group messages and trade history.
The agent is strong enough to identify whitelisted whale trades from live transactional data.
We are using Base Agentkit, a lot of rules and conditions to handle complex trading scenarios.

## Features

- Trades on your behalf on wow.xyz (degen memecoin platform) before even the bonding curve is converted.
- Initializes the bot with your wallet details
- Monitors sentiment in a Telegram group
- Identifies whitelisted whale trades
- Monitors your ETH and USDC balances
- Monitors whale trades and sends notifications

## Commands

- `/start` - Initialize the bot and view your wallet details
- `/balance` - Check your current ETH and USDC balances
- `/copytrade <token> <amount>` - Monitor whale trades (e.g., `/copytrade USDC 1000`)
- `/tradehistory <address> <token>` - View trading history for an address
- `/active <address>` - Check if an address is actively trading

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token
   CDP_API_KEY_NAME=your_api_key_name
   CDP_API_KEY_PRIVATE_KEY=your_api_key_private_key
   OPENAI_API_KEY=your_openai_api_key
   MONGO_URI=your_mongodb_uri
   TELEGRAM_TOKEN_SENTIMENT=your_telegram_bot_token
   OPENAI_API_KEY=your_openai_api_key
   ALCHEMY_API_KEY=your_alchemy_api_key
   ```
4. Start the bot:
   ```bash
   npm start
   ```

## Environment Variables

TELEGRAM_BOT_TOKEN=your_bot_token
CDP_API_KEY_NAME=your_api_key_name
CDP_API_KEY_PRIVATE_KEY=your_api_key_private_key
OPENAI_API_KEY=your_openai_api_key
MONGO_URI=your_mongodb_uri
TELEGRAM_TOKEN_SENTIMENT=your_telegram_bot_token
OPENAI_API_KEY=your_openai_api_key
ALCHEMY_API_KEY=your_alchemy_api_key


## Supported Tokens

- USDC (Default minimum amount: 1000)
- ETH (Default minimum amount: 0.1)

## Technical Details

- Network: BASE Mainnet
- Provider: https://mainnet.base.org
- Built with: Node.js, TypeScript, ethers.js
- Dependencies: node-telegram-bot-api, ethers, dotenv

## Project Structure

```
├── src/
│   ├── agent.ts
│   ├── index.ts
│   ├── sentimentServer.ts
│   ├── telegramBot.ts
│   ├── commands/
│   │   └── ...
│   ├── config/
│   │   └── ...
│   ├── data/
│   │   └── ...
│   ├── helpers/
│   │   └── ...
│   ├── models/
│   │   └── ...
│   └── types/
│       └── ...
├── dist/
├── frontend/
├── node_modules/
├── reputation-data/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── wallet_data.txt
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own purposes.