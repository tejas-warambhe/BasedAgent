import { Alchemy, Network } from "alchemy-sdk";
import dotenv from "dotenv";
import { traders } from "../data/traders";
import Snipe from "../models/Snipe";
import { sendNotification } from "../telegramBot";
import { buyWowToken, initializeAgent } from "./agentFunctions";

dotenv.config();

const MONITOR_ADDRESS = "0xA86275c0fa6de82eb4a4D5DCe5A9bBf60984fC41";

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
  network: Network.BASE_MAINNET, // Replace with your network.
};
const alchemy = new Alchemy(settings);

export const blockMonitor = async (blockNumber: number) => {
  let erc20Addresses: any[] = [];
  let tokenData: any[] = [];

  const params = {
    blockNumber: blockNumber.toString(),
  };
  let response = await alchemy.core.getTransactionReceipts(params);

  for (let index = 0; index < response?.receipts?.length!; index++) {
    const element = response?.receipts?.[index];

    try {
      const contract = element?.to;
      const metadata = await alchemy.core.getTokenMetadata(contract!);

      if (metadata.decimals !== 0 || metadata.decimals !== undefined || metadata.decimals !== null) {
        erc20Addresses.push(element);
        tokenData.push(metadata.symbol, metadata.decimals, metadata.name, metadata.logo);
      }

      // console.log(MONITOR_ADDRESS.toString().toLowerCase() == element?.from!.toString().toLowerCase())
      if (MONITOR_ADDRESS.toString().toLowerCase() == element?.from!.toString().toLowerCase()) {
        // const erc20Transfers = erc20Addresses.filter((address) => address.from === element?.from);
        // Find subscribed users for this trader address
        const subscription = await Snipe.find({
          traderAddress: element?.from.toString().toLowerCase(),
        });
        console.log("this is sub", subscription);
        if (subscription.length > 0) {
          const { agent, config } = await initializeAgent();
          await buyWowToken(
            agent,
            config,
            element?.to!,
        );
          for (let index = 0; index < subscription.length; index++) {
            sendNotification(subscription[index].chatId, `Buying ${subscription[index].traderAddress}'s recent trade! Token with address: ${element?.to}`);
          }
        }
      }
    } catch (error) {
      console.log('not erc20');
    } 
  }

};

export const snipeCall = async () => {
// Subscribe to new blocks, or newHeads
alchemy.ws.on("block", (blockNumber) => {
  blockMonitor(blockNumber);
});
};