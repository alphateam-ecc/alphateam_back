// src/controllers/profile.controller.js - Handles user profiles and settings

const { getDb } = require('../database');

exports.getProfiles = (req, res) => {
  db.all('SELECT * FROM profiles', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
};

exports.updateProfile = (req, res) => {
  const { id, target_temp, target_humidity } = req.body;
  db.run('UPDATE profiles SET target_temp = ?, target_humidity = ? WHERE id = ?',
    [target_temp, target_humidity, id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Profile updated' });
      }
    }
  );
};