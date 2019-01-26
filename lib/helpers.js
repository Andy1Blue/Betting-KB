/*
 *
 * Helpers
 *
 */

const crypto = require('crypto');
const config = require('../config');
const nodemailer = require('nodemailer');
const _data = require('./dataFs');
const db = require('./db');

const helpers = {};

helpers.hash = (str) => {
  if (typeof (str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

helpers.createRandomString = (strLength) => {
  strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    //Define all posaible character that could go to the string
    const posaibleCharacters = 'abcdefghijklmnoprstquwyz0123456789ABCDEFGHIJKLMNOPQRSTUWXYZ';
    //Start the final string

    let str = '';
    for (i = 1; i <= strLength; i++) {
      const randomCharacter = posaibleCharacters.charAt(Math.floor(Math.random() * posaibleCharacters.length));
      str += randomCharacter;
    }
    return str;
  }
};

helpers.response = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json'
  });
  const payloadString = JSON.stringify(payload);
  response.end(payloadString)
};

helpers.verifyToken = (id, email, callback) => {
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      //Check that the token is for the given user, and  has not expired
      tokenData = helpers.parseJsonToObject(tokenData)
      if (tokenData.email == email && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

helpers.isAdminVerify = (email, token, req, res) => {
  if (email && token) {
    helpers.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        db.read('user', 'email', email)
          .then(userData => {
            if (typeof (userData) === 'object') {
              let userAccess = userData[0].access;
              if (token && userAccess === 1) {
                return true;
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

helpers.sendEmail = (userEmail, key) => {
  nodemailer.createTestAccount((err, account) => {
    let transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: {
        user: config.mail.auth.user,
        pass: config.mail.auth.pass
      }
    });

    let mailOptions = {
      from: config.mail.sendOptions.from, // sender address
      to: userEmail, // list of receivers
      subject: config.mail.sendOptions.subject, // Subject line
      text: key || 'test', // plain text body
      html: `<a href="http://localhost:` + config.port + `/register/${key}">Aktywuj</a>` // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    });
  });
}

module.exports = helpers
