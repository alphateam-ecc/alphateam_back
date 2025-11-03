// src/services/pid.service.js - PID Controller logic

class PID {
  constructor(kp, ki, kd, setpoint) {
    this.kp = kp;
    this.ki = ki;
    this.kd = kd;
    this.setpoint = setpoint;
    this.previousError = 0;
    this.integral = 0;
  }

  compute(input) {
    const error = this.setpoint - input;
    this.integral += error;
    const derivative = error - this.previousError;
    const output = this.kp * error + this.ki * this.integral + this.kd * derivative;
    this.previousError = error;
    return output;
  }
}

// Example usage: const tempPID = new PID(0.5, 0.1, 0.2, 25); // Target 25°C

module.exports = PID;