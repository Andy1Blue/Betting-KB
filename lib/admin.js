/*
 * Admin
 *
 * TODO: 
 * verify user access
 * competitons (add/edit/delete etc)
 * add matches to competitons (edit/delete etc)
 * users list and adding access
 * get all data:
 * match
 * user
 * competitions
 * 
 * 
 */

//Dependencies
const db = require('./db');
const helpers = require('./helpers');

// Container for admin methods
const admin = {}

admin.start = (req, res) => {
  const method = req.method.toLowerCase();
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(method) > -1) {
    admin[method](req, res);
  } else {
    helpers.response(res, 405);
  }
}

// Admin GET all users data
// Required data: token, email and requires access == 1
admin.getAllUsers = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') {
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                db.read('user')
                  .then(usersList => {
                    helpers.response(res, 200, usersList);
                  })
                  .catch(err => console.log('err' + err))
              } else {
                helpers.response(res, 403, {
                  'Error': 'User does not access privileges'
                });
              }
            }
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
};

// Admin POST add user
// Required data: token, email and requires access == 1
admin.addUser = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') {
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {

                req.on('data', (data) => {
                  let payload = Buffer.from(data).toString();
                  const payloadObject = helpers.parseJsonToObject(payload);
                  const newUserName = typeof (payloadObject.name) == 'string' && payloadObject.name.trim().length > 0 ? payloadObject.name.trim() : false;
                  const newUserEmail = typeof (payloadObject.email) == 'string' && payloadObject.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(payloadObject.email.trim()) ? payloadObject.email.trim() : false;
                  const newUserPassword = typeof (payloadObject.password) == 'string' && payloadObject.password.trim().length > 5 ? payloadObject.password.trim() : false;
                  const newUserDate = Date.now();
                  const ipAdmin = req.connection.remoteAddress;
                  const newUserHashedPassword = helpers.hash(newUserPassword)

                  if (newUserName && newUserEmail && newUserHashedPassword) {

                    db.read('user', 'email', newUserEmail)
                        .then((existUser) => {
                          console.log("User is exist, id: " + existUser[0].id + " / "+ JSON.stringify(existUser));
              
                          helpers.response(res, 500, {
                            'Error': 'This email address is already exist'
                          });

                        }).catch(() => {
                          const dataNewUser = {
                            'name': newUserName,
                            'email': newUserEmail,
                            'password': newUserHashedPassword,
                            'access': 0, // TODO: can admin do access == 1?
                            'ip': "adding as admin ip: " + ipAdmin,
                            'date': newUserDate
                          }
      
                          db.create('user', dataNewUser)
                            .then(() => {
                              helpers.response(res, 200, {
                                'Message': 'New user has been added'
                              });
                            })
                            .catch((err) => {
                              helpers.response(res, 500, {
                                'Error': 'Could not add new user'
                              });
                            });
                        });

                  } else {
                    helpers.response(res, 403, {
                      'Error': 'Missing required field(s)'
                    });
                  }
                });

              } else {
                helpers.response(res, 403, {
                  'Error': 'User does not access privileges'
                });
              }
            }
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
};

// Admin GET all match data
// Required data: token, email and requires access == 1
admin.getAllMatchs = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') {
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                db.read('match_')
                  .then(matchsList => {
                    helpers.response(res, 200, matchsList);
                  })
                  .catch(err => console.log('err' + err))
              } else {
                helpers.response(res, 403, {
                  'Error': 'User does not access privileges'
                });
              }
            }
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
};

// Admin GET all competitons data
// Required data: token, email and requires access == 1
admin.getAllCompetition = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') {
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                db.read('competition')
                  .then(competitionsList => {
                    helpers.response(res, 200, competitionsList);
                  })
                  .catch(err => console.log('err' + err))
              } else {
                helpers.response(res, 403, {
                  'Error': 'User does not access privileges'
                });
              }
            }
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
};

// Admin GET all bets data
// Required data: token, email and requires access == 1
admin.getAllBets = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') {
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                db.read('bet')
                  .then(betList => {
                    helpers.response(res, 200, betList);
                  })
                  .catch(err => console.log('err' + err))
              } else {
                helpers.response(res, 403, {
                  'Error': 'User does not access privileges'
                });
              }
            }
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
};

// Admin GET all registers data
// Required data: token, email and requires access == 1
admin.getAllRegisters = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') {
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                db.read('register')
                  .then(registerList => {
                    helpers.response(res, 200, registerList);
                  })
                  .catch(err => console.log('err' + err))
              } else {
                helpers.response(res, 403, {
                  'Error': 'User does not access privileges'
                });
              }
            }
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
};

module.exports = admin;