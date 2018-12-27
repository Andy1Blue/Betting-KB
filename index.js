/*
 *
 *Primary file for API
 *
 */

//Dependencies
const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');
const db = require('./lib/db');
const helpers = require('./lib/helpers');
const _data = require('./lib/dataFs');

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
                if (Array.isArray(data) && data[0]) {
                  // console.log(data)
                  db.delete('register', 'id', data[0].id).catch(data => console.log(data));
                  db.create('register', user)
                    .then(data => {
                      helpers.sendEmail(email, userKey);
                      
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
            .catch(() => {
              db.create('register', user)
                .then(data => {
                  helpers.sendEmail(email, userKey);
                  
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
            });
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

app.get('/register/:key', (req, res) => {
  const key = req.params.key;
  db.read('register', 'userKey', key)
    .then(data => {
      const userObj = data[0];
      const registerId = userObj.id;
      delete userObj.userKey;
      delete userObj.id;
      userObj.access = 0;
      // console.log(userObj)
      db.create('user', userObj)
      .then(() => {
        console.log(registerId)
          db.delete('register', 'id', registerId).catch(data => console.log(data));
          res.writeHead(200, {
            'Content-Type': 'application/json'
          });
          res.write(JSON.stringify({ 'Info': `New user has been added` }));
          res.end();
        })
        .catch(err => {
          res.writeHead(403, {
            'Content-Type': 'application/json'
          });
          res.write(JSON.stringify({ 'Error': err }));
          res.end();
        });
    })
    .catch(() => {
      res.writeHead(403, {
        'Content-Type': 'application/json'
      });
      res.write(JSON.stringify({ 'Error': 'User key is not valid' }));
      res.end();
    });
});

//Required data: email, password
app.post('/login', (req, res) => {
  req.on('data', data => {
    let payload = Buffer.from(data).toString();
    const payloadObject = helpers.parseJsonToObject(payload);
    const email = typeof(payloadObject.email) == 'string' && payloadObject.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(payloadObject.email.trim()) ? payloadObject.email.trim() : false;
    const password = typeof(payloadObject.password) == 'string' && payloadObject.password.trim().length > 5 ? payloadObject.password.trim() : false;

    if (email && password) {
      db.read('user', 'email', email)
      .then(dataUser => {
        //Hash the send password and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === dataUser[0].password) {
          //If valid, create a new token with a random name. Set expiration date 1 hour in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            email,
            id : tokenId,
            expires,
            accessLevel: dataUser[0].access
          };

          //Store the token
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              res.writeHead(200, {
                'Content-Type': 'application/json'
              });
              res.write(JSON.stringify(tokenObject))
              res.end()
            } else {
              res.writeHead(500, {
                'Content-Type': 'application/json'
              });
              res.write(JSON.stringify({'Error' : 'Could not create the new token'}))
              res.end()
              
            }
          });
        } else {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });
          res.write(JSON.stringify({'Error' : 'Password did not match the specified user\'s stored password'}))
          res.end()
        }
      })
      .catch((err) => {
        helpers.response(res, 403, {'Error' : 'This email does not exist'});
      })
    } else {
      res.writeHead(403, {
        'Content-Type': 'application/json'
      });
      res.write(JSON.stringify({'Error' : 'Missing required field(s)'}))
      res.end()
    }
  });
});

