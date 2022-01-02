const erc20Abi = require('../abi/erc20.json');
const ListToken = require('../config/token.json')
const uniswapAbi = require('../abi/router.json')
const {abis} = require('../miners/abis');
let abiQuest = require('../abi/quest.json')

const Web3 = require('web3');
const web3 = new Web3(HMY_RPC_URL);
const async = require('async');
const moment = require('moment');
const _ = require('underscore');
const request = require('request');
const { nativePrice } = require('../lib/getPrice');
const TrxModel = require('../models/transaksi');

const tokenJewel = '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F'.toLowerCase();

function Profile () {

	this.address = async (req, res, next) => {
		let address = req.params.address;
		let tokenContract = new web3.eth.Contract(erc20Abi, tokenJewel);
		let balance = await tokenContract.methods.lockOf(address).call(); // get balance token
		balance = parseFloat((balance)/ 10 ** 18).toFixed(2);
		let jewelUSDPrice = await nativePrice();
		let usdPriceLock = parseFloat(jewelUSDPrice * balance).toFixed(2);
		
		// console.log('[BALANCE] ', balance);
		// console.log('[USD BALANCE] ', usdPriceLock);
		return res.render('profile',{
			title : `Defi Kingdoms - Address ${address}`,
			address : address,
			balanceLock : balance,
			usdPriceLock : usdPriceLock,
		})
	}

	this.stats = async (req, res, next) => {
		let address = req.params.address;
		
		let uniswapContract = new web3.eth.Contract(uniswapAbi, '0x24ad62502d1c652cc7684081169d04896ac20f30')
		let jewelUSDPrice = await nativePrice()

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
						console.err(err)
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
		let actionName = req.params.actionName;
		let where = {
			$or: [{
				from: new RegExp(address, 'gi')
			}, {
				to: new RegExp(address, 'gi')
			}]
		}
		if (actionName!='all') {
			where['actionName'] = actionName.toUpperCase();
		}

		TrxModel.find(where)
			.sort({timestamp: -1})
			.skip(parseInt(req.query.start))
			.limit(parseInt(req.query.length))
			.then(async (result) => {
				let output = result.map((x, idx) => {
					let timestamp = moment.unix(x.timestamp).fromNow();
					let txn_fee = (x.gas * parseInt(x.gasPrice)) / 10 ** 18;
					let amount = 0
					x.tokenTransfers?.forEach((t) => {
						if (t.symbol == 'JEWEL') {
							amount += t.amount
						}
					})

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


					return {
						_id : x._id,
						hash : `
							<a href = '/tx/${x.hash}' class='hash-tag hash-tag--sm text-truncate'>
							${x.hash}
							</a>
						`,
						method : `
							<span class = 'u-label u-label--xs u-label--info rounded text-dark text-center nameMethod' style='min-width:68px;' data-toggle="tooltip" data-placement="top" data-original-title = "${x.method}" title="${x.method}">
								${x.method?x.method:''}
							</span>
						`,
						blockNumber : x.blockNumber,
						age : timestamp,
						from : `
							<a href = '/address/${x.from}' class='hash-tag hash-tag--sm text-truncate'>${x.from}</a>
						`,
						to : `
							<a href = '/address/${x.to}' class='hash-tag hash-tag--sm text-truncate'>${x.to}</a>
						`,
						value : `${parseFloat(amount).toFixed(2)} JEWEL`,
						txn_fee : `<small class='small text-secondary'>${parseFloat(txn_fee).toFixed(5)}</small>`,
					}
				});

				// console.log('[OUTPUT] ', output);
				TrxModel.countDocuments(where).then((total) => {
					return res.json({
						draw: req.query.draw,
						recordsFiltered : total,
						recordsTotal : total,
						data : output
					});
				});
			})
			.catch((err) => {
				console.error(err)
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
					if (x.currentQuest.toLowerCase() == '0x3132c76acf2217646fb8391918d28a16bd8a8ef4') {
						x.questName = `
							<span style = 'margin-left:5px;' class = 'u-label u-label--xs u-label--badge-in u-label--danger text-center text-nowrap'>
								<small>FOREGING</small>
							</span>
						`;
					} else if (x.currentQuest.toLowerCase() == '0xe259e8386d38467f0e7ffedb69c3c9c935dfaefc') {
						x.questName = `
							<span style = 'margin-left:5px;' class = 'u-label u-label--xs u-label--badge-in u-label--danger text-center text-nowrap'>
								<small>FISHING</small>
							</span>
						`;
					} else {
						x.questName = '';
					}

					x.rarityName = x.rarity==0? `Common` : x.rarity==1 ? 'Uncommon' : x.rarity==2 ? 'Rare' : x.rarity==3 ? 'Legendary' : 'Mythic'
					colorRarity = ['default','success','info','warning','purple']
					return {
						...x,
						id : `
							<a href = '/hero/${x.id}' class='hash-tag hash-tag--sm text-truncate' target = '__blank'>
								${x.id}
							</a>
						`,
						profession : `
							<span style = 'margin-left:5px;' class = 'u-label u-label--xs u-label--badge-in u-label--secondary text-center text-nowrap'>
								<small>${x.profession.toUpperCase()}</small>
							</span>
						`,
						currentQuest : x.questName,
						rarity : `
							<span style = 'margin-left:5px;' class = 'u-label u-label--xs u-label--badge-in u-label--${colorRarity[x.rarity]} text-center text-nowrap'>
								${x.rarityName}
							</span>
						`,
						level : x.level,
						summonLeft: x.maxSummons - x.summons,
						staminaFullAt : moment.unix(x.staminaFullAt).fromNow()
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
				let erc20Contract = new web3.eth.Contract(erc20Abi, '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F')
				let balance = await erc20Contract.methods.balanceOf(address).call()
				return resolve({
					balance: parseFloat(parseFloat(parseInt(balance) / 10 ** 18).toFixed(2))
				})
			} catch (err) {
				return reject({status : 500, message : err.message});
			}
		});
	}

	const getHeroes = async (address) => {
		return new Promise(async (resolve, reject) => {
			try {
				let query = `
					query {
						heros(where : { owner : "${address}"}) {
							id
							numberId
							profession
							rarity
							currentQuest
							owner {
								id
								name
							}
							mp
							xp
							sp
							level
							stamina
							staminaFullAt
							summons
							maxSummons
							generation
							mainClass
							subClass
						}
					}
				`

				clientGraphql.query(query)
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