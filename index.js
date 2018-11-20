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

let session = []

app.use(cors());
//test
// app.get('/:userEmail', (req, res) => {
//   db.get('user', 'user_email', req.params.userEmail).then(user => {
//     res.send(JSON.stringify(user))
//   }).catch(err => res.send())
// })

//adding a verified user
app.get('/register/:key', (req, res) => {
  db.addVerifiedUser(req.params.key).then(user => {
    res.send(JSON.stringify(user));
  }).catch(err => res.send(err));
});

//Login

app.post('/login', (req, res) => {
  req.on('data', data => {
    let user = JSON.parse(Buffer.from(data).toString())
    let password = helpers.hash(user.password)
    db.get('user', 'user_email', user.email).then(userFromDb => {
      console.log('email: ' + user.email)
      console.log('pass: ' + password)
      if(Array.isArray(userFromDb) && userFromDb[0].user_email === user.email && userFromDb[0].user_password ===  password){
        let token = helpers.createRandomString(10)
        let ses = {}
        console.log(req.headers.sesion)
        if(req.headers.sesion !== '') {
          let x = session.filter(ses => ses.token === req.headers.sesion);
          console.log(x)
          res.send(session)
        } else {
          ses= {
            userName : userFromDb[0].user_name,
            token : token,
            ip:req.connection.remoteAddress,
            date: Date.now()
          }
          
          session.push(ses)
            res.send(ses)

        }
        
        // res.send({dir : })

      }else {
        res.send({err : 'hhhh'})
      }
    });
  });
});

//Register user
app.post('/register', (req, res) => {
  req.on('data', data => {
    let user = JSON.parse(Buffer.from(data).toString())
    user.ip = req.connection.remoteAddress;
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

app.get('/', (req, res) => {
  let token = helpers.createRandomString(10)
  let ses = {}
  // console.log(req.headers)
  if(req.headers.sesion) {
    let x = session.filter(ses => ses.token === req.headers.sesion);
    console.log(x)
    res.send(x)
  } else {
    ses= {
      token : token,
      ip:req.connection.remoteAddress,
      date: Date.now()
    }
    
    session.push(ses)
      res.send(ses)

  }
  
  // console.log(session)
  })
  


app.listen(port, () => console.log(`Example app listening on port ${port}!`))