// src/controllers/sensor.controller.js
const { getDb } = require('../database');

exports.getSensorData = (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM sensors ORDER BY timestamp DESC LIMIT 10', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
};

exports.postSensorData = (req, res) => {
  const db = getDb();
  const { temperature, humidity, co2 } = req.body;

  if (!temperature || !humidity || co2 === undefined) {
    return res.status(400).json({ error: 'Missing data' });
  }

  db.run(
    'INSERT INTO sensors (temperature, humidity, co2) VALUES (?, ?, ?)',
    [temperature, humidity, co2],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, message: 'Added!' });
    }
  );
};