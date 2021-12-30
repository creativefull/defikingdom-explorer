const express = require('express')
const app = express.Router()
const DashboardHandler = require('./dashboard'), Dashboard = new DashboardHandler()
const ProfileHandler = require('./Profile'), Profile = new ProfileHandler();
const TransactionHandler= require('./Transaction'), Transaction = new TransactionHandler();

const TxnHandler = require('./txn'), Txn = new TxnHandler()
const TokenHandler = require('./token'), Token = new TokenHandler()
const HeroesHandler = require('./heroes'), Heroes = new HeroesHandler();

app.get('/', Dashboard.index)
app.get('/jewel-stats', Dashboard.jewelStats);
app.get('/error/:statusCode', Dashboard.notFound);
app.get('/search', Dashboard.searchTxn);

// DETAIL TRANSACTION
app.get('/tx/:hash', Txn.detail)

app.get('/token/list', Token.list);

app.get('/trx', Transaction.index);
app.get('/trx/dataTable', Transaction.dataTable);
app.get('/trx/:action', Transaction.trxByAction);
app.get('/trx/:action/dataTable', Transaction.dataTableOther);

app.get('/address/:address', Profile.address);
app.get('/address/:address/stats', Profile.stats);
app.get('/address/:address/trx/dataTable/:actionName', Profile.dataTableTransaction);
app.get('/address/:address/hero/dataTable', Profile.dataTableHeroes);

app.get('/hero/list', Heroes.index);
app.get('/hero/list/dataTable', Heroes.dataTable);
app.get('/hero/:heroID', Heroes.heroDetail);

module.exports = exports = app