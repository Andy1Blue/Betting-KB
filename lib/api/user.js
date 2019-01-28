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
// user.get = (req, res) => {
//   const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;

//   if (email) {
//     const token = typeof(req.headers.token) =='string' && req.headers.token.length == 20 ? req.headers.token : false;

//     helpers.verifyToken(token, email, (tokenIsValid) => {
//       if (tokenIsValid) {
//         db.read('user', 'email', email)
//         .then(dataUser => {
//           const userObj = {
//             'name' : dataUser[0].name,
//             'email' : dataUser[0].email,
//             'accessLevel' : dataUser[0].access
//           }
//           db.read('bet', 'id_user', dataUser[0].id)
//           .then(betsData => {
//             helpers.allRecords(betsData, 'match_', 'id', 'id_match')
//             .then(data => {
//               userObj.bets = data
//               helpers.response(res, 200, userObj)
//             })
//             .catch(err => console.log('err ' + err))
//           })
//           .catch(() => {
//             userObj.bets = []
//             helpers.response(res, 200, userObj)
//           })
//         })
//         .catch(() => {
//           helpers.response(res, 404)
//         });
//       } else {
//         helpers.response(res, 403, {'Error': 'Missing required token in header, or token is invalid'});
//       }
//     });
//   } else {
//     helpers.response(res, 403, {'Error': 'Missing required field(s)'});
//   }
// };
user.get = (req, res) => {
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
            'accessLevel' : dataUser[0].access
          }
          helpers.response(res, 200, userObj)
        })
        .catch(() => {
          helpers.response(res, 404)
        });
      } else {
        helpers.response(res, 403, {'Error': 'Missing required token in header, or token is invalid'});
      }
    });
  } else {
    helpers.response(res, 403, {'Error': 'Missing required field(s)'});
  }
};

module.exports = user;
