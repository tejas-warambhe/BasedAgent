import mongoose, { Document, Schema } from "mongoose";

export interface IWhaleTracker {
  whaleAddress: string; // The wallet address of the whale
  tokenAddress: string; // Address of the token involved
  tokenSymbol: string; // Symbol of the token (e.g., WOW)
  transactionHash: string; // Hash of the transaction
  transactionType: string; // Type of transaction (BUY/SELL)
  amount: string; // Amount of tokens traded
  amountUSD: number; // USD value of the transaction
  timestamp: Date; // Timestamp of the transaction
  network: string; // Network where transaction occurred (e.g., BASE)
  priceImpact: number; // Price impact of the trade
  profitLoss?: number; // Profit/Loss if it's a closing position
  holdingPeriod?: number; // Time between buy and sell (in seconds)
  status: string; // Transaction status (SUCCESS/FAILED)
}

export interface IWhaleTrackerModel extends IWhaleTracker, Document {}

const WhaleTrackerSchema: Schema = new Schema<IWhaleTracker>(
  {
    whaleAddress: {
      type: String,
      required: true,
      index: true,
    },
    tokenAddress: {
      type: String,
      required: true,
      index: true,
    },
    tokenSymbol: {
      type: String,
      required: true,
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true,
    },
    transactionType: {
      type: String,
      required: true,
      enum: ["BUY", "SELL"],
    },
    amount: {
      type: String,
      required: true,
    },
    amountUSD: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    network: {
      type: String,
      required: true,
    },
    priceImpact: {
      type: Number,
      required: true,
    },
    profitLoss: {
      type: Number,
      required: false,
    },
    holdingPeriod: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["SUCCESS", "FAILED"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWhaleTracker>(
  "WhaleTracker",
  WhaleTrackerSchema
);
