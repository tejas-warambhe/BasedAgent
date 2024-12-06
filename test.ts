import { Alchemy, Network } from "alchemy-sdk";
import { ethers, utils } from "ethers";

const apiKey = 'YccgqlOoLQ1RcnSi1KyRBe1zWz3tkCSo';
const settings = {
  apiKey: apiKey,
  network: Network.BASE_MAINNET
};

const alchemy = new Alchemy(settings);
const filetering = {
    address: '0x997020E5F59cCB79C74D527Be492Cc610CB9fA2B',
}
const parseWowTokenCreatedLogs = (logs: any) => {
  return logs.map((log: any) => {
    try {
      // Decode the log using ethers
      const decodedLog = {
        factoryAddress: ethers.utils.getAddress(log.topics[1].slice(26)),
        tokenCreator: ethers.utils.getAddress(log.topics[2].slice(26)),
        
        // Decode the rest of the parameters from the log data
        data: ethers.utils.defaultAbiCoder.decode(
          [
            'address', // platformReferrer
            'address', // protocolFeeRecipient
            'address', // bondingCurve
            'string',  // tokenURI
            'string',  // name
            'string',  // symbol
            'address', // tokenAddress
            'address'  // poolAddress
          ],
          log.data
        )
      };

      return {
        factoryAddress: decodedLog.factoryAddress,
        tokenCreator: decodedLog.tokenCreator,
        platformReferrer: decodedLog.data[0],
        protocolFeeRecipient: decodedLog.data[1],
        bondingCurve: decodedLog.data[2],
        tokenURI: decodedLog.data[3],
        name: decodedLog.data[4],
        symbol: decodedLog.data[5],
        tokenAddress: decodedLog.data[6],
        poolAddress: decodedLog.data[7]
      };
    } catch (error) {
      console.error('Error parsing log:', error);
      return null;
    }
  }).filter((log: any) => log !== null);
};

const main = async () => {
  try {
    // alchemy.ws.on( {
    //     address: filetering.address,
    // } , (log) => {
    //     console.log('New log:', log);
    //     const parsedLogs = parseWowTokenCreatedLogs(log);
    //     console.log('Parsed Logs:', JSON.stringify(parsedLogs, null, 2));
    // });
    const logs = await alchemy.core.getLogs({
      fromBlock: "0x1646EA3",
      address: "0x997020E5F59cCB79C74D527Be492Cc610CB9fA2B",
      topics: [
        "0xc14d4a89f40f2ad9a3bacaae76b1d8567b797e367ed13e62996afbb52625457f",
        "0x000000000000000000000000997020e5f59ccb79c74d527be492cc610cb9fa2b",
        "0x000000000000000000000000282e626f1635669c075183867347b5d91c9e7ed1",
      ],
    });

    const parsedLogs = parseWowTokenCreatedLogs(logs);
    console.log('Parsed Logs:', JSON.stringify(parsedLogs, null, 2));
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
};

const runMain = async () => {
  try {
    await main();
  } catch (error) {
    console.log(error);
  }
};

runMain();