import { Alchemy, Network } from "alchemy-sdk";
import dotenv from "dotenv";
import { traders } from "../data/traders";

dotenv.config();

const MONITOR_ADDRESS: string[] = traders.map((trader) => trader.address);

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

      if (MONITOR_ADDRESS.includes(element?.from!)) {
        const erc20Transfers = erc20Addresses.filter((address) => address.from === element?.from);        
      }
    } catch (error) {
      console.log('not erc20');
    }
  }
  
  // Subscribe to new blocks, or newHeads
  alchemy.ws.on("block", (blockNumber) => {
    blockMonitor(blockNumber);
      console.log("Latest block:", blockNumber)
  });
};

