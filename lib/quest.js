const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const questCore = require('./../abi/quest.json')
const abiERC20 = require('../abi/erc20.json')
const abiDecoder = require('abi-decoder');
const _ = require('underscore')

exports.completeQuest = async (txhash) => {
    abiDecoder.addABI(questCore);
    let trxDetail = await web3.eth.getTransactionReceipt(txhash)
    let logs = abiDecoder.decodeLogs(trxDetail.logs)

    let questData = {
        QuestStaminaSpent: [],
        QuestReward: [],
        QuestXP: [],
        QuestCompleted: []
    }

    logs.forEach((l) => {
        questData[l.name]?.push({
            data: l.events
        })

    })
    
    let newQuestReward = await Promise.all(
        questData.QuestReward.map(async (q, index) => {
            if (q.data[3].value != '0x0000000000000000000000000000000000000000') {
                let contractERC = new web3.eth.Contract(abiERC20, q.data[3].value)
                let symbol = await contractERC.methods.symbol().call()
                let decimals = await contractERC.methods.decimals().call()
                q.data[3].value = symbol
                q.data[4].value = parseFloat(parseFloat(q.data[4].value) / 10 ** parseInt(decimals)).toFixed(2)
                return q
            }
        })
    )
    questData.QuestReward = newQuestReward.filter((v) => v != null)
    return questData;
}