// src/services/device.service.js - Device control (simulated)

function controlDevice(device, state) {
  // Simulate controlling hardware (e.g., via GPIO or API)
  console.log(`Setting ${device} to ${state}`);
  // In real setup, integrate with hardware like Raspberry Pi
}

module.exports = { controlDevice };