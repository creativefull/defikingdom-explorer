const erc20Abi = require('../abi/erc20.json');
const ListToken = require('../config/token.json')
const uniswapAbi = require('../abi/router.json')
const {abis} = require('../miners/abis');

const Web3 = require('web3');
const web3 = new Web3(HMY_RPC_URL);
// const {Account} = require('@harmony-js/account');
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
		let address = req.params.address;
		return res.render('profile',{
			title : `Defi Kingdoms - Address ${address}`,
			address : address,
		})
	}

	this.stats = async (req, res, next) => {
		let address = req.params.address;
		
		let uniswapContract = new web3.eth.Contract(uniswapAbi, '0x24ad62502d1c652cc7684081169d04896ac20f30')
		let tokenJewel = '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F'.toLowerCase();
		let jewelPriceCG = await CoinGeckoClient.coins.fetchMarketChart('defi-kingdoms', {})
		let jewelUSDPrice = 0
		if (jewelPriceCG.code == 200) {
			jewelUSDPrice = jewelPriceCG.data.prices[jewelPriceCG.data.prices.length - 1][1]
		}

		// await getPriceToken(address);
		async.parallel({
			tokens : function (callback) {
				getPriceToken(address, tokenJewel, jewelUSDPrice, uniswapContract)
					.then((rows) => {
						return callback(null, rows);
					})
					.catch((err) => {
						return callback(err.message, null);
					});
			},
			myBalance : function (callback) {
				getBalance(address)
					.then((rows) => {
						let balance = rows.balance;
						let getPrice = parseFloat(parseFloat(balance).toFixed(4));
						let usdPrice = getPrice * jewelUSDPrice;
						
						return callback(null,{
							jewelPrice: getPrice,
							usdPrice : parseFloat(parseFloat(usdPrice).toFixed(2)),
						})
					})
					.catch((err) => {
						return callback(err.message, null);
					});
			}
		}, async (err, results) => {
			console.log('[ERROR ASYNC STATS BALANCE]', err);
			if (err) return res.json({status : 500, message : err.message});
			// console.log('[RESULT] ', results);
			let myBalance = results.myBalance;
			return res.json({
				status : 200,
				data : {
					jewelPrice : myBalance.jewelPrice,
					usdPrice : myBalance.usdPrice,
					tokens : results.tokens,
				}
			});
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

	this.dataTableHeroes = async (req, res, next) => {
		let address = req.params.address;
		getHeroes(address)
			.then(async (heros) => {
				let output = heros.map((x) => {

					return {
						id : x.id,
						currentQuest : `<a href = '#' class='hash-tag hash-tag--sm text-truncate'>
							${x.currentQuest}
						</a>`,
						firstName : x.firstName,
						lastName : x.lastName,
						profession : `
							<span style = 'margin-left:5px;' class = 'u-label u-label--xs u-label--badge-in u-label--secondary text-center text-nowrap'>
								<small>${x.profession.toUpperCase()}</small>
							</span>
						`,
						rarity : x.rarity,
						owner : `
							<small>
								ID : <a href = '#' class='hash-tag hash-tag--sm text-truncate'>${x.owner&&x.owner.id?x.owner.id : ''}</a>
								</br>
								NAME : ${x.owner&&x.owner.name?x.owner.name : ''}
							</small>
						`
					}
				});

				return res.json({
					draw: req.query.draw,
					recordsFiltered : output.length,
					recordsTotal : output.length,
					data : output
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

	const getPriceToken = async (walletAddress, tokenJewel, jewelUSDPrice, uniswapContract) => {
		return new Promise(async (resolve, reject) => {
			try {
				let outputToken = await Promise.all(ListToken.map(async (x) => {
					let tokenAddress = x.address;
					let tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
					let balance = await tokenContract.methods.balanceOf(walletAddress).call(); // get balance token

					x.balance = (balance)/ 10 ** x.decimals;
					if (x.address.toLowerCase() == tokenJewel) {
						x.jewelPrice = 1;
						x.usdPrice = parseFloat(parseFloat(jewelUSDPrice).toFixed(2))
					} else {
						let getAmount = await uniswapContract.methods.getAmountsOut(web3.utils.toBN(Number(1 * (10 ** x.decimals))), [x.address.toLowerCase(), tokenJewel]).call().catch(console.error); // get balance value token jewel
						let getPrice = parseFloat(parseFloat(parseInt(getAmount[1]) / 10 ** 18).toFixed(4));
						let usdPrice = getPrice * jewelUSDPrice;
						
						x.jewelPrice = getPrice;
						x.usdPrice = parseFloat(parseFloat(usdPrice).toFixed(2));
					}
					
					// console.log('[BALANCE] ', balance);
					// console.log('[GET PRICE] ', getPrice);
					return x;
				}));

				// console.log('[LIST TOKEN] ', outputToken);
				return resolve(outputToken);
			} catch (err) {
				console.log('[ERROR TOKEN] ', err);
				return reject(err);
			}
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

	const getHeroes = async (address) => {
		return new Promise(async (resolve, reject) => {
			try {
				let variables = {
					owner : address,
				}

				clientGraphql.query(`
					query heros($owner : String) {
						heros(where : { owner : $owner}) {
							id
							profession
							rarity
							firstName
							lastName
							currentQuest
							owner {
								id
								name
							}
						}
					}

				`, variables)
				.then(async (body) => {
					let data = body.data;
					let heros = data.heros;
					return resolve(heros);
				})
				.catch((err) => {
					console.log(err.message);
					return reject(err);
				});
			} catch (err) {
				return reject(err);
			}
		});
	}
}

module.exports = Profile;