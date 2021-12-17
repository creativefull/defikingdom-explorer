const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const TrxModel = require('../models/transaksi')
const moment = require('moment')
const _ = require('underscore')

function Txn() {
    this.detail = async (req,res,next) => {
        let hash = req.params.hash
        let data = await TrxModel.findOne({hash: hash})

        data.fee = (data.gas * parseInt(data.gasPrice)) / 10 ** 18;

        return res.render('detailTxn', {
            title: 'Defi Kingdoms Transaction Hash (Txhash) Detail',
            data: data
        })
    }
}
module.exports = exports = Txn;