// config/db.config.js
require('dotenv').config();
const { Sequelize } = require('sequelize');
// Sequelize connection initialization
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false, //sql ログを無効にする
        pool: { // 接続プールの設定
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// モデルをインポートして初期化します
db.User = require('../models/Users.js')(sequelize, Sequelize);
db.Mode = require('../models/Mode.js')(sequelize, Sequelize); // 後で追加

module.exports = db;