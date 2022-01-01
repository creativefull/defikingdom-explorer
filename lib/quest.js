const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const questCore = require('./../abi/quest.json')
const abiERC20 = require('../abi/erc20.json')
const abiDecoder = require('abi-decoder');
const _ = require('underscore')
const moment = require('moment');
const { getProfile } = require('./profile');

const questIdName = [{
	name: 'FORAGING',
	address: '0x3132c76acf2217646fb8391918d28a16bd8a8ef4'
}, {
	name: 'MINING',
	address: '0x569e6a4c2e3af31b337be00657b4c040c828dd73'
}, {
	name: 'FISHING',
	address: '0xe259e8386d38467f0e7ffedb69c3c9c935dfaefc'
}, {
	name: 'GARDENING',
	address: '0xe4154b6e5d240507f9699c730a496790a722df19'
}]
let questContract = new web3.eth.Contract(questCore, '0x5100bd31b822371108a0f63dcfb6594b9919eaf4')

exports.completeQuest = async (txhash) => {
    abiDecoder.addABI(questCore);
    let trxDetail = await web3.eth.getTransactionReceipt(txhash)
    let logs = abiDecoder.decodeLogs(trxDetail?.logs)

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
    
    let questID = questData.QuestCompleted[0]?.data[0]?.value
    if (questID) {
        let questLog = await questContract.methods.getQuest(questID).call()
        let questName = _.findWhere(questIdName, {address: questLog['quest']?.toLowerCase()})

        questData.QuestDetail = {
            player: await getProfile(questLog['player']),
            questName: questName?.name
        }
    }

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

exports.startQuest = async (txhash) => {
    abiDecoder.addABI(questCore);
    let trxDetail = await web3.eth.getTransactionReceipt(txhash)
    let logs = abiDecoder.decodeLogs(trxDetail?.logs)

    let questID = logs[0]?.events[0]?.value

    if (questID) {
        let questData = await questContract.methods.getQuest(questID).call()
        let questName = _.findWhere(questIdName, {address: questData['quest']?.toLowerCase()})

        let output = {
            data: []
        }
        let profile = await getProfile(questData['player'])
        questData['heroes'].forEach((h) => {
            output.data.push({
                id: questID,
                hero: h,
                quest: questName,
                player: profile?.name,
                startTime: moment.unix(questData['startTime']).format('MM/DD/YYYY HH:mm:ss') + ' UTC',
                completeAtTime: moment.unix(questData['completeAtTime']).format('MM/DD/YYYY HH:mm:ss') + ' UTC',
                status: questData['status']
            })
        })
        return output
    }
    return null
}