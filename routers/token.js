const ListToken = require('../config/token.json')
const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const uniswapAbi = require('../abi/router.json')
// const CoinGecko = ret = new CoinGecko();
const {
    nativePrice
} = require('../lib/getPrice')

function TokenHandler() {

    this.list = async (req,res,next) => {
        
        
        return res.render('tokenList', {
            title: 'List Token Defi Kingdoms',
        })
    }

    this.dataTable = async (req, res, next) => {
        let uniswapContract = new web3.eth.Contract(uniswapAbi, '0x24ad62502d1c652cc7684081169d04896ac20f30')
        let tokenJewel = '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F'.toLowerCase();
        // let jewelPriceCG = await CoinGeckoClient.coins.fetchMarketChart('defi-kingdoms', {})
        let jewelUSDPrice = await nativePrice();

        // console.log('[PRICE USD] ', jewelUSDPrice);
        let tokenListPrices = await Promise.all(ListToken.map(async (lt) => {
            // console.log((1 * (10 ** lt.decimals)));
            if (lt.address.toLowerCase() == tokenJewel) {
                return {
                    avatar : `
                        <div class = 'avatar'>
                            <span class = 'avatar-title rounded-circle' style = 'background-color: transparent;'>
                                <img src = '${lt.logoURI}' alt='${lt.symbol}' width = '32px;' />
                            </span>
                        </div>
                    `,
                    name : `
                        </small>
                            Name : ${lt.name}
                            <br/>
                            Symbol : ${lt.symbol}
                        </small>
                    `,
                    addressToken : `
                        <small>
                            <a href = '#'>${lt.address}</a>
                        </small>
                    `,
                    jewelPrice: '1 Jewel',
                    usdPrice: `$ ${parseFloat(jewelUSDPrice).toFixed(2)}`,
                    ...lt
                }
            } else {
                let getAmount = await uniswapContract.methods.getAmountsOut(web3.utils.toBN(Number(1 * (10 ** lt.decimals))), [lt.address.toLowerCase(), tokenJewel]).call().catch(console.error)
                let getPrice = parseFloat(parseFloat(parseInt(getAmount[1]) / 10 ** 18).toFixed(4))
                let usdPrice = getPrice * jewelUSDPrice

                let output = {
                    avatar : `
                        <div class = 'avatar'>
                            <span class = 'avatar-title rounded-circle' style = 'background-color: transparent;'>
                                <img src = '${lt.logoURI}' alt='${lt.symbol}' width = '32px;' />
                            </span>
                        </div>
                    `,
                    name : `
                        <small>
                            Name : ${lt.name}
                            <br/>
                            Symbol : ${lt.symbol}
                        </small>
                    `,
                    addressToken : `
                        <small>
                            <a href = '#'>${lt.address}</a>
                        </small>
                    `,
                    jewelPrice: `${parseFloat(getPrice).toFixed(2)} Jewel`,
                    usdPrice: `$ ${parseFloat(usdPrice).toFixed(2)}`,
                    ...lt
                }

                return output
            }
        }));

        return res.json({
            draw: req.query.draw,
            recordsFiltered : tokenListPrices.length,
            recordsTotal : tokenListPrices.length,
            data : tokenListPrices
        });
    }
}
module.exports = exports = TokenHandler