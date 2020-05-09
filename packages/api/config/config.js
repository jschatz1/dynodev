var path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "..", ".env"),
});

var {
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_HOST,
  PROD_DB_APP_USER,
  PROD_DB_APP_PASSWORD,
  PROD_DB_APP_HOST,
} = require("process").env;

module.exports = {
  development: {
    username: "jacobschatz",
    password: "",
    database: "almond_dev",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  test: {
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: "almond_test",
    host: DATABASE_HOST,
    dialect: "postgres",
  },
  staging: {
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: "almond_staging",
    host: DATABASE_HOST,
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: PROD_DB_APP_USER,
    password: PROD_DB_APP_PASSWORD,
    database: "almond_production",
    host: PROD_DB_APP_HOST,
    dialect: "postgres",
    logging: false,
  },
};
