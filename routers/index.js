const express = require('express')
const app = express.Router()
const DashboardHandler = require('./dashboard'), Dashboard = new DashboardHandler()
const ProfileHandler = require('./Profile'), Profile = new ProfileHandler();
const TransactionHandler= require('./Transaction'), Transaction = new TransactionHandler();

const TxnHandler = require('./txn'), Txn = new TxnHandler()
const TokenHandler = require('./token'), Token = new TokenHandler()
const HeroesHandler = require('./heroes'), Heroes = new HeroesHandler();
const TavernHandler = require('./tavern'), Tavern = new TavernHandler();

app.get('/', Dashboard.index)
app.get('/jewel-stats', Dashboard.jewelStats)

// DETAIL TRANSACTION
app.get('/tx/:hash', Txn.detail)

app.get('/token/list', Token.list);

app.get('/trx', Transaction.index);
app.get('/trx/dataTable', Transaction.dataTable);
app.get('/trx/:action', Transaction.trxByAction);
app.get('/trx/:action/dataTable', Transaction.dataTableOther);

app.get('/address/:address', Profile.address);
app.get('/address/:address/stats', Profile.stats);
app.get('/address/:address/trx/dataTable', Profile.dataTableTransaction);
app.get('/address/:address/hero/dataTable', Profile.dataTableHeroes);

app.get('/hero/list', Heroes.index);
app.get('/hero/list/dataTable', Heroes.dataTable);
app.get('/hero/:heroID', Heroes.heroDetail);

app.get('/tavern', Tavern.index)
app.get('/tavern/list/datatable', Tavern.dataTable)
module.exports = exports = app