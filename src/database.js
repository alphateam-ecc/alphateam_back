// src/database.js - SQLite database connection and initialization

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/smart_room.db');
const schemaPath = path.join(__dirname, '../database/schema.sql');

let db;

function initDatabase() {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database.');
      // Load schema if database is new
      if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
          if (err) {
            console.error('Error executing schema:', err.message);
          } else {
            console.log('Database schema initialized.');
          }
        });
      }
    }
  });
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized.');
  }
  return db;
}

module.exports = { initDatabase, getDb };