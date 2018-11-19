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
  db.get('register', 'user_email', req.params.userEmail).then(user => {
    res.send(JSON.stringify(user))
  }).catch(err => res.send())
})

//get user
app.get('/register/:key', (req, res) => {
  db.get('register', 'user_key', req.params.key).then(user => {
    res.send(JSON.stringify(user))
  }).catch(err => res.send(err))
})

//get register
app.post('/register', (req, res) => {
  req.on('data', data => {
    let user = JSON.parse(Buffer.from(data).toString())
    // user.ip = "4";
    // console.log(user)
    db.register(user).then(user => {
      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      // console.log(user)
      res.write(JSON.stringify(user))
      res.end()
    }).catch(err => {
      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      // console.log(err)
      res.write(JSON.stringify(err))
      res.end()
    })
  })
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