/*
 *
 * Primary file for API
 *
 */

//Dependencies
const express = require('express');
const cors = require('cors');
const db = require('./lib/db');
const helpers = require('./lib/helpers');
const _data = require('./lib/dataFs');
const config = require('./config');
const app = express();
const bet = require('./lib/bet')
const admin = require('./lib/admin')

// let session = [];

app.use(cors());
app.use(express.static('public'));

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
        .then((exist) => {
          helpers.response(res, 403, {'Error' : 'This email address is already exist'});

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
              if (Array.isArray(data) && Date.now() - data[0].date < 10000) {
                helpers.response(res, 403, {'Message' : 'You must wait a moment'});

              } else {
                if (Array.isArray(data) && data[0]) {
                  db.delete('register', 'id', data[0].id).catch(data => console.log(data));
                  db.create('register', user)
                    .then(data => {
                      helpers.sendEmail(email, userKey);
                      helpers.response(res, 200, {'InsertId' : data.insertId});
                    })
                    .catch(data => {
                      helpers.response(res, 403, {'Error': data });
                    });
                  }

                }
              })
              .catch(() => {
                db.create('register', user)
                .then(data => {
                  helpers.sendEmail(email, userKey);
                  helpers.response(res, 200, {'InsertId' : data.insertId});
                })
                .catch(data => {
                  helpers.response(res, 403, {'Error': data });
                });
            });
        });

    } else {
      helpers.response(res, 403, {'Error' : 'Missing required field(s)'});
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
          res.write(JSON.stringify({
            'Info': `New user has been added`
          }));
          res.end();
        })
        .catch(err => {
          res.writeHead(403, {
            'Content-Type': 'application/json'
          });
          res.write(JSON.stringify({
            'Error': err
          }));
          res.end();
        });
    })
    .catch(() => {
      res.writeHead(403, {
        'Content-Type': 'application/json'
      });
      res.write(JSON.stringify({
        'Error': 'User key is not valid'
      }));
      res.end();
    });
});

//Required data: email, password
app.post('/login', (req, res) => {
  req.on('data', data => {
    let payload = Buffer.from(data).toString();
    const payloadObject = helpers.parseJsonToObject(payload);
    const email = typeof (payloadObject.email) == 'string' && payloadObject.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(payloadObject.email.trim()) ? payloadObject.email.trim() : false;
    const password = typeof (payloadObject.password) == 'string' && payloadObject.password.trim().length > 5 ? payloadObject.password.trim() : false;

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
              id: tokenId,
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
                res.write(JSON.stringify({
                  'Error': 'Could not create the new token'
                }))
                res.end()

              }
            });
          } else {
            res.writeHead(400, {
              'Content-Type': 'application/json'
            });
            res.write(JSON.stringify({
              'Error': 'Password did not match the specified user\'s stored password'
            }))
            res.end()
          }
        })
        .catch((err) => {
          helpers.response(res, 403, {
            'Error': 'This email does not exist'
          });
        })
    } else {
      res.writeHead(403, {
        'Content-Type': 'application/json'
      });
      res.write(JSON.stringify({
        'Error': 'Missing required field(s)'
      }))
      res.end()
    }
  });
});

//Required data: token, email, bet: id user, id match, bet
app.post('/bet', (req, res) => {
  bet.post(req, res);
});

// app.get('/(\\w+)', (req, res) => {
//   helpers.response(res, 400, {'Error' : 'Not Found'})
// });

match = (bets) => {
  const arr = []
  return new Promise((res, rej) => {
    bets.forEach(bet => {
      db.read('match_', 'id', bet.id_match)
        .then(data => {
          bet.match = data
          arr.push(bet)
          if (arr.length === bets.length) {
            res(arr)
          }
        })
        .catch(err => {
          rej(err)
        });
    });
  });
};

// app.get('/(\\w+)', (req, res) => {
//   helpers.response(res, 400, {'Error' : 'Not Found'})
// });

//Required data: token, email
app.get('/user', (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;

  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;

    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(dataUser => {
            const userObj = {
              'name': dataUser[0].name,
              'email': dataUser[0].email,
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
        helpers.response(res, 403, {
          'Error': 'Missing required token in header, or token is invalid'
        });
      }
    });
  } else {
    helpers.response(res, 403, {
      'Error': 'Missing required field(s)'
    });
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

// Admin routes
require('./lib/admin.routes')(app);

// Admin panel - get all users data
app.get('/admin/user', (req, res) => {
  admin.getAllUsers(req, res);
});

// Admin panel - get user with :userId
app.get('/admin/user/:userId', (req, res) => {
  const userId = req.params.userId;
  admin.getUser(req, res, userId);
});

// Admin panel - add user (post)
app.post('/admin/user', (req, res) => {
  admin.addUser(req, res);
});

// Admin panel - delete user (delete)
app.delete('/admin/user', (req, res) => {
  admin.deleteUser(req, res);
});

// Admin panel - get all matchs data
app.get('/admin/match', (req, res) => {
  admin.getAllMatchs(req, res);
});

// Admin panel - get all competitons data
app.get('/admin/competiton', (req, res) => {
  admin.getAllCompetition(req, res);
});

// Admin panel - get all bets data
app.get('/admin/bet', (req, res) => {
  admin.getAllBets(req, res);
});

// Admin panel - get all registers data
app.get('/admin/register', (req, res) => {
  admin.getAllRegisters(req, res);
});

app.listen(config.port, () => console.log(`BETTING application starting on port: ${config.port}!`));
