const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const TrxModel = require('../models/transaksi')
const moment = require('moment')
const _ = require('underscore')
const {abis} = require('../miners/abis');
let abiQuest = require('../abi/quest.json');
const InputDataDecoder = require('ethereum-input-data-decoder');

function Transaction () {

	this.index = async (req, res, next) => {
		return res.render('transaction',{
			title : 'Defi Kingdoms - Transaction Information'
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

	this.trxByAction = async (req, res, next) => {
		let action = req.params.action
		return res.render('otherTransaction',{
			title : 'Defi Kingdoms - Quest Information',
			action : action.toUpperCase(),
		});
	}

	this.dataTableOther = async (req, res, next) => {
		let action = req.query.action;
		let where = {
			actionName : action.toUpperCase(),
		}
		TrxModel.find(where)
			.sort({timestamp: -1})
			.skip(parseInt(req.query.start))
			.limit(parseInt(req.query.length))
			.then(async (result) => {
				// console.log('[RESULT] ', result);
				let resultConvert = await convertQuest(result);
				let output = resultConvert.map((x, idx) =>{
					let timestamp = moment.unix(x.timestamp).fromNow();
					let txn_fee = (x.gas * parseInt(x.gasPrice)) / 10 ** 18;
					let amount = 0
					x.tokenTransfers?.forEach((t) => {
						if (t.symbol == 'JEWEL') {
							amount += t.amount
						}
					});

					abis.map((a) => a.address = a.address.toLowerCase());
					/* CHECK ADDRESS FROM / TO */
					let checkFrom = _.findWhere(abis, {address: x.from.toLowerCase()})
					let checkTo = _.findWhere(abis, {address: x.to.toLowerCase()})

					if (checkFrom) {
						x.from = checkFrom.type
					}
					if (checkTo) {
						x.to = checkTo.type
					}

					let elmActionName = `
						<span style = 'margin-left:5px;' class = 'u-label u-label--xs u-label--badge-in u-label--secondary text-center text-nowrap'>
							<small>${x.questName}</small>
						</span>
					`;

					return {
						_id : x._id,
						hash : `
							<a href = '/tx/${x.hash}' class='hash-tag hash-tag--sm text-truncate'>
							${x.hash}
							</a>
						`,
						method : `
							<span class = 'u-label u-label--xs u-label--info rounded text-dark text-center' style='min-width:68px;' data-toggle="tooltip" data-placement="top" data-original-title = "${x.method}" title="${x.method}">
								${x.method?x.method:''}
							</span>
						`,
						blockNumber : x.blockNumber,
						age : timestamp,
						from : `
							<a href = '/address/${x.from}' class='hash-tag hash-tag--sm text-truncate'>${x.from}</a>
						`,
						to : `
							<a href = '#' class='hash-tag hash-tag--sm text-truncate'>${x.to}</a>
							${x.method=='startQuest'?elmActionName:''}
						`,
						value : `${parseFloat(amount).toFixed(2)} JEWEL`,
						txn_fee : `<small class='small text-secondary'>${parseFloat(txn_fee).toFixed(5)}</small>`
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
				// console.log('[ERROR DATATABLE] ', err.message);
				return res.json({
					draw: req.query.draw,
					recordsFiltered : 0,
					recordsTotal : 0,
					data : []
				});
			});
	}

	const convertQuest = async (questData) => {
		return new Promise(async (resovle, reject) => {
			let output = questData.map((x) => {
				let decoder = new InputDataDecoder(abiQuest);
				if (x.method == 'startQuest') {
					let result = decoder.decodeData(x.input);
					let questId = '0x' + result.inputs[1]

					if (questId.toLowerCase() == '0x3132c76acf2217646fb8391918d28a16bd8a8ef4') {
						x.questName = 'FORAGING'
					} else if (questId.toLowerCase() == '0xe259e8386d38467f0e7ffedb69c3c9c935dfaefc') {
						x.questName = 'FISHING'
					} else if (questId.toLowerCase() == '0x569e6a4c2e3af31b337be00657b4c040c828dd73') {
						x.questName = 'MINING'
					} else {
						x.questName = 'UNKNOWN'
					}
				}
				return x;
			});

			return resovle(output);
		})
	}
}

module.exports = Transaction;