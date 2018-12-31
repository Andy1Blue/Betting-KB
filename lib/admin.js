// /*
//  * Admin
//  *
//  * TODO: 
//  * verify user access
//  * competitons (add/edit/delete etc)
//  * add matches to competitons (edit/delete etc)
//  * users list and adding access
//  * 
//  */

// //Dependencies
// const db = require('./db');
// const helpers = require('./helpers');
// const _data = require('./dataFs');
// const config = require('../config');
// const cors = require('cors');
// const app = express();
// const express = require('express');

// app.use(cors());

// //Required data: token, email?, // userAccess (1 - admin, 0 - user)
// app.get('/admin', (req, res) => {
//     //Get the token from the headers
//     const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
//     var userAccess;
//     db.read('user', 'email', token.email)
//         .then(userData => {
//             userAccess = userData[0].access;
//         });
//     if (token && userAccess === 1) {
//         helpers.verifyToken(token, email, (tokenIsValid) => {

//             if (tokenIsValid) {
//                 res.writeHead(200, {
//                     'Content-Type': 'application/json'
//                   });
//                   res.write(JSON.stringify({
//                     'OK': 'Yes!'
//                   }));
//                   res.end();
//             }
//         });
//     } else {
//         helpers.response(res, 403, {
//             'Error': 'Token is missing or access is not admin'
//         });
//     }
// });

// // Exprot the module
// module.exports = app;