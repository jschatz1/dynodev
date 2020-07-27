const path = require("path");

require("dotenv").config({
  path: path.resolve("./", ".env"),
});

const {
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  DATABASE_HOST,
  PROD_DB_APP_USER,
  PROD_DB_APP_PASSWORD,
  PROD_DB_APP_NAME,
  PROD_DB_APP_HOST,
} = require("process").env;

module.exports = {
  development: {
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    host: DATABASE_HOST,
    dialect: "postgres",
  },
  test: {
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    host: DATABASE_HOST,
    dialect: "postgres",
  },
  staging: {
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    host: DATABASE_HOST,
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: PROD_DB_APP_USER,
    password: PROD_DB_APP_PASSWORD,
    database: PROD_DB_APP_NAME,
    host: PROD_DB_APP_HOST,
    dialect: "postgres",
    logging: false,
  },
};
