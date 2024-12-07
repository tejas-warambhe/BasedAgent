import mongoose, { Document, Schema } from "mongoose";

export interface IToken {
  tokenCreator: string;
  tokenURI: string;
  name: string;
  symbol: string;
  tokenAddress: string;
  poolAddress: string;
}

export interface ITokenModel extends IToken, Document { }

const TokenSchema: Schema = new Schema({
  tokenCreator: {
    type: String
  },
  tokenURI: {
    type: String
  },
  name: {
    type: String
  },
  symbol: {
    type: String
  },
  tokenAddress: {
    type: String
  },
  poolAddress: {
    type: String
  }
}, {
  timestamps
    : true

});

export default mongoose.model<ITokenModel>("Token", TokenSchema);
