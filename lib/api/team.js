/*
 *
 *
 * Team API
 *
 */

//Dependecies
const helpers = require('../helpers');
const db = require('../db');

//Container for team methods
const team = {}

team.init = (req, res) => {
  const method = req.method.toLowerCase();
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(method) > -1) {
    match[method](req, res);
  } else {
    helpers.response(res, 405);
  }
};

module.exports = team;
