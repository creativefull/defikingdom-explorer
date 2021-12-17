const express = require('express')
const app = express.Router()
const DashboardHandler = require('./dashboard'), Dashboard = new DashboardHandler()
const TxnHandler = require('./txn'), Txn = new TxnHandler()

app.get('/', Dashboard.index)
app.get('/jewel-stats', Dashboard.jewelStats)

app.get('/tx/:hash', Txn.detail)
module.exports = exports = app