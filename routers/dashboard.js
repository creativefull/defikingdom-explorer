const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const TrxModel = require('../models/transaksi')
const moment = require('moment')
const _ = require('underscore')
const {abis} = require('../miners/abis')
let abiQuest = require('../abi/quest.json')
const InputDataDecoder = require('ethereum-input-data-decoder');
const CoinGecko = require('coingecko-api')
const CoinGeckoClient = new CoinGecko();
const {
    nativePrice, latestBlock
} = require('../lib/getPrice')

function Dashboard() {
    this.index = async (req,res,next) => {        
        let trxData = await TrxModel.find().sort({timestamp: -1}).skip(0).limit(5)
        let questData = await TrxModel.find({actionName: "QUEST"}).sort({timestamp: -1}).skip(0).limit(5)

        let outputs = trxData.map((trx) => {
            trx.timestamp = moment.unix(trx.timestamp).fromNow()
            let amount = 0
            trx.tokenTransfers?.forEach((t) => {
                if (t.symbol == 'JEWEL') {
                    amount += t.amount
                }
            })
            trx.amount = parseFloat(amount).toFixed(2)
            let abi = _.findWhere(abis, {type: trx.actionName})
            if (abi) {
                trx.icon = abi.icon
                trx.bgColor = abi.color
            }
            return trx
        })

        let questOutput = questData.map((q) => {
            q.timestamp = moment.unix(q.timestamp).fromNow()

            let decoder = new InputDataDecoder(abiQuest);
            if (q.method == 'startQuest') {
                let result = decoder.decodeData(q.input);
                let questId = '0x' + result.inputs[1]

                if (questId.toLowerCase() == '0x3132c76acf2217646fb8391918d28a16bd8a8ef4') {
                    q.questName = 'FOREGING'
                } else if (questId.toLowerCase() == '0xe259e8386d38467f0e7ffedb69c3c9c935dfaefc') {
                    q.questName = 'FISHING'
                } else {
                    q.questName = 'UNKNOWN'
                }
            }
            return q;
        })

        return res.render('main', {
            title: 'Dashboard',
            lastTrx: outputs,
            quests: questOutput
        })
    }

    this.searchTxn = async (req, res, next) => {
        const body = req.query;
        let key = body.search;
        let f = body.f;
        console.log('[BODY] ', body);
        let trxData = await TrxModel.findOne({
            $or : [{
                hash : key
            },{
                from : key
            },{
                to : key
            }]
        });
        if (trxData) {
            return res.redirect(`/tx/${trxData.hash}`);
        } else {
            return res.redirect(`/tx/404`);
        }
    }

    this.notFound = async (req, res, next) => {
        return res.render('not-found',{
            statusCode : req.params.statusCode,
            title : 'Result'
        });
    }

    this.jewelStats = async (req,res,next) => {
        let data = await CoinGeckoClient.coins.fetchMarketChart('defi-kingdoms', {})
        let jewelPrice = await nativePrice()
        let block = await latestBlock()
        data.finalPrice = jewelPrice
        data.block = block

        return res.json(data)
    }
}
module.exports = exports = Dashboard