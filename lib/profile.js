const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const abi = require('../abi/profile.json')

exports.getProfile = async (address) => {
    let contract = new web3.eth.Contract(abi, '0xabD4741948374b1f5DD5Dd7599AC1f85A34cAcDD')
    let profile = await contract.methods.getProfileByAddress(address).call()
    if (profile) {
        return {
            name: profile._name,
            address: profile._owner,
            created: profile._created
        }
    } else {
        return null
    }
}