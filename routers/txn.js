const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const TrxModel = require('../models/transaksi')
const swapLib = require('../miners/swap')
const moment = require('moment')
const _ = require('underscore')
const {abis} = require('../miners/abis')

function Txn() {
    this.detail = async (req,res,next) => {
        let hash = req.params.hash
        if (hash=='404') {
            return res.render('detailTxn', {
                title: 'Defi Kingdoms Transaction Hash (Txhash) Detail',
                data: null
            });
        }
        
        try {
            let data = await TrxModel.findOne({hash: hash});
            if (data) {
                data.fee = (data.gas * parseInt(data.gasPrice)) / 10 ** 18;
            } else {
                trxData = await swapLib.parseTrx(hash)
                data = trxData.filter((t) => t != null)
                if (data.length > 0) {
                    data = data[0]
                } else {
                    return res.render('detailTxn', {
                        title: 'Defi Kingdoms Transaction Hash (Txhash) Detail',
                        data: null
                    })
                }
            }

            if (data) {
                data.fee = (data.gas * parseInt(data.gasPrice)) / 10 ** 18;
                /* CHECK ADDRESS FROM / TO */
                abis.map((t) => t.address = t.address.toLowerCase())
                let checkFrom = _.findWhere(abis, {address: data.from.toLowerCase()})
                let checkTo = _.findWhere(abis, {address: data.to.toLowerCase()})

                if (checkFrom) {
                    data.fromTag = checkFrom.type
                }
                if (checkTo) {
                    data.toTag = checkTo.type
                }

                /* PARSING TIME */
                data.timestamp = moment.unix(data.timestamp).fromNow() + ' ( ' + moment.unix(data.timestamp).format('MM/DD/YYYY HH:mm:ss A') + ' )'
            }

            // console.log(data)
            return res.render('detailTxn', {
                title: 'Defi Kingdoms Transaction Hash (Txhash) Detail',
                data: data
            });
        } catch (err) {
            console.log('[ERROR] ', err);
            return res.render('detailTxn', {
                title: 'Defi Kingdoms Transaction Hash (Txhash) Detail',
                data: null
            });
        }
    }
}
module.exports = exports = Txn;