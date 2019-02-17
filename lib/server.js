/*
 *
 * Server-related task
 *
 */

//Dependencies
const express = require('express');
const app = express();
const config = require('../config');
const port = config.port;
const cors = require('cors');
const db = require('./db');
const helpers = require('./helpers');

const bet = require('./api/bet');
const logout = require('./api/logout');
const login = require('./api/login');
const register = require('./api/register');
const user = require('./api/user');
const match = require('./api/match')

//Instantiate the server module object
const server = {};

app.use(cors());
app.use(express.static('public'));

app.all('/bet', (req, res) => {
  bet.init(req, res);
});

app.all('/logout', (req, res) => {
  logout.init(req, res);
});

app.all('/login', (req, res) => {
  login.init(req, res);
});

app.all('/register/:key', (req, res) => {
    register.init(req, res);
});

app.all('/user', (req, res) => {
  user.init(req, res);
});

app.all('/match/:id', (req, res) => {
  match.init(req, res);
});

app.all('/match', (req, res) => {
  match.init(req, res);
});

//Get all competition
app.get('/competition', (req, res) => {
  db.read('competition')
  .then(compData => {
    helpers.response(res, 200, compData)
  })
  .catch((err) => {
    helpers.response(res, 403, err);
  })
});

app.get('/test/:id', (req, res) => {
  const id = req.params.id;

  db.read('competition', 'id', id)
    .then(data => {
      let objCompetition = data[0];
      db.read('match_', 'id_comp', id)
        .then((dataMatch) => {
        objCompetition.matches = dataMatch;
        helpers.response(res, 200, objCompetition)
      })
      .catch(() => {
        objCompetition.matches = [];
        helpers.response(res, 200, objCompetition)
      });
    })
    .catch(err => {
      helpers.response(res, 404, err)
    })
});

//Init script
server.init = () => {
  app.listen(config.port, () => console.log(`BETTING application starting on port: ${config.port}!`));
}
//Export the module
module.exports = server;
