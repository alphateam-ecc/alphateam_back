-- database/schema.sql - Database schema

CREATE TABLE IF NOT EXISTS sensors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  temperature REAL,
  humidity REAL,
  co2 INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  target_temp REAL DEFAULT 25.0,
  target_humidity REAL DEFAULT 50.0
);

-- Insert default profile
INSERT OR IGNORE INTO profiles (id, user_id) VALUES (1, 1);