// config.js

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-that-no-one-can-guess', // Use environment variable in production
  tokenExpiresIn: '1h', // e.g., '1h', '7d', '30m'
  // Other configurations can be added here
  //他のの設定はここに追加できます
};