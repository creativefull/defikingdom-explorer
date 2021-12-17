const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const TrxModel = require('../models/transaksi')
const moment = require('moment')

function Transaction () {

	this.index = async (req, res, next) => {
		let trxData = await TrxModel.find().sort({_id: -1}).skip(0).limit(10);
		console.log('[TRX] ', trxData)
	}
}

module.exports = Transaction;