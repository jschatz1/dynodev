const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const { getStore } = require("./utils");
const { getSchema, getClientsTable } = require("../modules/intake/intake.utils");
const models = require("../models");
const { QueryTypes } = require("sequelize");

const passport = require('passport');
const session = require('express-session');

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";
const isStaging = process.env.NODE_ENV === "staging";
const isProd = process.env.NODE_ENV === "production";

module.exports = (app) => {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(req, id, done) {
    if(!req.params.username || !req.params.project) {
      done(null, false);
      return
    }
    models.sequelize.query(
      `SELECT * FROM "${getSchema(req.params)}"."users"
        WHERE "id" = '${id}' LIMIT 1;`, {
        type: QueryTypes.SELECT
      }
    ).then(function(results){
      if(!results.length) {
        done(null, false);
      } else {
        done(null, results[0]);
      }
    })
  });

  if (!isDev && !isTest) {
    app.use(compression());
    app.use(helmet());
    app.set("trust proxy", 1);
  }
  app.use(cookieParser());
  app.set("trust proxy", isProd ? 1 : 0);
  app.use(session({
    secret: process.env["SESSION_SECRET"],
    store: getStore(session),
    saveUninitialized: false,
    name: "dynodev-session",
    resave: false,
    cookie: {
      // session expires after 1m
      maxAge: 2629800000,
      sameSite: isProd ? "none" : null,
      secure: isProd,
      httpOnly: true,
    },
  }));
  app.use(passport.initialize());
  app.use('/api/v1/:username/:project/*',passport.session());
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  if (isDev) {
    app.use(morgan("dev"));
  }
};
