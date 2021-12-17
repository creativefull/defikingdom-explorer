const express = require('express')
const app = express.Router()
const TrxHandler = require('./transaction'), Transaksi = new TrxHandler()

app.get('/trx/latest', Transaksi.latest)
app.get('/trx/:hash', Transaksi.byHash)
module.exports = exports = app