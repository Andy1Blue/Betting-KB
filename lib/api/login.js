/*
 *
 *
 * Login API
 *
 */

//Dependecies
const helpers = require('../helpers');
const db = require('../db');
const _data = require('../dataFs');

//Container for bet methods
const login = {}

login.init = (req, res) => {
  const method = req.method.toLowerCase();
  const acceptableMethods = ['post'];
  if(acceptableMethods.indexOf(method) > -1) {
    login[method](req, res);
  } else {
    helpers.response(res, 405);
  }
}

//LOGIN POST
//Required data: email, password
login.post = (req, res) => {
  req.on('data', data => {
    let payload = Buffer.from(data).toString();
    const payloadObject = helpers.parseJsonToObject(payload);
    const email = typeof(payloadObject.email) == 'string' && payloadObject.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(payloadObject.email.trim()) ? payloadObject.email.trim() : false;
    const password = typeof(payloadObject.password) == 'string' && payloadObject.password.trim().length > 5 ? payloadObject.password.trim() : false;
    if (email && password) {
      console.log(email, password)
      db.read('user', 'email', email)
      .then(dataUser => {
        //Hash the send password and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === dataUser[0].password) {
          //If valid, create a new token with a random name. Set expiration date 1 hour in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            email,
            id : tokenId,
            expires,
            accessLevel: dataUser[0].access
          };

          //Store the token
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              helpers.response(res, 200, tokenObject);
            } else {
              helpers.response(res, 500, {'Error': 'Could not create the new token'});
            }
          });
        } else {
          helpers.response(res, 400, {'Error': 'Password did not match the specified user\'s stored password'});
        }
      })
      .catch(err => {
        helpers.response(res, 403, {'Error': 'This email does not exist'});
      })
    } else {
      helpers.response(res, 403, {'Error': 'Missing required field(s)'});
    }
  });
};

module.exports = login;
