/*
 *
 *
 * User API
 *
 */

//Dependecies
const helpers = require('../helpers');
const db = require('../db');

//Container for bet methods
const user = {}

user.init = (req, res) => {
  const method = req.method.toLowerCase();
  const acceptableMethods = ['post', 'get'];
  if(acceptableMethods.indexOf(method) > -1) {
    user[method](req, res);
  } else {
    helpers.response(res, 405);
  }
}

//USER GET
//Required data: token, email
//Optional: iduser
user.get = (req, res) => {
  const idUser = typeof(parseInt(req.headers.iduser)) == 'number' && req.headers.iduser > 0 ? req.headers.iduser : false;
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
    const token = typeof(req.headers.token) =='string' && req.headers.token.length == 20 ? req.headers.token : false;
    if (email) {
      const token = typeof(req.headers.token) =='string' && req.headers.token.length == 20 ? req.headers.token : false;
      helpers.isAdminVerify(email, token, req, res).then(
        result => {
          if(result){
          db.read('user')
            .then(userList => {
              helpers.response(res, 200, userList);
            })
        } else {
            if (idUser) {
              db.read('user', 'id', idUser)
              .then(userData => {
                helpers.response(res, 200, userData);
              })
              .catch(err => console.log('err' + err))
            } else {
              db.read('user', 'email', email)
              .then(dataUser => {
                db.read('user', 'id', dataUser[0].id)
                .then(userData => {
                  helpers.response(res, 200, userData);
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
      helpers.response(res, 403, {'Error' : 'Missing required field(s)'});
    }
  };

module.exports = user;
