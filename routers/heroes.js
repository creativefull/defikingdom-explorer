const abiQuest = require('../abi/quest.json')

const moment = require('moment');
const InputDataDecoder = require('ethereum-input-data-decoder');

function Heroes() {
	this.index = (req,res,next) => {
		return res.render('hero', {
			title : `Defi Kingdoms - Heroes`,
		});
	}

	this.dataTable = async (req, res, next) => {
		getHeroes({})
			.then(async (heros) => {
				let decoder = new InputDataDecoder(abiQuest);
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
						x.questName = ''
					}

					x.rarityName = x.rarity==0? `Common` : x.rarity==1 ? 'Uncommon' : x.rarity==2 ? 'Rare' : x.rarity==3 ? 'Legendary' : 'Mythic'
					return {
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
							<span style = 'margin-left:5px;' class = 'u-label u-label--xs u-label--badge-in u-label--info text-center text-nowrap'>
								${x.rarityName}
							</span>
						`,
						owner : `
							<div>
								ID : <a href = '/address/${x.owner&&x.owner.id?x.owner.id : ''}' class='hash-tag hash-tag--sm text-truncate'>${x.owner&&x.owner.id?x.owner.id : ''}</a>
								</br>
								NAME : ${x.owner&&x.owner.name?x.owner.name : ''}
							</div>
						`,
						level : x.level,
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

	this.heroDetail = async (req, res, next) => {

	}

	const getHeroes = async (options) => {
		return new Promise(async (resolve, reject) => {
			try {
				let variables = {
					owner : ''
				}

				clientGraphql.query(`
					query heros($owner : String) {
						heros(where : {}) {
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
							hp
							level
							stamina
							staminaFullAt
							summons
							maxSummons
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
module.exports = exports = Heroes