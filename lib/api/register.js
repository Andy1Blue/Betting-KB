/*
 *
 *
 * Register API
 *
 */

//Dependecies
const helpers = require('../helpers');
const db = require('../db');

//Container for bet methods
const register = {}

register.init = (req, res) => {
  const method = req.method.toLowerCase();
  const acceptableMethods = ['post', 'get'];
  if(acceptableMethods.indexOf(method) > -1) {
    register[method](req, res);
  } else {
    helpers.response(res, 405);
  }
}

//REGISTER POST
//Required data: name, email, password
register.post = (req, res) => {
  req.on('data', (data) => {
    let payload = Buffer.from(data).toString();
    const payloadObject = helpers.parseJsonToObject(payload);
    const name = typeof(payloadObject.name) == 'string' && payloadObject.name.trim().length > 0 ? payloadObject.name.trim() : false;
    const email = typeof(payloadObject.email) == 'string' && payloadObject.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(payloadObject.email.trim()) ? payloadObject.email.trim() : false;
    const password = typeof(payloadObject.password) == 'string' && payloadObject.password.trim().length > 5 ? payloadObject.password.trim() : false;

    if(name && email && password) {

      db.read('user', 'email', email)
        .then(() => {
          helpers.response(res, 403, {
            'Error': 'This email address is already exist'
          });
        })
        .catch(() => {
          const hashedPassword = helpers.hash(password);
          const userKey = helpers.createRandomString(30);
          const date = Date.now();
          const user = {
            name,
            email,
            password: hashedPassword,
            ip: req.connection.remoteAddress,
            userKey,
            date
          }
          db.read('register', 'ip', user.ip)
            .then(data => {
              if(Array.isArray(data) && Date.now() - data[0].date < 10000) {
                helpers.response(res, 403, {
                  'Message': 'You must wait a moment'
                });

              } else {
                if(Array.isArray(data) && data[0]) {
                  db.delete('register', 'id', data[0].id).catch(data => console.log(data));
                  db.create('register', user)
                    .then(data => {
                      helpers.sendEmail(email, userKey);
                      helpers.response(res, 200, {
                        'InsertId': data.insertId
                      });
                    })
                    .catch(data => {
                      helpers.response(res, 403, {
                        'Error': data
                      });
                    });
                }

              }
            })
            .catch(() => {
              db.create('register', user)
                .then(data => {
                  helpers.sendEmail(email, userKey);
                  helpers.response(res, 200, {
                    'InsertId': data.insertId
                  });
                })
                .catch(data => {
                  helpers.response(res, 403, {
                    'Error': data
                  });
                });
            });
        });

    } else {
      helpers.response(res, 403, {
        'Error': 'Missing required field(s)'
      });
    }
  });
};

//Adding user to db
register.get = (req, res) => {
  const key = req.params.key;
  if(key != 0 && key.length === 30) {
    db.read('register', 'userKey', key)
      .then(data => {
        const userObj = data[0];
        const registerId = userObj.id;
        delete userObj.userKey;
        delete userObj.id;
        userObj.access = 0;
        db.create('user', userObj)
          .then(() => {
            db.delete('register', 'id', registerId).catch(data => console.log(data));
            helpers.response(res, 200, {
              'Info': `New user has been added`
            });
          })
          .catch(err => {
            helpers.response(res, 403, {
              'Error': err
            });
          });
      })
      .catch(() => {
        helpers.response(res, 403, {
          'Error': 'User key is not valid'
        });
      });
  } else {
    helpers.response(res, 403, {
      'Error': 'User key is not valid'
    });
  }
};

module.exports = register;
