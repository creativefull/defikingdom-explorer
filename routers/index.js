const express = require('express')
const app = express.Router()
const DashboardHandler = require('./dashboard'), Dashboard = new DashboardHandler()
const ProfileHandler = require('./Profile'), Profile = new ProfileHandler();
const TransactionHandler= require('./Transaction'), Transaction = new TransactionHandler();

const TxnHandler = require('./txn'), Txn = new TxnHandler()
const TokenHandler = require('./token'), Token = new TokenHandler()

app.get('/', Dashboard.index)
app.get('/jewel-stats', Dashboard.jewelStats)

app.get('/tx/:hash', Txn.detail)

app.get('/token/list', Token.list)
app.get('/trx', Transaction.index);
app.get('/trx/dataTable', Transaction.dataTable);
app.get('/address/:address', Profile.address);
module.exports = exports = app