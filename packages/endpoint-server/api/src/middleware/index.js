const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const passport = require('passport');
const session = require('express-session');

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";
const isStaging = process.env.NODE_ENV === "staging";
const isProd = process.env.NODE_ENV === "production";

module.exports = (app) => {
  if (!isDev && !isTest) {
    app.use(compression());
    app.use(helmet());
    app.set("trust proxy", 1);
  }
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  if (isDev) {
    app.use(morgan("dev"));
  }

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });
};
