const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const {almondfile} = require('../config');
const adapter = new FileSync(`${almondfile}.json`)
const db = low(adapter)

module.exports.low