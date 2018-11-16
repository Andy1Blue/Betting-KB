/*
 *
 *Primary file for API
 *
 */


//Dependencies
const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const db = require('./lib/data')
// const helpers = require('.lib/helpers')

app.use(cors());
app.get('/user/:userEmail', (req, res) => {
  db.getUser(req.params.userEmail).then(user => {
    res.send(JSON.stringify(user))
  })
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))