// src/services/co2.service.js - CO2 monitoring and ventilation logic

const { controlDevice } = require('./device.service');

function monitorCO2(co2Level, threshold = 1000) {
  if (co2Level > threshold) {
    controlDevice('ventilation', 'on');
    return 'Ventilation activated';
  } else {
    controlDevice('ventilation', 'off');
    return 'CO2 levels normal';
  }
}

module.exports = { monitorCO2 };