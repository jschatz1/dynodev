const morgan = require("morgan");
const bodyParser = require("body-parser");
const compression = require("compression");
const helmet = require("helmet");
const models = require("../models");
const path = require("path");
const {isDev, isTest} = require("../helpers/envHelpers");

module.exports = (app) => {
  if (!isDev && !isTest) {
    app.use(compression());
    app.use(helmet());
    app.set("trust proxy", 1);
  }
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  if (isDev) {
    app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
  }
};
