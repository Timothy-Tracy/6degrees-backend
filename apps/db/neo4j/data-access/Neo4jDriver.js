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
let session;
function initDriver() {
    if(!driver){
        driver = neo4j.driver(DB_URL, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD))
    }
  return driver;
}

function initSession() {
  if(!driver){
    initDriver()
  }

  if (!session){
    session = driver.session({ DB_DATABASE });

  }

  return session
}

function closeDriver() {
  if (driver) {
    driver.close();
  }
}

module.exports = {
  initDriver,
  closeDriver,
  initSession
};