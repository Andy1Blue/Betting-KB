/*
 *
 * Workers
 *
 *
 */

 /*
 *
 * Workers related tasks
 *
 */

//Dependencies
const helpers = require('./helpers');
const _data = require('./dataFs');

//Instantiate the worker object
const workers = {};


//Lookup all checks, get their data, send to a validator
workers.gatherAllTokens = () => {
  console.log(Date.now())
  //Get all the tokens
  _data.list('tokens', (err, tokens) => {
    if (!err && tokens && tokens.length > 0) {
      console.log(tokens)
      tokens.forEach(token => {
        _data.read('tokens', token, (err, tokenData) => {
          if (!err && tokenData) {
            workers.checkTokenData(tokenData);
          } else {
            console.log('Error reading one of the tokens data')

          }
        });
      });
    } else {
      console.log('Nothing to read')
    }
  });
};

//Check data
workers.checkTokenData = (data) => {
  data = helpers.parseJsonToObject(data)
  if (data.expires && data.expires < Date.now()) {
    _data.delete('tokens', data.id, err => {
      if (!err) {
        console.log(`Token ${data.id} has been deleted`)
      } else {
        console.log(`Could not delete this token`)
      }
    });
  } else {
    console.log('all tokens are ok')
  }
};

//Timer to execute the worker-process once per minute
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllTokens();
  }, 1000 * 60);
};

//Init script
workers.init = () => {
  workers.gatherAllTokens();
  workers.loop();
};

//Export the module
module.exports = workers;
