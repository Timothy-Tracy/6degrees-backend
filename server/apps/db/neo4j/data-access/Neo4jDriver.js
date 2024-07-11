/**
 * @file Neo4jDriver.js
 * @description A module that initializes and returns the Neo4j Driver
 */
const neo4j = require('neo4j-driver');
require('dotenv').config()
const {
    DB_URL,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DATABASE
} = process.env;
const mylogger = require('../../../../lib/logger/logger.js');
const logger = mylogger.child({ 'module': 'Neo4jDriver' });
const {AppError} = require('../../../../lib/error/customErrors.js')
let driver;
function initDriver() {
    if(!driver){
        driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    }
  return driver;
}

function closeDriver() {
  if (driver) {
    driver.close();
  }
}

module.exports = {
  initDriver,
  closeDriver,
};