/*
 * Admin controller
 *
 *
 *
 */

//Dependencies
const db = require('../db');
const helpers = require('../helpers');

// Container for admin methods
const admin = {}

// admin.start = (req, res) => {
//   const method = req.method.toLowerCase();
//   const acceptableMethods = ['post', 'get', 'put', 'delete'];
//   if (acceptableMethods.indexOf(method) > -1) {
//     admin[method](req, res);
//   } else {
//     helpers.response(res, 405);
//   }
// }

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

// Admin GET user data
// Required data: token, email and requires access == 1
// GET data: userId
admin.getUser = (req, res, userId) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof(userData) === 'object') {
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                db.read('user', 'id', userId)
                  .then(user => {
                    helpers.response(res, 200, user);
                  })
                  .catch(() => {
                  helpers.response(res, 403, {
                    'Error': 'User is not exist'
                  });
                }
                );
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
// Post data: name, email, password
admin.addUser = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
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

// Admin DELETE user
// Required data: token, email and requires access == 1
// Delete data: userId, userEmail
admin.deleteUser = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                req.on('data', (data) => {
                  let payload = Buffer.from(data).toString();
                  const payloadObject = helpers.parseJsonToObject(payload);
                  const userEmail = typeof (payloadObject.userEmail) == 'string' && payloadObject.userEmail.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(payloadObject.userEmail.trim()) ? payloadObject.userEmail.trim() : false;
                  const userId = typeof (payloadObject.userId) == 'number' && payloadObject.userId > 0 ? payloadObject.userId : false;
                  // console.log(userEmail + " " + typeof(userEmail) + " / " + userId + " " + typeof(userId));
                  if (userEmail && userId) {
                    db.read('user', 'email', userEmail)
                        .then((existUser) => {
                          if(existUser[0].id === userId && existUser[0].email == userEmail){
                          console.log("User is exist, id: " + existUser[0].id + " ("+userId+") / "+ JSON.stringify(existUser));

                          db.delete('user', 'id', userId)
                          .then(() => {
                              helpers.response(res, 200, {
                                'Message': 'User has been deleted'
                              });
                          }).catch(() => {
                                helpers.response(res, 500, {
                                  'Error': 'Can\'t delete'
                                });
                          });
                        } else {
                          helpers.response(res, 403, {
                            'Error': 'Wrong user id'
                          });
                        }
                        }).catch(() => {
                              helpers.response(res, 500, {
                                'Error': 'User is not exist, can\'t delete'
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

// Admin PUT edit user
// Required data: token, email and requires access == 1
// PUT data: idOfEditingUser, newName, newEmail, newPassword, newDescription, newAccess
admin.editUser = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                req.on('data', (data) => {
                let payload = Buffer.from(data).toString();
                const payloadObject = helpers.parseJsonToObject(payload);
                const idOfEditingUser = typeof (payloadObject.idOfEditingUser) == 'number' && payloadObject.idOfEditingUser >= 0 ? payloadObject.idOfEditingUser : false;
                let newName = typeof (payloadObject.newName) == 'string' && payloadObject.newName.trim().length > 0 ? payloadObject.newName.trim() : false;
                let newEmail = typeof (payloadObject.newEmail) == 'string' && payloadObject.newEmail.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(payloadObject.newEmail.trim()) ? payloadObject.newEmail.trim() : false;
                let newPassword = typeof(payloadObject.newPassword) == 'string' && payloadObject.newPassword.trim().length > 5 ? payloadObject.newPassword.trim() : false;
                let newDescription = typeof (payloadObject.newDescription) == 'string' && payloadObject.newDescription.trim().length > 0 ? payloadObject.newDescription.trim() : false;
                let newAccess = typeof (payloadObject.newAccess) == 'number' && payloadObject.newAccess >= 0 ? payloadObject.newAccess : false;

                   if (idOfEditingUser && (newName || newEmail || newPassword || newDescription || newAccess)) {
                    db.read('user', 'id', idOfEditingUser) // TODO: verify?
                        .then((existUser) => {
                          console.log("User is exist, email: " + existUser[0]["email"] + " / "+ JSON.stringify(existUser));

                              let hashedPassword = helpers.hash(newPassword);
                              let newDate = Date.now();

                              newName = !newName ? existUser[0]["name"] : newName;
                              newEmail = !newEmail ? existUser[0]["email"] : newEmail;
                              newPassword = !newPassword ? existUser[0]["password"] : hashedPassword;
                              newDescription = !newDescription ? existUser[0]["description"] : newDescription;
                              newAccess = !newAccess ? existUser[0]["access"] : newAccess;

                                var newData = {
                                    'name': newName,
                                    'email': newEmail,
                                    'password': newPassword,
                                    'description': newDescription,
                                    'access': newAccess,
                                    'ip': req.connection.remoteAddress,
                                    'date': newDate
                                 };

                                db.update('user', idOfEditingUser, newData)
                                .then(() => {
                                      helpers.response(res, 200, {
                                                'Message': 'User has been updated'
                                                });
                                              }).catch(() => {
                                          helpers.response(res, 500, {
                                              'Error': 'Can\'t update'
                                          });
                                    });

                        }).catch(() => {
                          helpers.response(res, 500, {
                            'Error': 'This user is not exist, can\'t update'
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

// Admin GET match data
// Required data: token, email and requires access == 1
admin.getMatch = (req, res, matchId) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof(userData) === 'object') {
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                db.read('match_', 'id', matchId)
                  .then(match => {
                    helpers.response(res, 200, match);
                  })
                  .catch(() => {
                  helpers.response(res, 403, {
                    'Error': 'Match is not exist'
                  });
                }
                );
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

// Admin POST match data
// Required data: token, email and requires access == 1
// POST data: name, team_a, team_b, start, end, id_comp, result
admin.addMatch = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {

                req.on('data', (data) => {
                  let payload = Buffer.from(data).toString();
                  const payloadObject = helpers.parseJsonToObject(payload);
                  const newMatchName = typeof (payloadObject.newMatchName) == 'string' && payloadObject.newMatchName.trim().length > 0 ? payloadObject.newMatchName.trim() : false;
                  const newMatchTeamA = typeof (payloadObject.newMatchTeamA) == 'string' && payloadObject.newMatchTeamA.trim().length > 0 ? payloadObject.newMatchTeamA.trim() : false;
                  const newMatchTeamB = typeof (payloadObject.newMatchTeamB) == 'string' && payloadObject.newMatchTeamB.trim().length > 0 ? payloadObject.newMatchTeamB.trim() : false;
                  const newMatchStart = typeof (payloadObject.newMatchStart) == 'number' && payloadObject.newMatchStart >= 0 ? payloadObject.newMatchStart : false;
                  const newMatchEnd = typeof (payloadObject.newMatchEnd) == 'number' && payloadObject.newMatchEnd >= 0 ? payloadObject.newMatchEnd : false;
                  const newMatchIdComp = typeof (payloadObject.newMatchIdComp) == 'number' && payloadObject.newMatchIdComp >= 0 ? payloadObject.newMatchIdComp : false;
                  const newMatchResult = typeof (payloadObject.newMatchResult) == 'string' && payloadObject.newMatchResult.trim().length > 0 ? payloadObject.newMatchResult.trim() : false;
                  // TODO: const newUserDate = Date.now();
                  // TODO: const ipAdmin = req.connection.remoteAddress;
                  // TODO: const whoAdd = ...;

                  if (newMatchName) {
                    db.read('match_', 'name', newMatchName) // TODO: verify?
                        .then((existMatch) => {
                          console.log("Match is exist, name: " + existMatch[0].name + " / "+ JSON.stringify(existMatch));

                          helpers.response(res, 500, {
                            'Error': 'This match is already exist'
                          });

                        }).catch(() => {
                          const dataNewMatch = {
                            'name': newMatchName,
                            'team_a': newMatchTeamA,
                            'team_b': newMatchTeamB,
                            'start': newMatchStart,
                            'end': newMatchEnd,
                            'id_comp': newMatchIdComp,
                            'result': newMatchResult
                          }

                          db.create('match_', dataNewMatch)
                            .then(() => {
                              helpers.response(res, 200, {
                                'Message': 'New match has been added'
                              });
                            })
                            .catch((err) => {
                              helpers.response(res, 500, {
                                'Error': 'Could not add new match'
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

// Admin DELETE match data
// Required data: token, email and requires access == 1
// DELETE data: id
admin.deleteMatch = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                req.on('data', (data) => {
                  let payload = Buffer.from(data).toString();
                  const payloadObject = helpers.parseJsonToObject(payload);
                  const matchId = typeof (payloadObject.matchId) == 'number' && payloadObject.matchId > 0 ? payloadObject.matchId : false;
                  // console.log(userEmail + " " + typeof(userEmail) + " / " + userId + " " + typeof(userId));
                  if (matchId) {
                    db.read('match_', 'id', matchId)
                        .then((existMatch) => {
                          if(existMatch[0].id === matchId){
                          console.log("Match is exist, id: " + existMatch[0].id + " ("+matchId+") / "+ JSON.stringify(existMatch));

                          db.delete('match_', 'id', matchId)
                          .then(() => {
                              helpers.response(res, 200, {
                                'Message': 'Match has been deleted'
                              });
                          }).catch(() => {
                                helpers.response(res, 500, {
                                  'Error': 'Can\'t delete'
                                });
                          });
                        } else {
                          helpers.response(res, 403, {
                            'Error': 'Wrong match id'
                          });
                        }
                        }).catch(() => {
                              helpers.response(res, 500, {
                                'Error': 'Match is not exist, can\'t delete'
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

// Admin PUT match data
// Required data: token, email and requires access == 1
// PUT data: idOfEditingMatch, newName,	newTeamA,	newTeamB,	newStart, newEnd,	newIdComp, newResult
admin.editMatch = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {

                req.on('data', (data) => {
                let payload = Buffer.from(data).toString();
                const payloadObject = helpers.parseJsonToObject(payload);
                const idOfEditingMatch = typeof (payloadObject.idOfEditingMatch) == 'number' && payloadObject.idOfEditingMatch >= 0 ? payloadObject.idOfEditingMatch : false;
                let newName = typeof (payloadObject.newName) == 'string' && payloadObject.newName.trim().length > 0 ? payloadObject.newName.trim() : false;
                let newTeamA = typeof (payloadObject.newTeamA) == 'string' && payloadObject.newTeamA.trim().length > 0 ? payloadObject.newTeamA.trim() : false;
                let newTeamB = typeof (payloadObject.newTeamB) == 'string' && payloadObject.newTeamB.trim().length > 0 ? payloadObject.newTeamB.trim() : false;
                let newStart = typeof (payloadObject.newStart) == 'number' && payloadObject.newStart >= 0 ? payloadObject.newStart : false;
                let newEnd = typeof (payloadObject.newEnd) == 'number' && payloadObject.newEnd >= 0 ? payloadObject.newEnd : false;
                let newIdComp = typeof (payloadObject.newIdComp) == 'number' && payloadObject.newIdComp >= 0 ? payloadObject.newIdComp : false;
                let newResult = typeof (payloadObject.newResult) == 'string' && payloadObject.newResult.trim().length > 0 ? payloadObject.newResult.trim() : false;

                   if (idOfEditingMatch && (newName || newTeamA || newTeamB || newStart || newEnd || newIdComp || newResult)) {
                    db.read('match_', 'id', idOfEditingMatch) // TODO: verify?
                        .then((existMatch) => {
                          console.log("Match is exist, name: " + existMatch[0]["name"] + " / "+ JSON.stringify(existMatch));

                              newName = !newName ? existMatch[0]["name"] : newName;
                              newTeamA = !newTeamA ? existMatch[0]["team_a"] : newTeamA;
                              newTeamB = !newTeamB ? existMatch[0]["team_b"] : newTeamB;
                              newStart = !newStart ? existMatch[0]["start"] : newStart;
                              newEnd = !newEnd ? existMatch[0]["end"] : newEnd;
                              newIdComp = !newIdComp ? existMatch[0]["id_comp"] : newIdComp;
                              newResult = !newResult ? existMatch[0]["result"] : newResult;

                                var newData = {
                                   'name': newName,
                                   'team_a': newTeamA,
                                   'team_b':newTeamB,
                                   'start': newStart,
                                   'end': newEnd,
                                   'id_comp': newIdComp,
                                   'result': newResult
                                 };

                                db.update('match_', idOfEditingMatch, newData)
                                .then(() => {
                                      helpers.response(res, 200, {
                                                'Message': 'Match has been updated'
                                                });
                                              }).catch(() => {
                                          helpers.response(res, 500, {
                                              'Error': 'Can\'t update'
                                          });
                                    });

                        }).catch(() => {
                          helpers.response(res, 500, {
                            'Error': 'This match is not exist, can\'t update'
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

// Admin GET competiton data
// Required data: token, email and requires access == 1
admin.getCompetition = (req, res, competitionId) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof(userData) === 'object') {
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                db.read('competition', 'id', competitionId)
                  .then(competiton => {
                    helpers.response(res, 200, competiton);
                  })
                  .catch(() => {
                  helpers.response(res, 403, {
                    'Error': 'Competiton is not exist'
                  });
                }
                );
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

// Admin POST competiton data
// Required data: token, email and requires access == 1
// POST data: newCompetitonName, newCompetitionImg
admin.addCompetition = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {

                req.on('data', (data) => {
                  let payload = Buffer.from(data).toString();
                  const payloadObject = helpers.parseJsonToObject(payload);
                  const newCompetitonName = typeof (payloadObject.newCompetitonName) == 'string' && payloadObject.newCompetitonName.trim().length > 0 ? payloadObject.newCompetitonName.trim() : false;
                  const newCompetitionImg = typeof (payloadObject.newCompetitionImg) == 'string' && payloadObject.newCompetitionImg.trim().length > 0 ? payloadObject.newCompetitionImg.trim() : false;

                  if (newCompetitonName && newCompetitionImg) {
                    db.read('competition', 'name', newCompetitonName) // TODO: verify?
                        .then((existMatch) => {
                          console.log("Competition is exist, name: " + existMatch[0].name + " / "+ JSON.stringify(existMatch));

                          helpers.response(res, 500, {
                            'Error': 'This competition is already exist'
                          });

                        }).catch(() => {
                          const dataNewCompetition = {
                            'name': newCompetitonName,
                            'img': newCompetitionImg
                          }

                          db.create('competition', dataNewCompetition)
                            .then(() => {
                              helpers.response(res, 200, {
                                'Message': 'New competition has been added'
                              });
                            })
                            .catch((err) => {
                              helpers.response(res, 500, {
                                'Error': 'Could not add new competition'
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

// Admin DELETE competiton data
// Required data: token, email and requires access == 1
// DELETE data: competitionId
admin.deleteCompetition = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                req.on('data', (data) => {
                  let payload = Buffer.from(data).toString();
                  const payloadObject = helpers.parseJsonToObject(payload);
                  const competitionId = typeof (payloadObject.competitionId) == 'number' && payloadObject.competitionId > 0 ? payloadObject.competitionId : false;
                  if (competitionId) {
                    db.read('competition', 'id', competitionId)
                        .then((existCompetition) => {
                          if(existCompetition[0].id === competitionId){
                          console.log("Competition is exist, id: " + existCompetition[0].id + " ("+competitionId+") / "+ JSON.stringify(existCompetition));

                          db.delete('competition', 'id', competitionId)
                          .then(() => {
                              helpers.response(res, 200, {
                                'Message': 'Competition has been deleted'
                              });
                          }).catch(() => {
                                helpers.response(res, 500, {
                                  'Error': 'Can\'t delete'
                                });
                          });
                        } else {
                          helpers.response(res, 403, {
                            'Error': 'Wrong competition id'
                          });
                        }
                        }).catch(() => {
                              helpers.response(res, 500, {
                                'Error': 'Competition is not exist, can\'t delete'
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

// Admin PUT competiton data
// Required data: token, email and requires access == 1
// PUT data: idOfEditingCompetition, newName, newImg
admin.editCompetiton = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                req.on('data', (data) => {
                let payload = Buffer.from(data).toString();
                const payloadObject = helpers.parseJsonToObject(payload);
                const idOfEditingCompetition = typeof (payloadObject.idOfEditingCompetition) == 'number' && payloadObject.idOfEditingCompetition >= 0 ? payloadObject.idOfEditingCompetition : false;
                let newName = typeof (payloadObject.newName) == 'string' && payloadObject.newName.trim().length > 0 ? payloadObject.newName.trim() : false;
                let newImg = typeof (payloadObject.newImg) == 'string' && payloadObject.newImg.trim().length > 0 ? payloadObject.newImg.trim() : false;

                   if (idOfEditingCompetition && (newName || newImg)) {
                    db.read('competition', 'id', idOfEditingCompetition) // TODO: verify?
                        .then((existCompetition) => {
                          console.log("Competition is exist, name: " + existCompetition[0]["name"] + " / "+ JSON.stringify(existCompetition));

                              newName = !newName ? existCompetition[0]["name"] : newName;
                              newImg = !newImg ? existCompetition[0]["img"] : newImg;

                                var newData = {
                                   'name': newName,
                                   'img': newImg
                                 };

                                db.update('competition', idOfEditingCompetition, newData)
                                .then(() => {
                                      helpers.response(res, 200, {
                                                'Message': 'Competition has been updated'
                                                });
                                              }).catch(() => {
                                          helpers.response(res, 500, {
                                              'Error': 'Can\'t update'
                                          });
                                    });

                        }).catch(() => {
                          helpers.response(res, 500, {
                            'Error': 'This competition is not exist, can\'t update'
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

// Admin GET bet data
// Required data: token, email and requires access == 1
admin.getBet = (req, res, betId) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof(userData) === 'object') {
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                db.read('bet', 'id', betId)
                  .then(bet => {
                    helpers.response(res, 200, bet);
                  })
                  .catch(() => {
                  helpers.response(res, 403, {
                    'Error': 'Bet is not exist'
                  });
                }
                );
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

// Admin POST bet data
// Required data: token, email and requires access == 1
// POST data: newIdUser, newIdMatch, newBet, newDate
admin.addBet = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                req.on('data', (data) => {
                  let payload = Buffer.from(data).toString();
                  const payloadObject = helpers.parseJsonToObject(payload);
                  const newIdUser = typeof (payloadObject.newIdUser) == 'number' && payloadObject.newIdUser > 0 ? payloadObject.newIdUser : false;
                  const newIdMatch = typeof (payloadObject.newIdMatch) == 'number' && payloadObject.newIdMatch > 0 ? payloadObject.newIdMatch : false;
                  const newBet = typeof (payloadObject.newBet) == 'number' && payloadObject.newBet > 0 ? payloadObject.newBet : false;
                  const newDate = typeof (payloadObject.newDate) == 'number' && payloadObject.newDate > 0 ? payloadObject.newDate : false;

                  if (newIdUser && newIdMatch && newBet && newDate) {
                  // Verification with id_user and id_match
                  db.read('bet', 'id_user', newIdUser)
                      .then((existBet) => {
                        console.log(existBet.length);
                        var isNoOk = true;

                        // TODO: Must correct it! Maybe promise?
                        setTimeout(function(){
                          for(var i = 0; i < existBet.length; i++){
                            if(existBet[i]["id_user"] === newIdUser && existBet[i]["id_match"] === newIdMatch){
                              console.log("Bet is exist / "+ JSON.stringify(existBet) + " /// " + existBet[0]["id_user"] + "=" +newIdUser +" && " + existBet[0]["id_match"] +"="+newIdMatch);
                              helpers.response(res, 500, {
                                'Error': 'This bet is already exist'
                              });
                            } else {
                              console.log("Bet / "+ JSON.stringify(existBet) + " /// " + existBet[0]["id_user"] + "=" +newIdUser +" && " + existBet[0]["id_match"] +"="+newIdMatch);
                              const dataNewBet = {
                                'id_user': newIdUser,
                                'id_match': newIdMatch,
                                'bet': newBet,
                                'date': newDate
                              }
                              db.create('bet', dataNewBet)
                                .then(() => {
                                  helpers.response(res, 200, {
                                    'Message': 'New bet has been added'
                                  });
                                })
                                .catch((err) => {
                                  helpers.response(res, 500, {
                                    'Error': 'Could not add new bet'
                                  });
                                });
                            }
                        }
                      },500);
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

// Admin DELETE bet data
// Required data: token, email and requires access == 1
// DELETE data: betId
admin.deleteBet = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                req.on('data', (data) => {
                  let payload = Buffer.from(data).toString();
                  const payloadObject = helpers.parseJsonToObject(payload);
                  const betId = typeof(payloadObject.betId) == 'number' && payloadObject.betId > 0 ? payloadObject.betId : false;
                  if(betId) {
                    db.read('bet', 'id', betId)
                        .then((existBet) => {
                          if(existBet[0].id === betId){
                          console.log("Bet is exist, id: " + existBet[0].id + " ("+betId+") / "+ JSON.stringify(existBet));
                          db.delete('bet', 'id', betId)
                          .then(() => {
                              helpers.response(res, 200, {
                                'Message': 'Bet has been deleted'
                              });
                          }).catch(() => {
                                helpers.response(res, 500, {
                                  'Error': 'Can\'t delete'
                                });
                          });
                        } else {
                          helpers.response(res, 403, {
                            'Error': 'Wrong bet id'
                          });
                        }
                        }).catch(() => {
                              helpers.response(res, 500, {
                                'Error': 'Bet is not exist, can\'t delete'
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

// Admin PUT bet data
// Required data: token, email and requires access == 1
// PUT data: idOfEditingBet, newIdUser, newIdMatch, newBet, newDate
admin.editBet = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                req.on('data', (data) => {
                let payload = Buffer.from(data).toString();
                const payloadObject = helpers.parseJsonToObject(payload);
                const idOfEditingBet = typeof (payloadObject.idOfEditingBet) == 'number' && payloadObject.idOfEditingBet >= 0 ? payloadObject.idOfEditingBet : false;
                let newIdUser = typeof (payloadObject.newIdUser) == 'number' && payloadObject.newIdUser >= 0 ? payloadObject.newIdUser : false;
                let newIdMatch = typeof (payloadObject.newIdMatch) == 'number' && payloadObject.newIdMatch >= 0 ? payloadObject.newIdMatch : false;
                let newBet = typeof (payloadObject.newBet) == 'number' && payloadObject.newBet >= 0 ? payloadObject.newBet : false;


                   if (idOfEditingBet && (newIdUser || newIdMatch || newBet)) {
                    db.read('bet', 'id', idOfEditingBet) // TODO: verify?
                        .then((existBet) => {
                          console.log("Bet is exist, id: " + existBet[0]["id"] + " / "+ JSON.stringify(existBet));

                              let newDate = Date.now();
                              newIdUser = !newIdUser ? existBet[0]["id_user"] : newIdUser;
                              newIdMatch = !newIdMatch ? existBet[0]["id_match"] : newIdMatch;
                              newBet = !newBet ? existBet[0]["bet"] : newBet;

                                var newData = {
                                   'id_user': newIdUser,
                                   'id_match': newIdMatch,
                                   'bet': newBet,
                                   'date': newDate
                                 };

                                db.update('bet', idOfEditingBet, newData)
                                .then(() => {
                                      helpers.response(res, 200, {
                                                'Message': 'Bet has been updated'
                                                });
                                              }).catch(() => {
                                          helpers.response(res, 500, {
                                              'Error': 'Can\'t update'
                                          });
                                    });

                        }).catch(() => {
                          helpers.response(res, 500, {
                            'Error': 'This bet is not exist, can\'t update'
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

// Admin GET register data
// Required data: token, email and requires access == 1
admin.getRegister = (req, res, registerId) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof(userData) === 'object') {
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                db.read('register', 'id', registerId)
                  .then(register => {
                    helpers.response(res, 200, register);
                  })
                  .catch(() => {
                  helpers.response(res, 403, {
                    'Error': 'Register is not exist'
                  });
                }
                );
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

// Admin POST register data
// Required data: token, email and requires access == 1
// POST data: name, email, password
admin.addRegister = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                req.on('data', (data) => {
                  let payload = Buffer.from(data).toString();
                  const payloadObject = helpers.parseJsonToObject(payload);
                  const name = typeof(payloadObject.name) == 'string' && payloadObject.name.trim().length > 0 ? payloadObject.name.trim() : false;
                  const email = typeof(payloadObject.email) == 'string' && payloadObject.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(payloadObject.email.trim()) ? payloadObject.email.trim() : false;
                  const password = typeof(payloadObject.password) == 'string' && payloadObject.password.trim().length > 5 ? payloadObject.password.trim() : false;

                  if (name && email && password) {
                        db.read('user', 'email', email)
                          .then((existRegister) => {
                            helpers.response(res, 403, {'Error' : 'This email address is already exist'});
                          })
                          .catch(() => {
                            const hashedPassword = helpers.hash(password);
                            const userKey =  helpers.createRandomString(30);
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

// Admin DELETE register data
// Required data: token, email and requires access == 1
// DELETE data: registerId
admin.deleteRegister = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') { // TODO: is not empty
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                req.on('data', (data) => {
                  let payload = Buffer.from(data).toString();
                  const payloadObject = helpers.parseJsonToObject(payload);
                  const registerId = typeof(payloadObject.registerId) == 'number' && payloadObject.registerId > 0 ? payloadObject.registerId : false;
                  if(registerId) {
                    db.read('register', 'id', registerId)
                        .then((existRegister) => {
                          if(existRegister[0].id === registerId){
                          console.log("Register is exist, id: " + existRegister[0].id + " ("+registerId+") / "+ JSON.stringify(existRegister));
                          db.delete('register', 'id', registerId)
                          .then(() => {
                              helpers.response(res, 200, {
                                'Message': 'Register has been deleted'
                              });
                          }).catch(() => {
                                helpers.response(res, 500, {
                                  'Error': 'Can\'t delete'
                                });
                          });
                        } else {
                          helpers.response(res, 403, {
                            'Error': 'Wrong register id'
                          });
                        }
                        }).catch(() => {
                              helpers.response(res, 500, {
                                'Error': 'Register is not exist, can\'t delete'
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

// Admin PUT register data
// Required data: token, email and requires access == 1
// PUT data: ...
admin.editRegister = (req, res) => {
};

module.exports = admin;
