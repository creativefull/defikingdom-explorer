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
		getHeroes()
			.then(async (heros) => {
				let decoder = new InputDataDecoder(abiQuest);
				let output = heros.map((x) => {
					if (x.currentQuest.indexOf('0x000000') === -1 ) {
						let result = decoder.decodeData(x.currentQuest);
						let questId = '0x' + x.inputs[1]

						if (questId.toLowerCase() == '0x3132c76acf2217646fb8391918d28a16bd8a8ef4') {
							// x.currentQuest = 'FOREGING'
							x.questName = `
								<span style = 'margin-left:5px;' class = 'u-label u-label--xs u-label--badge-in u-label--danger text-center text-nowrap'>
									<small>FOREGING</small>
								</span>
							`;
						} else if (questId.toLowerCase() == '0xe259e8386d38467f0e7ffedb69c3c9c935dfaefc') {
							x.questName = `
								<span style = 'margin-left:5px;' class = 'u-label u-label--xs u-label--badge-in u-label--danger text-center text-nowrap'>
									<small>FISHING</small>
								</span>
							`;
						} else {
							x.questName = '-'
						}
					} else {
							x.questName = '-'
					}

					x.rarityName = x.rarity==0? `Common` : x.rarity==1 ? 'Uncommon' : x.rarity==2 ? 'Rare' : x.rarity==3 ? 'Legendary' : 'Mythic'
					return {
						id : `
							<a href = '/hero/detail?id=${x.id}' class='hash-tag hash-tag--sm text-truncate' target = '__blank'>
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
							<small>
								ID : <a href = '/address/${x.owner&&x.owner.id?x.owner.id : ''}' class='hash-tag hash-tag--sm text-truncate'>${x.owner&&x.owner.id?x.owner.id : ''}</a>
								</br>
								NAME : ${x.owner&&x.owner.name?x.owner.name : ''}
							</small>
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

}
module.exports = exports = Heroes