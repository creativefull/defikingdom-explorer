const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const InputDataDecoder = require('ethereum-input-data-decoder');
const abis = require('./abis')
const erc20 = require('../abi/erc20.json')
const perBlock = 2 // 2 seconds default harmony
const TransaksiModel = require('../models/transaksi')
// let earlyBlock = (60 / perBlock) * 60 * 24
let earlyBlock = (30 / 2)

let parseTokenTransfer = (detail) => {
    return new Promise(async (resolve, reject) => {
        let logs = await web3.eth.getPastLogs({
            fromBlock: detail.blockNumber,
            toBlock: detail.blockNumber,
            topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']
        })
    
        if (logs && logs.length > 0) {
            /* CHECK ALL LOG */
            let tokenTransfer = await Promise.all(logs.map(async (log) => {
                if (log.transactionHash == detail.transactionHash) {
                    const result = web3.utils.toBN(log.data).toString();
                    let contract = new web3.eth.Contract(erc20, log.address)
                    let name = await contract.methods.name().call()
                    let symbol = await contract.methods.symbol().call()
                    let decimal = await contract.methods.decimals().call()
                    let amount = parseInt(result) / (10 ** parseInt(decimal))
    
                    if (log.topics.length > 2) {
                        let from = log.topics[1]
                        let to = log.topics[2]
                        to = '0x' + to.substring(26, to.length)
                        from = '0x' + from.substring(26, from.length)
    
                        return {
                            amount: amount,
                            to: to,
                            from: from,
                            name: name,
                            symbol: symbol,
                            decimal: decimal
                        }
                    }
                }
            }))
    
            let outputs = tokenTransfer.filter((t) => t != null)
    
            detail.tokenTransfers = outputs
        }

        return resolve(detail)
    })
}

let parseTrx = (hash) => {
    return new Promise(async (resolve, reject) => {
        let detail = await web3.eth.getTransactionReceipt(hash)
        let trxDetail = await web3.eth.getTransaction(hash)
    
        if (detail) {
            let trxData = await Promise.all(
                abis.abis.map(async (abi, index) => {
                    if ((detail.to.toLowerCase() == abi.address) || (detail.from.toLowerCase() == abi.address)) {
                        let d = await parseTokenTransfer(detail)
                        let blockDetail = await web3.eth.getBlock(detail.blockNumber)
        
                        if (d.tokenTransfers) {
                            trxDetail.tokenTransfers = d.tokenTransfers
                        }
        
                        const decoder = new InputDataDecoder(abi.abi);
                        let decodeInput = decoder.decodeData(trxDetail.input)
                        if (decodeInput.method) {
                            trxDetail.method = decodeInput.method
                        } else {
                            trxDetail.method = trxDetail.v
                        }
        
                        trxDetail.success = detail.status
                        trxDetail.actionName = abi.type
                        trxDetail.timestamp = blockDetail.timestamp
        
                        await TransaksiModel.findOneAndUpdate({
                            hash: trxDetail.hash
                        }, trxDetail, {
                            new: true,
                            upsert: true,
                            rawResult: true
                        })
                        console.log('Mined Transaction', trxDetail.hash)

                        return trxDetail
                    } else {
                        return null
                    }
                })
            )

            return resolve(trxData)
        } else {
            return resolve(null)
        }
    })
}

async function callback(err, data) {
    if (data && data.transactions.length > 0) {
        data.transactions.forEach((trx) => {
            parseTrx(trx)
        })
    }
}

async function run() {
    const latestBlock = await web3.eth.getBlockNumber()
    let startBlock = latestBlock - parseInt(earlyBlock)

    console.log('Running Mining Transaction Swap')
    console.log('Start Block', startBlock)
    console.log('Latest Block', latestBlock)

    const batch = new web3.eth.BatchRequest()
    for(let i=startBlock; i<=latestBlock; i++) {
        batch.add(web3.eth.getBlock.request(i, callback))
    }

    batch.execute()
}

module.exports = exports = {
    sync: run,
    parseTrx: parseTrx,
    parseTokenTransfer: parseTokenTransfer
}