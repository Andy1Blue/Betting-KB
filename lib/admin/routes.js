/*
 * Admin routes
 *
 *
 *
 */

const controller = require('./controller');

module.exports = function(app) {
  /*
   * User
   *
   */

  // Admin panel - get all users data
  app.get('/admin/user', (req, res) => {
    controller.getAllUsers(req, res);
  });

  // Admin panel - get user with :userId
  app.get('/admin/user/:userId', (req, res) => {
    const userId = req.params.userId;
    controller.getUser(req, res, userId);
  });

  // Admin panel - add user (post)
  app.post('/admin/user', (req, res) => {
    controller.addUser(req, res);
  });

  // Admin panel - delete user (delete)
  app.delete('/admin/user', (req, res) => {
    controller.deleteUser(req, res);
  });

  /*
   * Match
   *
   */

  // Admin panel - get all matchs data
  app.get('/admin/match', (req, res) => {
    controller.getAllMatchs(req, res);
  });

  // Admin panel - get match with :userId
  app.get('/admin/match/:matchId', (req, res) => {
    const matchId = req.params.matchId;
    controller.getMatch(req, res, matchId);
  });

  // Admin panel - add match (post)
  app.post('/admin/match', (req, res) => {
    controller.addMatch(req, res);
  });

  // Admin panel - delete match (delete)
  app.delete('/admin/match', (req, res) => {
    controller.deleteMatch(req, res);
  });

  // Admin panel - edit match (put)
  app.put('/admin/edit', (req, res) => {
    controller.editMatch(req, res);
  });

  /*
   * Competiton
   *
   */

  // Admin panel - get all competitons data
  app.get('/admin/competiton', (req, res) => {
    controller.getAllCompetition(req, res);
  });

  // Admin panel - get competiton with :competitionId
  app.get('/admin/competiton/:competitionId', (req, res) => {
    const competitionId = req.params.competitionId;
    controller.getCompetition(req, res, competitionId);
  });

  // Admin panel - add competition (post)
  app.post('/admin/competition', (req, res) => {
    controller.addCompetition(req, res);
  });

  // Admin panel - delete competition (delete)
  app.delete('/admin/competition', (req, res) => {
    controller.deleteCompetition(req, res);
  });
  /*
   * Bet
   *
   */

  // Admin panel - get all bets data
  app.get('/admin/bet', (req, res) => {
    controller.getAllBets(req, res);
  });

  // Admin panel - get bet with :betId
  app.get('/admin/bet/:betId', (req, res) => {
    const betId = req.params.betId;
    controller.getBet(req, res, betId);
  });

  // Admin panel - add bet (post)
  app.post('/admin/bet', (req, res) => {
    controller.addBet(req, res);
  });

  // Admin panel - delete bet (delete)
  app.delete('/admin/bet', (req, res) => {
    controller.deleteBet(req, res);
  });

  /*
   * Register
   *
   */

  // Admin panel - get all registers data
  app.get('/admin/register', (req, res) => {
    controller.getAllRegisters(req, res);
  });

  // Admin panel - get register with :registerId
  app.get('/admin/register/:registerId', (req, res) => {
    const registerId = req.params.registerId;
    controller.getRegister(req, res, registerId);
  });

  // Admin panel - delete register (delete)
  app.delete('/admin/register', (req, res) => {
    controller.deleteRegister(req, res);
  });
}
