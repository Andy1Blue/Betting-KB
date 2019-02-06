/*
 *
 *
 * Bet API
 *
 */

//Dependecies
const helpers = require('../helpers');
const db = require('../db');

//Container for bet methods
const bet = {}

bet.init = (req, res) => {
  const method = req.method.toLowerCase();
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(method) > -1) {
    bet[method](req, res);
  } else {
    helpers.response(res, 405);
  }
};

//BET POST
//Required data: token, email, bet: id user, id match, bet
bet.post = (req, res) => {
  // console.log(req.method)
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

      helpers.verifyToken(token, email, (tokenIsValid) => {
        //TODO to check if idMatch is in db
        if (tokenIsValid) {
          db.read('user', 'email', email)
          .then(userData => {
            const userId = userData[0].id;
            const dataBet = {
              'id_user': userId,
              'id_match': idMatch,
              'bet': bet,
              'date': Date.now()
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
            })
            .catch(() => {
              db.create('bet', dataBet)
                .then(() => {
                  helpers.response(res, 200, {'Message' : 'New bet has been added'});
                })
                .catch((err) => {
                  helpers.response(res, 500, {'Error' : 'Could not add new bet'});
                });
            })
          });
        } else {
          helpers.response(res, 403, {'Error' : 'Missing required token in header, or token is invalid'});
        }
      });
    } else {
      helpers.response(res, 403, {'Error' : 'Missing required field(s)'});
    }
  });
};

//BET GET
//Required data: token, email, idBet
bet.get = (req, res) => {
  const idBet = typeof(parseInt(req.headers.idbet)) == 'number' && req.headers.idbet > 0 ? req.headers.idbet : false;
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof(req.headers.token) =='string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.isAdminVerify(email, token, req, res).then(
      result => {
        if(result == "admin"){
        db.read('bet')
          .then(betList => {
            helpers.response(res, 200, betList);
          })
      } else if(result == "user"){
          if (idBet) {
            db.read('bet', 'id', idBet)
            .then(betData => {
              helpers.response(res, 200, betData);
            })
            .catch(err => console.log('err' + err))
          } else {
            db.read('user', 'email', email)
            .then(dataUser => {
              db.read('bet', 'id_user', dataUser[0].id)
              .then(betData => {
                helpers.response(res, 200, betData);
              })
              .catch(err => console.log('err' + err))
            })
            .catch(() => {
              helpers.response(res, 404, [])
            })
        }
      }
    }
        );
    // helpers.verifyToken(token, email, (tokenIsValid) => {
    //   if (tokenIsValid) {
    //
    //   } else {
    //     helpers.response(res, 403, {'Error' : 'Missing required token in header, or token is invalid'});
    //   }
    // });
  } else {
    helpers.response(res, 403, {'Error' : 'Missing required field(s)'});
  }
};

//BET DELETE
//Required data: token, email, idBet
bet.delete = (req, res) => {
  const idBet = typeof(parseInt(req.headers.idbet)) == 'number' && req.headers.idbet > 0 ? req.headers.idbet : false;
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;

  if (email) {
    const token = typeof(req.headers.token) =='string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.delete('bet', 'id', idBet)
        .then(result => {
          helpers.response(res, 200);
        })
        .catch(err => {
          helpers.response(res, 500, err);
        })
      } else {
        helpers.response(res, 403, {'Error' : 'Missing required token in header, or token is invalid'});
      }
    })
  } else {
    helpers.response(res, 403, {'Error' : 'Missing required field(s)'});
  }

};
module.exports = bet
