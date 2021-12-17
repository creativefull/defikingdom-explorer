const express = require('express')
const app = express.Router()
const DashboardHandler = require('./dashboard'), Dashboard = new DashboardHandler()

app.get('/', Dashboard.index)
module.exports = exports = app