const request = require('request');
const async = require('async');

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
						"id": "1",
						"jsonrpc": "2.0",
						"method": "hmyv2_getBalance",
						"params": [
							address,
						]
					}),
				}
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
			}
		}, (err, results) => {
			if (err) return next(err);
			console.log('[RESULTS] ', results);
			return res.render('profile',{
				title : `Defi Kingdoms - Address ${address}`,
				address : address,
				balance : results.balance,
			})
		})
	}
}

module.exports = Profile;