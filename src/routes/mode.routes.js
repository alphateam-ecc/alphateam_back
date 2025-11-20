const router = require('express').Router();
const authController = require('../controllers/mode.controller');

//const authMiddleware = require('../middlewares/auth.middleware');

router.post('' ,authController.createMode);