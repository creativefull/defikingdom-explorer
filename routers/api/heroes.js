const Web3 = require('web3')
const fs = require('fs')
const web3 = new Web3(HMY_RPC_URL)
const heroABI = require(__dirname + '/../../abi/heroes.json')
const tmpHeroID = __dirname + '/tmp/heroId.txt'

let contractHero = new web3.eth.Contract(heroABI, '0x5f753dcdf9b1ad9aabc1346614d1f4746fd6ce5c')
function Heroes() {
    this.index = async (req,res,next) => {
        let page = 0
        let limit = 10
        const tmpPathHeroID = await fs.readFileSync(tmpHeroID, 'utf-8')
        // console.log(contractHero.methods)
        let lastHeroId = parseInt(tmpPathHeroID)

        for(let i=lastHeroId; i<=(lastHeroId+1e3); i++) {
            try {
                let isHeroAvailable = await contractHero.methods.ownerOf(i).call();
                console.log(i, isHeroAvailable ? true: false)
                lastHeroId = i
                continue;
            } catch (e) {
                /* WRITE LAST HERO */
                await fs.writeFileSync(tmpHeroID, new Buffer.from((i-1).toString(), 'utf-8'))
                break;
            }
        }

        // console.log(detailHero)
        /* GET DATA HERO BY PAGING */
        let heroesData = [];
        for(let i=(lastHeroId-limit); i<=lastHeroId; i++) {
            let detailHero = await contractHero.methods.getHero(i).call()
            // console.log(detailHero)
            
            let output = {
                id: detailHero.id,
                summoningInfo: {...detailHero.summoningInfo},
                info: {...detailHero.info},
                state: {...detailHero.state},
                stats: {...detailHero.stats},
                primaryStatGrowth: {...detailHero.primaryStatGrowth},
                secondaryStatGrowth: {...detailHero.secondaryStatGrowth},
                professions: {...detailHero.professions}
            }
            heroesData.push(output)
        }

        return res.status(200).json({
            status: 200,
            message: 'OK',
            data: heroesData
        })
    }
}
module.exports = exports = Heroes