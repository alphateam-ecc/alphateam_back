const router = require('express').Router();
const authController = require('../controllers/auth.controller');
//auth.middleware.js //認証ミドルウェア
//const authMiddleware = require('../middlewares/auth.middleware');

// Routes (mettre a jour les vrais lien coe:http://localhost:3000/app/login, http://localhost:3000/app/user/:id)
//ロート（本当のリンクを更新）
router.post('/register', authController.register); //http://localhost:8080/app/register
router.post('/login', authController.login); //http://localhost:8080/app/login
router.get('/:id', authController.getUserById); //http://localhost:8080/app/user/:id

// エクスポート
module.exports = router;
//C:\Sites\Alpha\alphateam_front\app