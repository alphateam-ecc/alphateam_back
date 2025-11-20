const router = require('express').Router();
const authController = require('../controllers/auth.controller');

// Route d'inscription
router.post('/register', authController.register);

// Route de connexion
router.post('/login', authController.login);


module.exports = router;