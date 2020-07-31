const Router = require("express");
const GitHubStrategy = require('passport-github2').Strategy;
const intakeController = require("./intake.controller");
const routes = new Router();
const passport = require("passport");
const models = require("../../models");
const { getSchema, getClientsTable } = require("./intake.utils");

// POST /api/v1/cars
// GET /api/v1/cars/:id
// PUT /api/v1/cars/:id
// DELETE /api/v1/cars/:id
// GET /api/v1/cars

const doNotQuery = ["users", "oauth_clients", "oauth_tokens"]

function canQuery(req, res, next) {
  const {model} = req.params;
  models.sequelize.query(
    `SELECT EXISTS(
        SELECT 1 FROM information_schema.schemata 
              WHERE schema_name = '${getSchema(req.params)}');`
  )
  .then(function(result) {
    if(!result[0][0].exists) {
      return res.status(404).json({msg: "Not found"});
    }
    if(doNotQuery.includes(model)) {
      return res.status(404).json({msg: "Not found"});
    }
    next();
  })
  .catch(function(err) {
    console.log(err);
    return res.status(500).json(err);
  });
}

function getClientForSchema(req, res, next) {
  models.sequelize.query(
    `SELECT "client_id", "client_secret" FROM ${getClientsTable(req.params)} LIMIT 1;`
  )
  .then(function(results) {
    res.locals.client = results[0][0];
    next();
  });
}

function useGitHub(req, res, next) {
  console.log("res.locals.client", res.locals.client)
  passport.use(
      new GitHubStrategy({
        clientID: res.locals.client.client_id,
        clientSecret: res.locals.client.client_secret,
        callbackURL: "http://localhost:3001/api/v1/auth/github/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        // do stuff here

        return done(null, profile);
      })
  );
  next();
}

function unuseGitHub(req, res, next) {
  passport.unuse('github');
  next();
}

routes.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), intakeController.authGitHubCallback);
routes.get("/:username/:project/auth/github",
  getClientForSchema,
  unuseGitHub,
  useGitHub,
  passport.authenticate('github', 
    { scope: [ 'user:email' ] }), 
  intakeController.authGitHub);
routes.post("/:username/:project/:model",canQuery, intakeController.create);
routes.get("/:username/:project/:model/:id",canQuery, intakeController.show);
routes.put("/:username/:project/:model/:id",canQuery, intakeController.update);
routes.delete("/:username/:project/:model/:id",canQuery, intakeController.destroy);
routes.get("/:username/:project/:model",canQuery, intakeController.index);

module.exports = routes;
