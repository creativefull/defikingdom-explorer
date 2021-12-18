const express = require('express')
const app = express.Router()
const DashboardHandler = require('./dashboard'), Dashboard = new DashboardHandler()
const TxnHandler = require('./txn'), Txn = new TxnHandler()
const TokenHandler = require('./token'), Token = new TokenHandler()

app.get('/', Dashboard.index)
app.get('/jewel-stats', Dashboard.jewelStats)

app.get('/tx/:hash', Txn.detail)

app.get('/token/list', Token.list)
module.exports = exports = app