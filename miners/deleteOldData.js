const TransaksiModel = require('../models/transaksi')
const moment = require('moment')

exports.deleteSync = async () => {
    let totalData = await TransaksiModel.countDocuments({timestamp: {$lte: moment().subtract(1, 'days').unix()}})
    await TransaksiModel.deleteMany({timestamp: {$lte: moment().subtract(1, 'days').unix()}})
    console.log('Deleted', totalData, 'Datas')
}