//Required data: token, email, bet: id user, id match, bet
app.post('/bet', (req, res) => {
  req.on('data', (data) => {
    let payload = Buffer.from(data).toString();
    const payloadObject = helpers.parseJsonToObject(payload);
    // const name = typeof (payloadObject.name) == 'string' && payloadObject.name.trim().length > 0 ? payloadObject.name.trim() : false;
    const email = typeof (payloadObject.email) == 'string' && payloadObject.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(payloadObject.email.trim()) ? payloadObject.email.trim() : false;
    // const bets = typeof (payloadObject.bets) == 'object' && payloadObject.bets instanceof Array && payloadObject.length > 0 ? payloadObject.bets : false;
    // const idUser = typeof(payloadObject.idUser) == 'string' && payloadObject.idUser.trim().length > 0 ? payloadObject.idUser.trim() : false;
    const idMatch = typeof(payloadObject.idMatch) == 'number' && payloadObject.idMatch > 0 ? payloadObject.idMatch : false;
    const bet = typeof(payloadObject.bet) == 'number' && [1, 2, 3].indexOf(payloadObject.bet) > -1 ? payloadObject.bet : false;
  
  
    if (email && idMatch && bet) {
      //Get the token from the headers
      const token = typeof(req.headers.token) =='string' && req.headers.token.length == 20 ? req.headers.token : false;
      // console.log(typeof(req.headers.token))
      // let idUser = 0;
      helpers.verifyToken(token, email, (tokenIsValid) => {
        // console.log(helpers.parseJsonToObject(data))
        if (tokenIsValid) {
          db.read('user', 'email', email)
          .then(userData => {
            const userId = userData[0].id;
            const dataBet = {
              'id_user' : userId,
              'id_match' : idMatch,
              'bet' : bet
            }
            db.read('bet', 'id_user', userId)
            .then(betData => {
              let isBetExist = false
              betData.forEach(bet => {
                if (bet.id_user === userId && bet.id_match === idMatch) {
                  isBetExist = true;
                }
              });

              if (isBetExist) {
                helpers.response(res, 403, {'Error' : 'this bet already exist'});
              } else {
                db.create('bet', dataBet)
                .then(() => {
                  helpers.response(res, 200, {'Message' : 'New bet has been added'});
                })
                .catch((err) => {
                  helpers.response(res, 500, {'Error' : 'Could not add new bet'});
                });

              }
            });
          });
          

        } else {
          helpers.response(res, 403, {'Error' : 'Missing required token in header, or token is invalid'});
        }
      });
    } else {
      helpers.response(res, 403, {'Error' : 'Missing required field(s)'});
    }
  })
  
});

// app.get('/(\\w+)', (req, res) => {
//   helpers.response(res, 400, {'Error' : 'Not Found'})
// });

//Required data: token, email
app.get('/user', (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;

  if (email) {
    const token = typeof(req.headers.token) =='string' && req.headers.token.length == 20 ? req.headers.token : false;

    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
        .then(dataUser => {
          const userObj = {
            'name' : dataUser[0].name,
            'email' : dataUser[0].email,
          }
          db.read('bet', 'id_user', dataUser[0].id)
          .then(betsData => {
            userObj.bets = betsData
            helpers.response(res, 200, userObj)
          })
          .catch(() => {
            userObj.bets = []
            helpers.response(res, 200, userObj)
          })
        })
        .catch(() => {
          helpers.response(res, 404)
        });
      } else {
        helpers.response(res, 403, {'Error' : 'Missing required token in header, or token is invalid'});
      }
    });
  } else {
    helpers.response(res, 403, {'Error' : 'Missing required field(s)'});
  }
});

//Get all competition
app.get('/competition', (req, res) => {
  db.read('competition')
  .then(compData => {
    helpers.response(res, 200, compData)
  })
  .catch((err) => {
    helpers.response(res, 403, err);
  })
});

app.get('/test/:id', (req, res) => {
  const id = req.params.id;
  
  db.read('competition', 'id', id)
    .then(data => {
      let obj = data[0];
      db.read('match_', 'id_comp', id)
        .then((dataMatch) => {
          
        obj.matches = dataMatch;
        res.writeHead(200, {
          'Content-Type': 'application/json'
        });
        res.write(JSON.stringify(obj))
        res.end()
      })
      .catch(() => {
        obj.matches = [];
        res.writeHead(200, {
          'Content-Type': 'application/json'
        });
        res.write(JSON.stringify(obj))
        res.end()
      });
    })
    .catch(err => {
      res.writeHead(404, {
        'Content-Type': 'application/json'
      });
      res.write(JSON.stringify(err))
      res.end()
    })
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`))