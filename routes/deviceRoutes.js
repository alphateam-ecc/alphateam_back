//デバイス関連のルート設定
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/devicesControllers.js');

//デバイス一覧の取得
router.get('/', deviceController.getDevices);
router.post('/', deviceController.addDevice);

module.exports = router;
