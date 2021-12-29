const tokenList = require('../config/token.json')
const erc20abis = tokenList.map((t) => {
    return {
        type: t.symbol,
        address: t.address,
        abi: require('../abi/erc20.json'),
        icon: 'fa-icon',
        color: '#FFF'
    }
})

exports.abis = [{
    'type': 'ROUTER',
    'address': '0x24ad62502d1c652cc7684081169d04896ac20f30',
    'abi': require('../abi/router.json'),
    'icon': 'fa-arrows-alt-h',
    'color': '#1EBC61'
}, {
    'type': 'BANK',
    'address': '0xa9ce83507d872c5e1273e745abcfda849daa654f',
    'abi': require('../abi/bank.json'),
    'icon': 'fa-piggy-bank',
    'color': '#F9BF3B'
}, {
    'type': 'QUEST',
    'address': '0x5100bd31b822371108a0f63dcfb6594b9919eaf4',
    'abi': require('../abi/quest.json'),
    'icon': 'icon-drop',
    'color': '#FFA27B'
}, {
    'type': 'AUCTION',
    'address': '0x13a65b9f8039e2c032bc022171dc05b30c3f2892',
    'abi': require('../abi/saleAuction.json'),
    'icon': 'icon-basket-loaded',
    'color': '#ACBAC9'
}, {
    'type': 'PROFILE',
    'address': '0xabD4741948374b1f5DD5Dd7599AC1f85A34cAcDD',
    'abi': require('../abi/profile.json'),
    'icon': 'icon-user',
    'color': '#ACBAC9'
}, {
    'type': 'SUMMONING',
    'address': '0xa2D001C829328aa06a2DB2740c05ceE1bFA3c6bb',
    'abi': require('../abi/summoning.json'),
    'icon': 'icon-user',
    'color': '#ACBAC9'
}, {
    'type': 'SUMMONING',
    'address': '0x65dea93f7b886c33a78c10343267dd39727778c2',
    'abi': require('../abi/crystal.json'),
    'icon': 'icon-user',
    'color': '#ACBAC9'
}, {
    'type': 'GARDEN',
    'address': '0xdb30643c71ac9e2122ca0341ed77d09d5f99f924',
    'abi': require('../abi/garden.json'),
    'icon': 'icon-user',
    'color': '#ACBAC9'
}, ...erc20abis]