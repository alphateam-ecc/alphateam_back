// src/services/control.service.js
const { getDb } = require('../database'); // Chỉ import hàm
const PID = require('./pid.service');
const { monitorCO2 } = require('./co2.service');
const { compensateTemperature, compensateHumidity } = require('./compensation.service');
const { controlDevice } = require('./device.service');

let intervalId = null;

function startControlLoop(interval = 10000) {
  if (intervalId) return;

  intervalId = setInterval(() => {
    const db = getDb(); // Gọi DB khi cần, lúc này đã init

    db.get('SELECT * FROM sensors ORDER BY timestamp DESC LIMIT 1', (err, row) => {
      if (err || !row) {
        console.log('No sensor data yet.');
        return;
      }

      const temp = compensateTemperature(row.temperature);
      const humidity = compensateHumidity(row.humidity);
      const co2 = row.co2;

      // PID logic for temperature control
      const tempPID = new PID(0.5, 0.1, 0.2, 25);
      const output = tempPID.compute(temp);
      controlDevice('heater', output > 0 ? 'on' : 'off');

      // CO2 logic
      monitorCO2(co2);

      console.log(`Control: T=${temp}°C, H=${humidity}%, CO2=${co2}ppm`);
    });
  }, interval);

  console.log('Control loop started.');
}

function stopControlLoop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Control loop stopped.');
  }
}

module.exports = { startControlLoop, stopControlLoop };