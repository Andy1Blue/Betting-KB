const crypto = require('crypto');
const config = require('./config');
const nodemailer = require('nodemailer');

const helpers = {};

helpers.hash = (str) => {
  if(typeof(str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash
  } else {
    return false
  }
};


helpers.createRandomString = (strLength) => {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength) {
    //Define all posaible character that could go to the string
    const posaibleCharacters = 'abcdefghijklmnoprstquwyz0123456789ABCDEFGHIJKLMNOPQRSTUWXYZ';
    //Start the final string

    let str = '';
    for(i = 1; i <= strLength; i++) {
      const randomCharacter = posaibleCharacters.charAt(Math.floor(Math.random() * posaibleCharacters.length));
      str += randomCharacter;
    }
    return str;
  }
};

helpers.sendEmail = (userEmail, key) => {
  nodemailer.createTestAccount((err, account) => {
    let transporter = nodemailer.createTransport(config.emailSettings);
  
    let mailOptions = {
      from: '"Fred Foo 👻" <no-reaply@pkopy.pl>', // sender address
      to: userEmail,// list of receivers
      subject: 'Hello ✔', // Subject line
      text: key || 'hell', // plain text body
      html: `<a href="http://localhost:3000/${key}">Aktywuj</a>` // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
  });



}

module.exports = helpers