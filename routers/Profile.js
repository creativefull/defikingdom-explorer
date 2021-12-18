const Web3 = require('web3')
const web3 = new Web3(HMY_RPC_URL)
const InputDataDecoder = require('ethereum-input-data-decoder');
const erc20 = require('../abi/erc20.json')
const perBlock = 2 // 2 seconds default harmony

function Profile () {

	this.address = async (req, res, next) => {
		let address = req.params.address
		return res.render('profile',{
			title : `Defi Kingdoms - Address ${address}`,
			address : address,
		})
	}
}

module.exports = Profile;