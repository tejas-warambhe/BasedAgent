# Whale Trade Tracking Bot

A Telegram bot for monitoring and analyzing whale trading activities on the BASE network. Track significant trades, analyze trading history, and monitor whale wallet activities in real-time.

## Features

- 🐋 **Whale Trade Monitoring**: Track significant trades from known whale addresses
- 📊 **Balance Checking**: View your ETH and USDC balances on BASE
- 📈 **Trade History**: Analyze trading history for any address
- 🔍 **Active Trader Detection**: Identify actively trading addresses
- 🤖 **AI-Powered**: Integrated with AI agent for enhanced functionality

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
   ```
4. Start the bot:
   ```bash
   npm start
   ```

## Environment Variables

- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token from BotFather

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
│   ├── ai agent/
│   │   └── agentFunctions.ts
│   ├── helpers/
│   │   ├── copyTrade.ts
│   │   └── getBalance.ts
│   ├── types/
│   │   └── trading.ts
│   └── data/
│       └── traders.ts
├── bot.ts
├── package.json
└── .env
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own purposes.