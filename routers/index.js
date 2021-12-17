const express = require('express')
const app = express.Router()
const DashboardHandler = require('./dashboard'), Dashboard = new DashboardHandler()
const HeroesHandler = require('./Heroes'), Heroes = new HeroesHandler()
const TransactionHandler= require('./Transaction'), Transaction = new TransactionHandler();

app.get('/', Dashboard.index)
app.get('/heroes', Heroes.index)
app.get('/trx', Transaction.index);
module.exports = exports = app