import mongoose, { Document, Schema } from "mongoose";

export interface IMemeTracker {
  chatId: number;
  isCopyTrading: boolean;
}

export interface IMemeTrackerModel extends IMemeTracker, Document { }

const MemeTrackerSchema: Schema = new Schema({
  chatId: {
    type: Number
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
