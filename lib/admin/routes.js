/*
 * Admin routes
 *
 *
 *
 */

const admin = require('./controller');

module.exports = function(app) {
  /*
   * User
   *
   */

  // Admin panel - get all users data
  app.get('/admin/user', (req, res) => {
    admin.getAllUsers(req, res);
  });

  // Admin panel - get user with :userId
  app.get('/admin/user/:userId', (req, res) => {
    const userId = req.params.userId;
    admin.getUser(req, res, userId);
  });

  // Admin panel - add user (post)
  app.post('/admin/user', (req, res) => {
    admin.addUser(req, res);
  });

  // Admin panel - delete user (delete)
  app.delete('/admin/user', (req, res) => {
    admin.deleteUser(req, res);
  });

  /*
   * Match
   *
   */

  // Admin panel - get all matchs data
  app.get('/admin/match', (req, res) => {
    admin.getAllMatchs(req, res);
  });

  // Admin panel - get match with :userId
  app.get('/admin/match/:matchId', (req, res) => {
    const matchId = req.params.matchId;
    admin.getMatch(req, res, matchId);
  });

  // Admin panel - add match (post)
  app.post('/admin/match', (req, res) => {
    admin.addMatch(req, res);
  });

  // Admin panel - delete match (delete)
  app.delete('/admin/match', (req, res) => {
    admin.deleteMatch(req, res);
  });

  /*
   * Competiton
   *
   */

  // Admin panel - get all competitons data
  app.get('/admin/competiton', (req, res) => {
    admin.getAllCompetition(req, res);
  });

  /*
   * Bet
   *
   */

  // Admin panel - get all bets data
  app.get('/admin/bet', (req, res) => {
    admin.getAllBets(req, res);
  });

  /*
   * Register
   *
   */

  // Admin panel - get all registers data
  app.get('/admin/register', (req, res) => {
    admin.getAllRegisters(req, res);
  });
}
