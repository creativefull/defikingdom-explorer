const erc20 = require('../abi/erc20.json');
const ListToken = require('../config/token.json')
const uniswapAbi = require('../abi/router.json')
const {abis} = require('../miners/abis');

const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL);
const CoinGecko = require('coingecko-api')
const async = require('async');
const moment = require('moment');
const _ = require('underscore');
const request = require('request');
const CoinGeckoClient = new CoinGecko();
const InputDataDecoder = require('ethereum-input-data-decoder');
const perBlock = 2 // 2 seconds default harmony

function Profile () {

	this.address = async (req, res, next) => {
		let address = req.params.address
		return res.render('profile',{
			title : `Defi Kingdoms - Address ${address}`,
			address : address,
		})
	}

	this.stats = async (req, res, next) => {
		let address = req.params.address;
		
		let uniswapContract = new web3.eth.Contract(uniswapAbi, '0x24ad62502d1c652cc7684081169d04896ac20f30')
		let tokenJewel = '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F'.toLowerCase()
		let jewelPriceCG = await CoinGeckoClient.coins.fetchMarketChart('defi-kingdoms', {})
		let jewelUSDPrice = 0
		if (jewelPriceCG.code == 200) {
			jewelUSDPrice = jewelPriceCG.data.prices[jewelPriceCG.data.prices.length - 1][1]
		}

		getBalance(address)
			.then((rows) => {
				let balance = rows.balance;
				let getPrice = parseFloat(parseFloat(balance).toFixed(4));
				let usdPrice = getPrice * jewelUSDPrice;
				// console.log(`JEWEL USD : ${jewelUSDPrice}`);
				// console.log(`[GET PRICE] : ${getPrice}`);
				// console.log(`[USD PRICE] : ${usdPrice}`);

				return res.json({
					status : 200,
					data : {
						jewelPrice: getPrice,
						usdPrice : parseFloat(parseFloat(usdPrice).toFixed(2)),
					}
				})
			})
			.catch((err) => {
				return res.json({status : 500, message : err.message});
			});
	}

	this.dataTableTransaction = async (req, res, next) => {
		let address = req.params.address;
		getLastTransactions(address)
			.then((rows) => {
				let output = rows.trx.map((x) => {
					x.timestamp = moment.unix(x.timestamp).fromNow();
					x.txn_fee = (x.gas * parseInt(x.gasPrice)) / 10 ** 18;

					abis.map((a) => a.address = a.address.toLowerCase())
					/* CHECK ADDRESS FROM / TO */
					let checkFrom = _.findWhere(abis, {address: x.from.toLowerCase()})
					let checkTo = _.findWhere(abis, {address: x.to.toLowerCase()})

					if (checkFrom) {
						x.from = checkFrom.type
					}
					if (checkTo) {
						x.to = checkTo.type
					}
					// END

					return {
						_id : x.hash,
						hash : `
							<a href = '/tx/${x.hash}' class='hash-tag hash-tag--sm text-truncate'>
							${x.hash}
							</a>
						`,
						blockNumber : x.blockNumber,
						age : x.timestamp,
						from : `
							<a href = '/address/${x.from}' class='hash-tag hash-tag--sm text-truncate'>${x.from}</a>
						`,
						to : `
							<a href = '#' class='hash-tag hash-tag--sm text-truncate'>${x.to}</a>
						`,
						value : `${parseFloat(x.value).toFixed(2)} JEWEL`,
						txn_fee : `<small class='small text-secondary'>${parseFloat(x.txn_fee).toFixed(5)}</small>`,
					}
				});

				return res.json({
					draw: req.query.draw,
					recordsFiltered : output.length,
					recordsTotal : output.length,
					data : output
				});
			})
			.catch((err) =>{
				console.log('[ERROR DATATABLE] ', err.message);
				return res.json({
					draw: req.query.draw,
					recordsFiltered : 0,
					recordsTotal : 0,
					data : []
				});
			});
	}

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
}

module.exports = Profile;