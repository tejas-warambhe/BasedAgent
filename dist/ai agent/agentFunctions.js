"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyWowToken = exports.sellWoWToken = void 0;
exports.initializeAgent = initializeAgent;
const cdp_agentkit_core_1 = require("@coinbase/cdp-agentkit-core");
const cdp_langchain_1 = require("@coinbase/cdp-langchain");
const messages_1 = require("@langchain/core/messages");
const langgraph_1 = require("@langchain/langgraph");
const prebuilt_1 = require("@langchain/langgraph/prebuilt");
const openai_1 = require("@langchain/openai");
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
const ethers_1 = require("ethers");
dotenv.config();
/**
 * Validates that required environment variables are set
 *
 * @throws {Error} - If required environment variables are missing
 * @returns {void}
 */
function validateEnvironment() {
    const missingVars = [];
    // Check required variables
    const requiredVars = ["OPENAI_API_KEY", "CDP_API_KEY_NAME", "CDP_API_KEY_PRIVATE_KEY"];
    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    });
    // Exit if any required variables are missing
    if (missingVars.length > 0) {
        console.error("Error: Required environment variables are not set");
        missingVars.forEach(varName => {
            console.error(`${varName}=your_${varName.toLowerCase()}_here`);
        });
        process.exit(1);
    }
    // Warn about optional NETWORK_ID
    if (!process.env.NETWORK_ID) {
        console.warn("Warning: NETWORK_ID not set, defaulting to base-sepolia testnet");
    }
}
// Add this right after imports and before any other code
validateEnvironment();
// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = "wallet_data.txt";
/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
function initializeAgent() {
    return __awaiter(this, void 0, void 0, function* () {
        let walletAddress = null;
        try {
            // Initialize LLM
            const llm = new openai_1.ChatOpenAI({
                model: "gpt-4o-mini",
            });
            let walletDataStr = null;
            // Read existing wallet data if available
            if (fs.existsSync(WALLET_DATA_FILE)) {
                try {
                    walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
                    const walletData = JSON.parse(walletDataStr);
                    walletAddress = walletData.defaultAddressId;
                }
                catch (error) {
                    console.error("Error reading wallet data:", error);
                    // Continue without wallet data
                }
            }
            // Configure CDP AgentKit
            const config = {
                cdpWalletData: walletDataStr || undefined,
                networkId: process.env.NETWORK_ID || "base-mainnet",
            };
            // Initialize CDP AgentKit
            const agentkit = yield cdp_agentkit_core_1.CdpAgentkit.configureWithWallet(config);
            // Initialize CDP AgentKit Toolkit and get tools
            const cdpToolkit = new cdp_langchain_1.CdpToolkit(agentkit);
            const tools = cdpToolkit.getTools();
            // Store buffered conversation history in memory
            const memory = new langgraph_1.MemorySaver();
            const agentConfig = { configurable: { thread_id: "CDP AgentKit Chatbot Example!" } };
            // Create React Agent using the LLM and CDP AgentKit tools
            const agent = (0, prebuilt_1.createReactAgent)({
                llm,
                tools,
                checkpointSaver: memory,
                messageModifier: `
        You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
        faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
        funds from the user. Before executing your first action, get the wallet details to see what network 
        you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
        asks you to do something you can't do with your currently available tools, you must say so, and 
        encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
        docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
        restating your tools' descriptions unless it is explicitly requested.
        `,
            });
            // Save wallet data
            const exportedWallet = yield agentkit.exportWallet();
            fs.writeFileSync(WALLET_DATA_FILE, exportedWallet);
            return { walletAddress, agent, config: agentConfig };
        }
        catch (error) {
            console.error("Failed to initialize agent:", error);
            throw error; // Re-throw to be handled by caller
        }
    });
}
/**
 * Run the agent autonomously with specified intervals
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 * @param interval - Time interval between actions in seconds
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function runAutonomousMode(agent_1, config_1) {
    return __awaiter(this, arguments, void 0, function* (agent, config, interval = 10) {
        var _a, e_1, _b, _c;
        console.log("Starting autonomous mode...");
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                const thought = "Be creative and do something interesting on the blockchain. " +
                    "Choose an action or set of actions and execute it that highlights your abilities.";
                const stream = yield agent.stream({ messages: [new messages_1.HumanMessage(thought)] }, config);
                try {
                    for (var _d = true, stream_1 = (e_1 = void 0, __asyncValues(stream)), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
                        _c = stream_1_1.value;
                        _d = false;
                        const chunk = _c;
                        if ("agent" in chunk) {
                            console.log(chunk.agent.messages[0].content);
                        }
                        else if ("tools" in chunk) {
                            console.log(chunk.tools.messages[0].content);
                        }
                        console.log("-------------------");
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                yield new Promise(resolve => setTimeout(resolve, interval * 1000));
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error("Error:", error.message);
                }
                process.exit(1);
            }
        }
    });
}
const checkBalance = (walletAddress, tokenAddress) => __awaiter(void 0, void 0, void 0, function* () {
    const balanceInterface = new ethers_1.ethers.utils.Interface([
        "function balanceOf(address) view returns (uint256)"
    ]);
    // find the token balance of the wallet address
    // const balance = await provider.call({
    const provider = new ethers_1.ethers.providers.JsonRpcProvider("https://base-mainnet.g.alchemy.com/v2/YccgqlOoLQ1RcnSi1KyRBe1zWz3tkCSo");
    const contract = new ethers_1.ethers.Contract(tokenAddress, balanceInterface, provider);
    const balance = yield contract.balanceOf(walletAddress);
    console.log(balance.toString());
    return balance.toString();
});
const sellWoWToken = (agent, config, tokenAddress) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_2, _b, _c;
    const balanceOfToken = yield checkBalance("0x8B4d279c1E74e9B0CBC5DBc1a3fF726F00DB3e93", tokenAddress);
    if (parseInt(balanceOfToken)) {
        const stream = yield agent.stream({
            messages: [
                new messages_1.HumanMessage(`Sell ${balanceOfToken} WoW Token having address ${tokenAddress}`),
            ],
        }, config);
        try {
            for (var _d = true, stream_2 = __asyncValues(stream), stream_2_1; stream_2_1 = yield stream_2.next(), _a = stream_2_1.done, !_a; _d = true) {
                _c = stream_2_1.value;
                _d = false;
                const chunk = _c;
                if ("agent" in chunk) {
                    console.log(chunk.agent.messages[0].content);
                }
                else if ("tools" in chunk) {
                    console.log(chunk.tools.messages[0].content);
                }
                console.log("-------------------");
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = stream_2.return)) yield _b.call(stream_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    else {
        console.log(`The balance of the token address ${tokenAddress} is 0`);
    }
});
exports.sellWoWToken = sellWoWToken;
const buyWowToken = (agent, config, tokenAddress) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_3, _b, _c;
    const stream = yield agent.stream({
        messages: [
            new messages_1.HumanMessage(`Buy a WoW Token having address ${tokenAddress} worth 0.000138 ETH`),
            // new HumanMessage(`Check balance of the token address ${tokenAddress} which is a WoW zora token and if it's greater than 0, sell it`),
            // new HumanMessage(`I want to know the amount of gas required to buy a WoW Token having address ${tokenAddress} worth 0.00001 ETH`),
        ],
    }, config);
    try {
        for (var _d = true, stream_3 = __asyncValues(stream), stream_3_1; stream_3_1 = yield stream_3.next(), _a = stream_3_1.done, !_a; _d = true) {
            _c = stream_3_1.value;
            _d = false;
            const chunk = _c;
            if ("agent" in chunk) {
                console.log(chunk.agent.messages[0].content);
            }
            else if ("tools" in chunk) {
                console.log(chunk.tools.messages[0].content);
            }
            console.log("-------------------");
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = stream_3.return)) yield _b.call(stream_3);
        }
        finally { if (e_3) throw e_3.error; }
    }
});
exports.buyWowToken = buyWowToken;
/**
 * Run the agent interactively based on user input
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function runChatMode(agent, config) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_4, _b, _c;
        console.log("Starting chat mode... Type 'exit' to end.");
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
        try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const userInput = yield question("\nPrompt: ");
                if (userInput.toLowerCase() === "exit") {
                    break;
                }
                const stream = yield agent.stream({ messages: [new messages_1.HumanMessage(userInput)] }, config);
                try {
                    for (var _d = true, stream_4 = (e_4 = void 0, __asyncValues(stream)), stream_4_1; stream_4_1 = yield stream_4.next(), _a = stream_4_1.done, !_a; _d = true) {
                        _c = stream_4_1.value;
                        _d = false;
                        const chunk = _c;
                        if ("agent" in chunk) {
                            console.log(chunk.agent.messages[0].content);
                        }
                        else if ("tools" in chunk) {
                            console.log(chunk.tools.messages[0].content);
                        }
                        console.log("-------------------");
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = stream_4.return)) yield _b.call(stream_4);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Error:", error.message);
            }
            process.exit(1);
        }
        finally {
            rl.close();
        }
    });
}
/**
 * Choose whether to run in autonomous or chat mode based on user input
 *
 * @returns Selected mode
 */
function chooseMode() {
    return __awaiter(this, void 0, void 0, function* () {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
        // eslint-disable-next-line no-constant-condition
        while (true) {
            console.log("\nAvailable modes:");
            console.log("1. chat    - Interactive chat mode");
            console.log("2. auto    - Autonomous action mode");
            const choice = (yield question("\nChoose a mode (enter number or name): "))
                .toLowerCase()
                .trim();
            if (choice === "1" || choice === "chat") {
                rl.close();
                return "chat";
            }
            else if (choice === "2" || choice === "auto") {
                rl.close();
                return "auto";
            }
            console.log("Invalid choice. Please try again.");
        }
    });
}
/**
 * Start the chatbot agent
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { agent, config } = yield initializeAgent();
            const mode = yield chooseMode();
            if (mode === "chat") {
                yield runChatMode(agent, config);
            }
            else {
                yield runAutonomousMode(agent, config);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Error:", error.message);
            }
            process.exit(1);
        }
    });
}
// if (require.main === module) {
//   console.log("Starting Agent...");
//   main().catch(error => {
//     console.error("Fatal error:", error);
//     process.exit(1);
//   });
// }
