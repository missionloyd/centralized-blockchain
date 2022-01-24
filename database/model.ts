const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlockChainSchema = new Schema({
  index: {
    required: true,
    type: Schema.Types.Number,
  },
  hash: {
    required: true,
    type: Schema.Types.String,
  },
  prevHash: {
    required: true,
    type: Schema.Types.String,
  },
  transaction: {
    required: true,
    type: Schema.Types.Mixed,
  },
  ts: {
    required: true,
    type: Schema.Types.Date,
    default: Date.now(),
  }
});

// export const blockChainModel = mongoose.model("BlockChain", BlockChainSchema);
module.exports = mongoose.model("BlockChain", BlockChainSchema);