/*
 *
 *
 * Match API
 *
 */

//Dependecies
const helpers = require('../helpers');
const db = require('../db');

//Container for bet methods
const match = {}

match.init = (req, res) => {
  const method = req.method.toLowerCase();
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(method) > -1) {
    match[method](req, res);
  } else {
    helpers.response(res, 405);
  }
};

//MATCH GET
//Required data: token, email
//Optional: idmatch
match.get = (req, res) => {
  const idMatch = typeof(parseInt(req.headers.idmatch)) == 'number' && req.headers.idmatch > 0 ? req.headers.idmatch : false;
  const email = typeof(req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if(email) {
    const token = typeof(req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.isAdminVerify(email, token, req, res).then(
      result => {
        if(result) {
          db.read('match_')
            .then(matchList => {
              helpers.response(res, 200, matchList);
            })
        } else {
          if(idMatch) {
            db.read('match_', 'id', idMatch)
              .then(matchData => {
                helpers.response(res, 200, matchData);
              })
              .catch(err => console.log('err' + err))
          } else {
            db.read('user', 'email', email)
              .then(dataUser => {
                db.read('bet', 'id_user', dataUser[0].id)
                  .then(matchData => {
                    helpers.response(res, 200, matchData);
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
  } else {
    helpers.response(res, 403, {
      'Error': 'Missing required field(s)'
    });
  }
};

module.exports = match;
