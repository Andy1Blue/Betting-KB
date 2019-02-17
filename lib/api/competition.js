/*
 *
 *
 * Competition API
 *
 */

//Dependecies
const helpers = require('../helpers');
const db = require('../db');

//Container for competition methods
const competition = {}

competition.init = (req, res) => {
  const method = req.method.toLowerCase();
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(method) > -1) {
    match[method](req, res);
  } else {
    helpers.response(res, 405);
  }
};

module.exports = competition;
