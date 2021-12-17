const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Transaction = new Schema({
  blockHash: {
    type: String
  },
  blockNumber: {
    type: Number
  },
  from: String,
  gas: Number,
  gasPrice: String,
  hash: {
    type: String,
    unique: true,
    index: true
  },
  input: String,
  nonce: Number,
  r: String,
  s: String,
  timestamp: String,
  to: String,
  transactionIndex: Number,
  v: String,
  value: String,
  userInfo: {
    name: String,
    address: String
  },
  detail: Object,
  tokenTransfers: Object,
  method: String,
  actionName: String,
  success: {
    type: Boolean,
    default: false
  }
});

module.exports = exports = mongoose.model("Transactions", Transaction, "transactions");