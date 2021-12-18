const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const TrxModel = require('../models/transaksi')
const moment = require('moment')

function Transaction () {

	this.index = async (req, res, next) => {
		return res.render('transaction',{
			title : 'Defi Kingdoms - Transaction Informtion'
		});
	}

	this.dataTable = async (req, res, next) => {
		// console.log('[DATA TABLE]')
		let query = req.query;
		// console.log('[QUERY] ', query);
		TrxModel.find({})
			.sort({timestamp: -1})
			.skip(parseInt(req.query.start))
			.limit(parseInt(req.query.length))
			.then(async (result) => {
				let output = result.map((x, idx) => {
					let timestamp = moment.unix(x.timestamp).fromNow();
					let txn_fee = (x.gas * parseInt(x.gasPrice)) / 10 ** 18;
					return {
						_id : x._id,
						hash : `
							<a href = '#'>
							${x.hash.substring(0, 10)} ...
							</a>
						`,
						method : `
							<a class = 'nameMethod' data-toggle="tooltip" data-placement="top" data-original-title = "${x.method}" title="${x.method}">
								${x.method?x.method:''}
							</a>
						`,
						blockNumber : x.blockNumber,
						age : timestamp,
						from : `
							<a href = '#'>${x.from.substring(0, 10)} ...</a>
						`,
						to : `
							<a href = '#'>${x.to.substring(0, 10)} ...</a>
						`,
						value : `${x.value} BNB`,
						txn_fee : txn_fee,
					}
				});

				// console.log('[OUTPUT] ', output);
				TrxModel.countDocuments({}).then((total) => {
					return res.json({
						draw: req.query.draw,
						recordsFiltered : total,
						recordsTotal : total,
						data : output
					});
				});
			})
			.catch((err) => {
				console.log('[ERROR DATATABLE] ', err.message);
				return res.json({
					draw: req.query.draw,
					recordsFiltered : 0,
					recordsTotal : 0,
					data : []
				});
			});
	}
}

module.exports = Transaction;