/*
 * Admin
 *
 * TODO: 
 * verify user access
 * competitons (add/edit/delete etc)
 * add matches to competitons (edit/delete etc)
 * users list and adding access
 * get all data (match, competitions) - post, get, put, delete - helpers
 * 
 */

//Dependencies
const db = require('./db');
const helpers = require('./helpers');

module.exports = function(app){
//Required data: token, email, // userAccess (1 - admin, 0 - user)
app.get('/admin', (req, res) => {
    //Get the token from the headers
    const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;
    const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  
    db.read('user', 'email', email)
      .then(userData => {
        if (typeof (userData) === 'object') {
          console.log("sprawdź!!! " + userData);
          let userAccess = userData[0].access;
          if (token && userAccess === 1) {
            helpers.verifyToken(token, email, (tokenIsValid) => {
              if (tokenIsValid) {
                res.writeHead(200, {
                  'Content-Type': 'application/json'
                });
                res.write(JSON.stringify({
                  'OK': 'Yes!'
                }));
                res.end();
              }
            });
          } else {
            helpers.response(res, 403, {
              'Error': 'Token is missing or access is not admin'
            });
          }
        } else {
          helpers.response(res, 403, {
            'Error': 'Check e-mail address'
          });
        }
      });
  });
}