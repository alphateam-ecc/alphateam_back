// src/utils/helpers.js - Utility helpers

function formatDate(date) {
  return new Date(date).toISOString();
}

function validateNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

module.exports = { formatDate, validateNumber };