const crypto = require('crypto');
const config = require('./config');

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

module.exports = helpers