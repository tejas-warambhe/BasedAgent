import { Alchemy, Network } from "alchemy-sdk";
import dotenv from "dotenv";
import { traders } from "../data/traders";

dotenv.config();

// const MONITOR_ADDRESS: string[] = traders.map((trader) => trader.address);

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
  network: Network.BASE_MAINNET, // Replace with your network.
};
const alchemy = new Alchemy(settings);

export const blockMonitor = async (blockNumber: number) => {
  const params = {
    blockNumber: blockNumber.toString(),
  };
  let response = await alchemy.core.getTransactionReceipts(params);

  for (let index = 0; index < response?.receipts?.length!; index++) {
    const element = response?.receipts?.[index];

    try {
      const contract = element?.to;
      console.log(contract);
      await alchemy.core.getTokenMetadata(contract!);
    } catch (error) {
    //   console.log('not erc20');
    }
  }
};
//   console.log("Latest block:", blockNumber)

// Subscribe to new blocks, or newHeads
alchemy.ws.on("block", (blockNumber) => {
  blockMonitor(blockNumber);
  //   console.log("Latest block:", blockNumber)
});
