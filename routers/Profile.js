const request = require('request');
const async = require('async');
const moment = require('moment');

function Profile () {

	const getBalance = async (address) => {
		return new Promise (async (resolve, reject) => {
			try {
				let options = {
					uri: HMY_RPC_URL,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						"id": "1",
						"jsonrpc": "2.0",
						"method": "hmyv2_getBalance",
						"params": [
							address,
						]
					}),
				}

				request(options, async (err, response, body) => {
					if (err) return reject({status : 500, message : 'Internal Server Error'});
					let hasil = JSON.parse(body);
					let balance = hasil.result/1e18;
					return resolve({status : 200, balance : balance});
				});
			} catch (err) {
				return reject({status : 500, message : err.message});
			}
		});
	}

	const getLastTransactions = async (address) => {
		return new Promise(async (resolve, reject) => {
			try {
				let options = {
					uri: HMY_RPC_URL,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						"jsonrpc": "2.0",
						"method": "hmyv2_getTransactionsHistory",
						"params": [{
							"address": address,
							"pageIndex": 0,
							"pageSize": 100,
							"fullTx": true,
							"txType": "ALL",
							"order": "DESC"
						}],
						"id": 1
					}),
				}

				request(options, async (err, response, body) => {
					if (err) return reject({status : 500, message : 'Internal Server Error'});
					let hasil = JSON.parse(body);
					let trx = hasil.result;
					return resolve({status : 200, trx : trx.transactions});
				});
			} catch (err) {
				return reject(err);
			}
		})
	}

	this.address = async (req, res, next) => {
		let address = req.params.address;

		async.parallel({
			balance : function (callback) {
				getBalance(address)
					.then((rows) => {
						return callback(null, rows.
							balance);
					})
					.catch((err) => {
						return callback(err, null);
					})
			},
			transactions : function (callback) {
				getLastTransactions(address)
					.then((rows) => {
						let outputs = rows.trx.map((x) => {
							x.timestamp = moment.unix(x.timestamp).fromNow();
							x.txn_fee = (x.gas * parseInt(x.gasPrice)) / 10 ** 18;

							return x;
						});
						return callback(null, outputs);
					})
					.catch((err) =>{
						return callback(err, null);
					});
			}
		}, (err, results) => {
			if (err) return next(err);
			return res.render('profile',{
				title : `Defi Kingdoms - Address ${address}`,
				address : address,
				balance : results.balance,
				lastTrx : results.transactions,
			})
		})
	}
}

module.exports = Profile;