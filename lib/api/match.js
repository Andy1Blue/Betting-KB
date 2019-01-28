/*
 *
 *
 * Match API
 *
 */

//Dependecies
const helpers = require('../helpers');
const db = require('../db');

//Container for bet methods
const match = {}

match.init = (req, res) => {
  const method = req.method.toLowerCase();
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(method) > -1) {
    match[method](req, res);
  } else {
    helpers.response(res, 405);
  }
};

match.get = (req, res) => {
  const idMatch = req.params.id
  if (idMatch && idMatch != 0) {
    db.read('match_', 'id', idMatch)
    .then(matchData => {
      helpers.response(res, 200, matchData[0]);
    })
    .catch(err => {
      helpers.response(res, 404, err);
    })

  } else {
    db.read('match_')
    .then(matchData => {
      helpers.response(res, 200, matchData);
    })
    .catch(err => console.log('err' + err))
  }
};

module.exports = match;
