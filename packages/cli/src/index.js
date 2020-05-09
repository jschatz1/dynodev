#!/usr/bin/env node
const minimist = require('minimist')
const chalk = require('chalk');
const config = require('./config');
const utils = require('./utils');

const args = minimist(process.argv.slice(2))

const input = args._;
if(input.length !== 2) {
  console.log(
    utils.join([
      chalk.blue(`Try`),
      chalk.green(`${config.commandName} create mynewproject`)
    ])
  );
  process.exit(0)
}

const command = input[0];
const param = input[1];

switch(command) {
  case "create":
    require('./modules/create')({command, param});
  break
  default:
    console.log(utils.join([
      chalk.green(command),
      chalk.blue('is not a valid command.\nTry'),
      chalk.green(`${utils.commandName} create`)
    ])
  );
  break;
}