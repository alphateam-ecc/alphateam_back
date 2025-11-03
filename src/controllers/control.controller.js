// src/controllers/control.controller.js
const { startControlLoop, stopControlLoop } = require('../services/control.service');

exports.startControl = (req, res) => {
  startControlLoop();
  res.json({ message: 'Control loop started (every 10s)' });
};

exports.stopControl = (req, res) => {
  stopControlLoop();
  res.json({ message: 'Control loop stopped' });
};

exports.getStatus = (req, res) => {
  res.json({ status: 'API is running', time: new Date().toISOString() });
};