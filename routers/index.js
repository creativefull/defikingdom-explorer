const express = require('express')
const app = express.Router()
const DashboardHandler = require('./dashboard'), Dashboard = new DashboardHandler()
const HeroesHandler = require('./Heroes'), Heroes = new HeroesHandler()

app.get('/', Dashboard.index)
app.get('/heroes', Heroes.index)
module.exports = exports = app