require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const port = process.env.PORT || 3090
let HMY_RPC_URL = process.env.HMY_RPC_URL || 'https://api.harmony.one';
const clientGraphql = require('graphql-client')({
  url: 'https://graph2.defikingdoms.com/subgraphs/name/defikingdoms/apiv5',
  headers: {
    'Content-Type': 'application/json'
  }
});

global.HMY_RPC_URL = HMY_RPC_URL;
global.clientGraphql = clientGraphql;
mongoose
  .connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/defikingdoms',
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }
  )
  .then(db => {
    if (process.env.NODE_ENV=='miner') {
      let miner = require('./miners/swap')
      let sync = require('./miners/deleteOldData')
  
      miner.sync()
      sync.deleteSync()
      setInterval(miner.sync, (60 * 1000))
      setInterval(sync.deleteSync, (60 * 1000) * 60)
    } else {
      app.use('/template', express.static(__dirname + '/statics/template'))
      app.use(express.static(__dirname + '/statics/assets'))
      app.set('views', __dirname + '/views')
      app.set('view engine', 'pug')
  
      app.use(require('./routers'))
      app.use('/api', require('./routers/api'))
      app.listen(port, () => console.log('Application Listen on Port', port))  
    }
  }).catch((e) => {
    console.error(e)
    process.exit(0)
  })