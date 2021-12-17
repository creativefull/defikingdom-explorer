const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const TrxModel = require('../models/transaksi')
const moment = require('moment')

function Dashboard() {
    this.index = async (req,res,next) => {
        let trxData = await TrxModel.find().sort({_id: -1}).skip(0).limit(10)

        let outputs = trxData.map((trx) => {
            trx.timestamp = moment.unix(trx.timestamp).fromNow()
            let amount = 0
            trx.tokenTransfers.forEach((t) => {
                if (t.symbol == 'JEWEL') {
                    amount += t.amount
                }
            })
            trx.amount = parseFloat(amount).toFixed(2)
            return trx
        })
        return res.render('main', {
            title: 'Dashboard',
            lastTrx: outputs
        })
    }
}
module.exports = exports = Dashboard