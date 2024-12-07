import mongoose, { Document, Schema } from "mongoose";

export interface ITSnipe {
  chatId: number;
  username: string;
  traderId: string;
  traderAddress: string;
}

export interface ISnipeModel extends ITSnipe, Document { }

const SnipeSchema: Schema = new Schema({
  chatId: {
    type: Number
  },
  username: {
    type: String
  },
  traderId: {
    type: String
  },
  traderAddress: {
    type: String
  }
}, {
  timestamps
    : true

});

export default mongoose.model<ISnipeModel>("Snipe", SnipeSchema);
