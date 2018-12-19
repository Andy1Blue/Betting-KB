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
const db = require('./lib/db')
const helpers = require('./lib/helpers')

let session = []

app.use(cors());

//Required data: name, email, password
app.post('/register', (req, res) => {
  req.on('data', (data) => {
    let payload = Buffer.from(data).toString();
    const payloadObject = helpers.parseJsonToObject(payload);
    const name = typeof(payloadObject.name) == 'string' && payloadObject.name.trim().length > 0 ? payloadObject.name.trim() : false;
    const email = typeof(payloadObject.email) == 'string' && payloadObject.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(payloadObject.email.trim()) ? payloadObject.email.trim() : false;
    const password = typeof(payloadObject.password) == 'string' && payloadObject.password.trim().length > 5 ? payloadObject.password.trim() : false;

    if (name && email && password) {

      db.read('user', 'email', email)
        .then(() => {
          res.writeHead(403, {
            'Content-Type': 'application/json'
          });
          res.write(JSON.stringify({'Error' : 'This email address is already exist'}))
          res.end()
        })
        .catch(() => {
          const hashedPassword = helpers.hash(password);
          const userKey =  helpers.createRandomString(30);
          const date = Date.now();
          const user = {
            name,
            email,
            password : hashedPassword,
            ip : req.connection.remoteAddress,
            userKey,
            date
          }
          db.read('register', 'ip', user.ip)
            .then(data => {
              // console.log(data)
              if (Array.isArray(data) && Date.now() - data[0].date < 10000) {
                res.writeHead(403, {
                  'Content-Type': 'application/json'
                });
                res.write(JSON.stringify({'Message' : 'You must wait a moment'}));
                res.end();
              } else {
                if(Array.isArray(data) && data[0]) {
                  // console.log(data)
                  db.delete('register', 'id', data[0].id).catch(data => console.log(data));
                  db.create('register', user)
                    .then(data => {
                      // helpers.sendEmail(email, userKey);
                      
                      res.writeHead(200, {
                        'Content-Type': 'application/json'
                      });
                      res.write(JSON.stringify({'InsertId' : data.insertId}));
                      res.end();
                    })
                    .catch(data => {
                      res.writeHead(403, {
                        'Content-Type': 'application/json'
                      });
                      res.write(JSON.stringify({ 'Error': data }));
                      res.end();
                    });
                }

              }
            })
            .catch(data => {
              db.create('register', user)
                .then(data => {
                  // helpers.sendEmail(email, userKey);
                  
                  res.writeHead(200, {
                    'Content-Type': 'application/json'
                  });
                  res.write(JSON.stringify({'InsertId' : data.insertId}));
                  res.end();
                })
                .catch(data => {
                  res.writeHead(403, {
                    'Content-Type': 'application/json'
                  });
                  res.write(JSON.stringify({ 'Error': data }));
                  res.end();
                });
            })
        });
      
    } else {
      res.writeHead(403, {
        'Content-Type': 'application/json'
      });
      res.write(JSON.stringify({'Error' : 'Missing required field(s)'}))
      res.end()
    }
  });
});

app.get('/test', (req, res) => {
  db.read('competition', 'id', 1)
    .then(data => {
      db.read('match_', 'id_comp', 1)
        .then((dataMatch) => {
          
        let obj = data[0];
        obj.matches = dataMatch;
        res.writeHead(200, {
          'Content-Type': 'application/json'
        });
        res.write(JSON.stringify(obj))
        res.end()
      })
      .catch(() => {
        res.writeHead(200, {
          'Content-Type': 'application/json'
        });
        res.write(JSON.stringify(data))
        res.end()
      });
    })
    .catch(err => console.log(err))
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`))