const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const TrxModel = require('../models/transaksi')
const moment = require('moment')

function Transaction () {

	this.index = async (req, res, next) => {
		let currentPage = 1;
		let pageSize = req.query.limit || 50;
		// let startIndex = (page - 1) * limit;
		var startIndex = pageSize * (currentPage - 1);
		// let endIndex = page * limit;
		// let trxData = await TrxModel.find({}).sort({timestamp: -1}).skip(0).limit(pageSize);
		// let pageCount = await TrxModel.count({});
		// console.log('[PAGE COUNT] ', pageCount);
		return res.render('transaction',{
			// trxData : trxData,
			currentPage : currentPage,
			pageSize : pageSize,
			// pageCount : pageCount,
		});
	}

	this.dataTable = async (req, res, next) => {
		
	}
}

module.exports = Transaction;