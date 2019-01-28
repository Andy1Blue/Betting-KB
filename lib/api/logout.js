/*
 *
 *
 * Logout API
 *
 */ 

//Dependecies
const helpers = require('../helpers');
const _data = require('../dataFs');

const logout = {}

logout.init = (req, res) => {
  const method = req.method.toLowerCase();
  const acceptableMethods = ['delete'];
  if(acceptableMethods.indexOf(method) > -1) {
    logout[method](req, res);
  } else {
    helpers.response(res, 405);
  }
};

//LOGOUT DELETE
//Required data: token, email
logout.delete = (req, res) => {
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;

  if (email) {
    const token = typeof(req.headers.token) =='string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        _data.delete('tokens', token, err => {
          if (!err) {
            helpers.response(res, 200)
          } else {
            helpers.response(res, 500, err)
          }
        });
      } else {
        helpers.response(res, 500)
      }
    });

  } else {
    helpers.response(res, 403, {'Error': 'Missing required field(s)'});
  }
};

module.exports = logout;
