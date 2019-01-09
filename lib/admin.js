/*
 * Admin
 *
 * TODO: 
 * verify user access
 * competitons (add/edit/delete etc)
 * add matches to competitons (edit/delete etc)
 * users list and adding access
 * get all data (match, user, competitions) - post, get, put, delete
 * 
 */

//Dependencies
const db = require('./db');
const helpers = require('./helpers');

//container for bet methods
const admin = {}

admin.start = (req, res) => {
  const method = req.method.toLowerCase();
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(method) > -1) {
    admin[method](req, res);
  } else {
    helpers.response(res, 405);
  }
}

// Admin GET all users
// Required data: token, email
admin.getAllUsers = (req, res) => {
 const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof(req.headers.token) =='string' && req.headers.token.length == 20 ? req.headers.token : false;

    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
          db.read('user')
          .then(usersList => {
            helpers.response(res, 200, usersList);
          })
          .catch(err => console.log('err' + err))
      } else {
        helpers.response(res, 403, {'Error' : 'Missing required token in header, or token is invalid'});
      }
    });
  } else {
    helpers.response(res, 403, {'Error' : 'Missing required field(s)'});
  }
};

// module.exports = function(app){
//Required data: token, email, // userAccess (1 - admin, 0 - user)
// app.get('/admin', (req, res) => {
    //Get the token from the headers
//     const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
//     const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  
//     db.read('user', 'email', email)
//       .then(userData => {
//         if (typeof (userData) === 'object') {
//           console.log("sprawdź!!! " + userData);
//           let userAccess = userData[0].access;
//           if (token && userAccess === 1) {
//             helpers.verifyToken(token, email, (tokenIsValid) => {
//               if (tokenIsValid) {
//                 res.writeHead(200, {
//                   'Content-Type': 'application/json'
//                 });
//                 res.write(JSON.stringify({
//                   'OK': 'Yes!'
//                 }));
//                 res.end();
//               }
//             });
//           } else {
//             helpers.response(res, 403, {
//               'Error': 'Token is missing or access is not admin'
//             });
//           }
//         } else {
//           helpers.response(res, 403, {
//             'Error': 'Check e-mail address'
//           });
//         }
//       });
//   });
// }

module.exports = admin;