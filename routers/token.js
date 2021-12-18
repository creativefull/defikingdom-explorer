const ListToken = require('../config/token.json')
const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const uniswapAbi = require('../abi/router.json')
const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko();

function TokenHandler() {
    this.list = async (req,res,next) => {
        let uniswapContract = new web3.eth.Contract(uniswapAbi, '0x24ad62502d1c652cc7684081169d04896ac20f30')
        let tokenJewel = '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F'.toLowerCase()
        let jewelPriceCG = await CoinGeckoClient.coins.fetchMarketChart('defi-kingdoms', {})
        let jewelUSDPrice = 0
        if (jewelPriceCG.code == 200) {
            jewelUSDPrice = jewelPriceCG.data.prices[jewelPriceCG.data.prices.length - 1][1]
        }

        let tokenListPrices = await Promise.all(ListToken.map(async (lt) => {
            // console.log((1 * (10 ** lt.decimals)));
            if (lt.address.toLowerCase() == tokenJewel) {
                return {
                    jewelPrice: 1,
                    usdPrice: parseFloat(parseFloat(jewelUSDPrice).toFixed(2)),
                    ...lt
                }
            } else {
                let getAmount = await uniswapContract.methods.getAmountsOut(web3.utils.toBN(Number(1 * (10 ** lt.decimals))), [lt.address.toLowerCase(), tokenJewel]).call().catch(console.error)
                let getPrice = parseFloat(parseFloat(parseInt(getAmount[1]) / 10 ** 18).toFixed(4))
                let usdPrice = getPrice * jewelUSDPrice

                let output = {
                    jewelPrice: getPrice,
                    usdPrice: parseFloat(parseFloat(usdPrice).toFixed(2)),
                    ...lt
                }

                return output
            }
        }))
        
        return res.render('tokenList', {
            title: 'List Token Defi Kingdoms',
            data: tokenListPrices
        })
    }
}
module.exports = exports = TokenHandler