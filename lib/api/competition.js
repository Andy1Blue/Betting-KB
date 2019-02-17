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

//Competition GET
//Required data: token, email
//Optional: idcompetition
competition.get = (req, res) => {
  const idCompetition = typeof(parseInt(req.headers.idcompetition)) == 'number' && req.headers.idcompetition > 0 ? req.headers.idcompetition : false;
  const email = typeof (req.headers.email) == 'string' && req.headers.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(req.headers.email.trim()) ? req.headers.email.trim() : false;
  if (email) {
    const token = typeof(req.headers.token) =='string' && req.headers.token.length == 20 ? req.headers.token : false;
    helpers.isAdminVerify(email, token, req, res).then(
      result => {
        if(result){
        db.read('competition')
          .then(competitionList => {
            helpers.response(res, 200, competitionList);
          })
      } else {
          if (idCompetition) {
            db.read('competition', 'id', idCompetition)
            .then(competitionData => {
              helpers.response(res, 200, competitionData);
            })
            .catch(err => console.log('err' + err))
          } else {
              db.read('competition')
              .then(competitionData => {
                helpers.response(res, 200, competitionData);
              })
              .catch(err => console.log('err' + err))
        }
      }
    }
        );
  } else {
    helpers.response(res, 403, {'Error' : 'Missing required field(s)'});
  }
};

module.exports = competition;
