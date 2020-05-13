#!/usr/bin/env node
const minimist = require('minimist')
const chalk = require('chalk');
const config = require('./config');
const utils = require('./utils');
const resources = ["project", "model"];

const args = minimist(process.argv.slice(2))

const input = args._;

const command = input[0];
const resource = input[1];
const param = input[2]

switch(resource) {
  case "project":
    switch(command) {
      case "create":
        require('./modules/projects/create')({command, param});
        break;
      default:
        console.log(
          utils.join([
            chalk.red("Invalid command, try:"),
            chalk.green("create project myFunProject")
          ])
        );
    }
  break
  case "model":
    switch(command) {
      case "create":
        require('./modules/models/create')({command, param});
        break;
      default:
        console.log(
          utils.join([
            chalk.red("Invalid command, try:"),
            chalk.green("create model comments")
          ])
        );
      };
  break;
  default:
    console.log(utils.join([
      chalk.red("Invalid resource. Available resources:"),
      chalk.blue(resources.join(", "))
    ])
  );
}