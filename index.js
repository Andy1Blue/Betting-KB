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
const helpers = require('./lib/helpers')

app.use(cors());
//test
app.get('/:userEmail', (req, res) => {
  db.test('register', 'user_email', req.params.userEmail).then(user => {
    res.send(JSON.stringify(user))
  }).catch(err => res.send())
})

//get user
app.get('/user/:userEmail', (req, res) => {
  db.getUser('user', 'user_email', req.params.userEmail).then(user => {
    res.send(JSON.stringify(user))
  })
})

//get register
app.get('/register/:userEmail', (req, res) => {
  db.getUser('register', 'user_email', req.params.userEmail).then(user => {
    res.send(JSON.stringify(user))
  }).catch(err => res.send(err))
})

//testing helpers.sendmail
app.get('/mail', (req, res) => {
  helpers.sendEmail("pawel.kopycki@komtech.eu", "eeeeeeeeee")
})

//testing register
app.get('/register', (req, res) => {
  let user = {
    name: 'test24ssss',
    email: 'test11@test.pl',
    password: '123456789',
    ip: req.connection.remoteAddress,

  }
  db.register(user).then(data => {
    res.send(JSON.stringify(data))
  }).catch(err => res.send())
    
  
  
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))