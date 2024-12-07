import mongoose, { Document, Schema } from "mongoose";

export interface IMemeTracker {
  tokenCreator: string;
  tokenURI: string;
  name: string;
  symbol: string;
  tokenAddress: string;
  poolAddress: string;
}

export interface IMemeTrackerModel extends IMemeTracker, Document { }

const MemeTrackerSchema: Schema = new Schema({
  chatId: {
    type: String
  },
  isCopyTrading: {
    type: Boolean,
    default: false
  },
}, {
  timestamps
    : true

});

export default mongoose.model<IMemeTrackerModel>("MemeTracker", MemeTrackerSchema);
