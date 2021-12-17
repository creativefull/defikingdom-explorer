const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const TrxModel = require('../../models/transaksi')
const swapLib = require('../../miners/swap')

function Transaction() {
    this.latest = async (req,res,next) => {
        let page = req.query.page || 0
        let limit = req.query.limit || 10

        let trxData = await TrxModel.find().sort({_id: -1}).skip(page).limit(limit)
        return res.status(200).json({
            status: 200,
            data: trxData
        })
    }

    this.byHash = async (req,res,next) => {
        let hash = req.params.hash

        let trxData = await TrxModel.findOne({hash: hash})
        if (trxData) {
            return res.status(200).json({
                status: 200,
                data: trxData
            })
        } else {
            trxData = await swapLib.parseTrx(hash)
            let output = trxData.filter((t) => t != null)
            if (output.length > 0) {
                return res.status(200).json({
                    status: 200,
                    data: output
                })
            } else {
                return res.status(404).json({
                    status: 404,
                    data: null,
                    message: 'Not Found Transaction Hash'
                })
            }
        }
    }
}
module.exports = exports = Transaction