// src/routes/api.routes.js
const express = require('express');
const router = express.Router();

// Import controller
const sensorCtrl = require('../controllers/sensor.controller');
const controlCtrl = require('../controllers/control.controller');

// === ROUTES ===
router.get('/', (req, res) => {
  res.json({ message: 'Smart Room API Running!' });
});

// Sensor routes
router.get('/sensors', sensorCtrl.getSensorData);
router.post('/sensors', sensorCtrl.postSensorData);

// Control routes
router.get('/control/start', controlCtrl.startControl);
router.get('/control/stop', controlCtrl.stopControl);

module.exports = router;