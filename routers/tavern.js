const abiTavern = require('../abi/saleAuction.json')
const abiHero = require('../abi/heroes.json')
const Web3 = require('web3');
const web3 = new Web3(HMY_RPC_URL);

const moment = require('moment');
const InputDataDecoder = require('ethereum-input-data-decoder');
const { nativePrice } = require('../lib/getPrice');
let tavernContract = new web3.eth.Contract(abiTavern, '0x13a65b9f8039e2c032bc022171dc05b30c3f2892')
let heroContract = new web3.eth.Contract(abiHero, '0x5f753dcdf9b1ad9aabc1346614d1f4746fd6ce5c')

function Tavern() {
	this.index = (req,res,next) => {
		return res.render('tavern', {
			title : `Defi Kingdoms - Tavern Listing`,
		});
	}

	this.dataTable = async (req, res, next) => {
        let start = parseInt(req.query.start) || 0
        let limit = parseInt(req.query.length) || 10
        let totalMarket = await heroContract.methods.balanceOf('0x13a65b9f8039e2c032bc022171dc05b30c3f2892').call()

		getTavernMarket({start: start, limit: limit})
			.then(async (heros) => {
                // console.log(heros)
                let jewelPrice = await nativePrice()
				let output = heros.map((x) => {
					x.rarityName = x.rarity==0? `Common` : x.rarity==1 ? 'Uncommon' : x.rarity==2 ? 'Rare' : x.rarity==3 ? 'Legendary' : 'Mythic'
					colorRarity = ['default','success','info','warning','purple'];
                    let statsHtml = `<div><a href='javascript: void(0)' class='btn btn-block btn-xs btn-primary' onclick='toggleStats(this)'>Show / Hide</a><table class=\'table table-hidden table-bordered\'><tbody>`
                    statsHtml += `<tr><td><small>STR : ${x.strength}</small> </td><td><small>DEX : ${x.dexterity}</small></td></tr>`
                    statsHtml += `<tr><td><small>AGI : ${x.agility}</small> </td><td><small>VIT : ${x.vitality}</small></td></tr>`
                    statsHtml += `<tr><td><small>STR : ${x.endurance}</small> </td><td><small>DEX : ${x.intelligence}</small></td></tr>`
                    statsHtml += `<tr><td><small>STR : ${x.wisdom}</small> </td><td><small>DEX : ${x.luck}</small></td></tr>`
                    statsHtml += `</tbody></table></div>`

                    let skillHtml = `<div><a href='javascript: void(0)' class='btn btn-block btn-xs btn-primary' onclick='toggleStats(this)'>Show / Hide</a><table class=\'table table-hidden table-bordered\'><tbody>`
                    skillHtml += `<tr><td><small>Mining : ${parseFloat(x.mining) / 10}</small> </td><td><small>Gardening : ${parseFloat(x.gardening) / 10}</small></td></tr>`
                    skillHtml += `<tr><td><small>Fishing : ${parseFloat(x.fishing) / 10}</small> </td><td><small>Foraging : ${parseFloat(x.foraging) / 10}</small></td></tr>`
                    skillHtml += `</tbody></table></div>`

					return {
						...x,
						heroId : `
							<a href = 'https://kingdom.watch/hero/${x.id}' target = '__blank' class='hash-tag hash-tag--sm text-truncate'>
								${x.id}
							</a>
						`,
						profession : `
							<span style = 'margin-left:5px;' class = 'u-label u-label--xs u-label--badge-in u-label--secondary text-center text-nowrap'>
								<small>${x.profession.toUpperCase()}</small>
							</span>
						`,
                        class: `<span>${x.mainClass} / ${x.subClass}</span>`,
                        boost: `<span>${x.statBoost1} / ${x.statBoost2}</span>`,
                        stats: statsHtml,
						rarity : `
							<span class='text-${colorRarity[x.rarity]}'>
								${x.rarityName}
							</span>
						`,
						level : x.level,
                        skill: skillHtml,
						summonLeft: x.maxSummons - x.summons,
                        owner: `<a href='/address/${x.saleAuction?.seller?.id}' title='${x.saleAuction?.seller?.id}'>${x.saleAuction?.seller?.name}</a>`,
                        price: `${parseInt(parseFloat(x.salePrice) / 1e18).toFixed(2)} JEWEL<br/><small class='text-muted'> $ ${parseFloat(jewelPrice * (parseFloat(x.salePrice) / 1e18)).toFixed(2)}</small>`,
						staminaFullAt : moment.unix(x.staminaFullAt).fromNow()
					}
				});

				return res.json({
					draw: req.query.draw,
					recordsFiltered : parseInt(totalMarket),
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

	const getTavernMarket = async (options) => {
		return new Promise(async (resolve, reject) => {
			try {
				options = options||"";
				let query = `
                    query {
                        heros(
                            where: {
                                saleAuction_not: null
                            }
                            orderBy: salePrice
                            orderDirection: asc
                            first: ${options.limit}
                            skip: ${options.start}
                        ) {
                            id
                            saleAuction {
                                id
                                open
                                seller {
                                    id
                                    name
                                }
                                tokenId {
                                    id
                                }
                            }
                            salePrice
                            mainClass
                            subClass
                            summons
                            maxSummons
                            generation
                            level
                            rarity
                            profession
                            strength
                            agility
                            endurance
                            wisdom
                            dexterity
                            vitality
                            intelligence
                            luck
                            statBoost1
                            statBoost2
                            currentQuest
                            foraging
                            mining
                            gardening
                            fishing
                        }
                    }
                `;

				clientGraphql.query(query)
					.then(async (body) => {
						let data = body.data;
						let heros = data.heros;
						return resolve(heros);
					})
					.catch((err) => {
						console.log(err);
						return reject(err);
					});
			} catch (err) {
				return reject(err);
			}
		});
	}
}
module.exports = exports = Tavern