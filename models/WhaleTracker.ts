import mongoose, { Document, Schema } from "mongoose";

export interface IWhaleTracker {
  tokenCreator: string;
  tokenURI: string;
  name: string;
  symbol: string;
  tokenAddress: string;
  poolAddress: string;
}

export interface IWhaleTrackerModel extends IWhaleTracker, Document { }

const WhaleTrackerSchema: Schema = new Schema({
  chatId: {
    type: String
  },
  userAddress: {
    type: String
  },
  whaleAddress: {
    type: String
  },
  threshold: {
    type: Number,
    default: 1
  },
  isCopyTrading: {
    type: Boolean,
    default: true
  },
  buyAmount: {
    type: Number,
    default: 0
  },
    
  sellAmount: {
    type: Number,
    default: 0
 },
}, {
  timestamps
    : true

});

export default mongoose.model<IWhaleTracker>("WhaleTracker", WhaleTrackerSchema);
