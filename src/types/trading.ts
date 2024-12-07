import { ethers } from 'ethers';

export type TradeType = 'buy' | 'sell';

export interface TokenInfo {
    address: string;
    symbol: string;
    decimals: number;
}

export interface TokenTransaction {
    tokenAddress: string;
    amount: string;
    timestamp: number;
    type: TradeType;
    price?: string;
    hash?: string;
    blockNumber?: number;
}

export interface TradeHistory {
    address: string;
    transactions: TokenTransaction[];
}

export interface WhaleTrader {
    id: string;
    name: string;
    address: string;
    description: string;
    minimumAmount?: string;
    tokens?: TokenInfo[];
}

export interface TradeConfig {
    provider: ethers.providers.Provider;
    token: TokenInfo;
    minimumAmount: string | ethers.BigNumber;
    blocksToScan?: number;
}

export interface TradeNotification {
    trader: WhaleTrader;
    transaction: TokenTransaction;
    formattedMessage: string;
}
