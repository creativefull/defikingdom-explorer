const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const uniswapAbi = require('./../abi/router.json')

exports.nativePrice = () => {
    return new Promise(async (resolve, reject) => {
        let tokenJewel = '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F'.toLowerCase()
        let tokenBUSD = '0xe176ebe47d621b984a73036b9da5d834411ef734'.toLowerCase()

        let uniswapContract = new web3.eth.Contract(uniswapAbi, '0x24ad62502d1c652cc7684081169d04896ac20f30')

        let getAmount = await uniswapContract.methods.getAmountsOut(web3.utils.toBN(Number(1 * (10 ** 18))), [tokenJewel, tokenBUSD]).call().catch(console.error)
        if (!getAmount) return resolve(0)
        
        let usdPrice = parseFloat(parseFloat(parseInt(getAmount[1]) / 10 ** 18).toFixed(4))
        return resolve(usdPrice)
    })
}

exports.latestBlock = () => {
    return new Promise(async (resolve, reject) => {
        const block = await web3.eth.getBlockNumber()
        return resolve(block)
    })
}