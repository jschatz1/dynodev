const Router = require("express");
const GitHubStrategy = require('passport-github2').Strategy;
const intakeController = require("./intake.controller");
const routes = new Router();
const passport = require("passport");
const { QueryTypes } = require("sequelize");
const models = require("../../models");
const { getSchema, getClientsTable, toBase64String, fromBase64String, logToSlack } = require("./intake.utils");

// POST /api/v1/cars
// GET /api/v1/cars/:id
// PUT /api/v1/cars/:id
// DELETE /api/v1/cars/:id
// GET /api/v1/cars

const doNotQuery = ["users", "oauth_clients", "oauth_tokens"]
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.status(401).json({msg: "Not authenticated"})
}

function shouldAuthorize(verb) {
  return (req, res, next) => {
    models.sequelize.query(
      `SELECT * FROM ${getSchema(req.params)}."authorized_routes"
      WHERE "model" = '${req.params.model}' AND "action" = '${verb}' LIMIT 1;`
    )
    .then(function(result) {
      if(result[0].length){
        console.log('result', req.originalUrl)
        ensureAuthenticated(req, res, next);
      } else {
        next();
      }
    })
    .catch((e) => {
      logToSlack(e);
      return res.status(404).json({msg: "Not found"})
    });
  }
}

function canQuery(req, res, next) {
  console.log("can query")
  const {model} = req.params;
  models.sequelize.query(
    `SELECT EXISTS(
        SELECT 1 FROM information_schema.schemata 
              WHERE schema_name = '${getSchema(req.params)}');`
  )
  .then(function(result) {
    if(!result[0][0].exists) {
      logToSlack(result[0][0]);
      return res.status(404).json({msg: "Not found"});
    }
    if(doNotQuery.includes(model)) {
      logToSlack("no not query", model);
      return res.status(404).json({msg: "Not found"});
    }
    next();
  })
  .catch(function(err) {
    logToSlack(err)
    return res.status(500).json(err);
  });
}

function getClientForSchema(req, res, next) {
  models.sequelize.query(
    `SELECT "client_id", "client_secret" FROM
    ${getClientsTable(req.params)} LIMIT 1;`
  )
  .then(function(results) {
    res.locals.client = results[0][0];
    next();
  })
  .catch((e) => {
    logToSlack(e);
    return res.status(404).json({msg: "Not found"})
  });
}

function useGitHub(req, res, next) {
  passport.use(
      new GitHubStrategy({
        clientID: res.locals.client.client_id,
        clientSecret: res.locals.client.client_secret,
        callbackURL: `https://api.dyno.dev/api/v1/${req.params.username}/${req.params.project}/auth/github/callback`
      },
      function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        // do stuff here
        const selectProfileById = `SELECT * FROM "${getSchema(req.params)}"."users"
            WHERE "uid" = '${profile.id}' LIMIT 1;`
        models.sequelize.query(selectProfileById, {
            type: QueryTypes.SELECT
          }
        ).then(function(results) {
          if(!results.length) {
            models.sequelize.query(
              `INSERT INTO "${getSchema(req.params)}"."users"
                (
                  uid,
                  username,
                  profile_pic,
                  created_at,
                  updated_at
                )
                VALUES (
                  '${profile.id}',
                  '${profile.username}',
                  '${profile.photos[0].value}',
                  NOW(),
                  NOW()
                );`, {
                type: QueryTypes.INSERT
              }
            );

            models.sequelize.query(selectProfileById, {
                type: QueryTypes.SELECT
              }
            ).then(function(results) {
              done(null, results[0]);
            })
          } else {
            done(null, results[0]);
          }
        })
        .catch((e) => {
          logToSlack(e);
          return res.status(404).json({msg: "Not found"})
        });
      })
  );
  next();
}

function unuseGitHub(req, res, next) {
  passport.unuse('github');
  next();
}

routes.get('/:username/:project/auth/github/callback',
  function(req, res, next){
    const state = JSON.parse(fromBase64String(req.query.state));
    if(state.username !== req.params.username || state.project !== req.params.project) {
      return res.status(422).json({msg: "Original OAuth2.0 request username and project is not the same as this callback's username and project"})
    }
    passport.authenticate('github', {
      successRedirect: `/api/v1/${state.username}/${state.project}/hello`
    })(req, res, next)
  },
  intakeController.authGitHubCallback);
routes.get("/:username/:project/auth/github",
  getClientForSchema,
  unuseGitHub,
  useGitHub,
  function(req, res, next){
    passport.authenticate('github', 
    {
      scope: [ 'user:email' ],
      state: toBase64String(JSON.stringify({username: req.params.username, project: req.params.project})),
    })(req, res, next);
  }, 
  intakeController.authGitHub);
routes.get("/:username/:project/hello", function(req, res, next) {
  next();
}, getClientForSchema, unuseGitHub, useGitHub, shouldAuthorize("read"), intakeController.hello);
routes.get("/:username/:project/:model",canQuery, getClientForSchema, unuseGitHub, useGitHub, shouldAuthorize("index"), intakeController.index);
routes.post("/:username/:project/:model",canQuery, getClientForSchema, unuseGitHub, useGitHub, shouldAuthorize("create"), intakeController.create);
routes.get("/:username/:project/:model/:id",canQuery, getClientForSchema, unuseGitHub, useGitHub, shouldAuthorize("read"), intakeController.show);
routes.put("/:username/:project/:model/:id",canQuery, getClientForSchema, unuseGitHub, useGitHub, shouldAuthorize("update"), intakeController.update);
routes.delete("/:username/:project/:model/:id",canQuery, getClientForSchema, unuseGitHub, useGitHub, shouldAuthorize("destroy"), intakeController.destroy);

module.exports = routes;
