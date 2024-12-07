import { Alchemy, Network } from "alchemy-sdk";
import { ethers, utils } from "ethers";
import { buyWowToken, initializeAgent, sellWoWToken } from "./src/ai agent/agentFunctions";
import Web3 from "web3";
import Token from "./src/models/Token.schema";

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
    
    // Initialise the agent
    const {agent, config} = await initializeAgent();
    const web3 = new Web3(
      new Web3.providers.WebsocketProvider(
        "wss://base-mainnet.g.alchemy.com/v2/YccgqlOoLQ1RcnSi1KyRBe1zWz3tkCSo",
      ),
    );
    
    const contract = new web3.eth.Contract([
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "factoryAddress",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "tokenCreator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "platformReferrer",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "protocolFeeRecipient",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "bondingCurve",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "tokenURI",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "symbol",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "poolAddress",
            "type": "address"
          }
        ],
        "name": "WowTokenCreated",
        "type": "event"
      }
    ], '0x997020E5F59cCB79C74D527Be492Cc610CB9fA2B');
    
    const subscription = contract.events.WowTokenCreated({
      fromBlock: 23370071,
      // fromBlock: 'latest',
    })
    .on('data', async (event: any) => {
      console.log('Event:', event);
      const parsedLogs = parseWowTokenCreatedLogs([event.raw]);
      console.log('Parsed Logs:', JSON.stringify(parsedLogs, null, 2));

      const createToken = new Token({
        tokenAddress: event.returnValues.tokenAddress,
        tokenCreator: event.returnValues.tokenCreator,
        tokenURI: event.returnValues.tokenURI,
        name: event.returnValues.name,
        symbol: event.returnValues.symbol,
        poolAddress: event.returnValues.poolAddress,
      });
      await createToken.save();
      // purchase the token
      // await buyWowToken(agent, config, parsedLogs[0].tokenAddress);
      // await sellWoWToken(agent, config, '0xA8b33002Ce7Ad8D81479Dc82110D1c31dbab7178');
    })

    // await buyWowToken(agent, config, parsedLogs[0].tokenAddress);
    // await sellWoWToken(agent, config, '0xA8b33002Ce7Ad8D81479Dc82110D1c31dbab7178');
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
};

export const startAgent = async () => {
  try {
    await main();
  } catch (error) {
    console.log(error);
  }
};