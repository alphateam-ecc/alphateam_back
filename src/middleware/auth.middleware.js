// middleware/auth.middleware.js
// 認証ミドルウェア
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');
const db = require('../config/db.config');
const User = db.User;

// Middleware pour protéger les routes (vérifie l'authentification)
// ルートを保護するミドルウェア（認証を確認）
const protect = async (req, res, next) => {
    let token;

    // Vérifie si le token est présent dans l'en-tête Authorization
    // Authorizationヘッダーにトークンが存在するか確認
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrait le token (Bearer <token>)
            // トークンを抽出（Bearer <token>）
            token = req.headers.authorization.split(' ')[1];

            // Décode et vérifie le token
            // トークンをデコードして検証
            const decoded = jwt.verify(token, jwtConfig.secret, jwtConfig.verifyOptions);

            // Trouve l'utilisateur par son ID (sans le mot de passe) - Syntaxe Sequelize
            // IDでユーザーを検索（パスワードを除く）- Sequelize構文
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password_hash'] } // password_hashを除外
            });

            if (!req.user) {
                return res.status(401).json({ message: 'Utilisateur non trouvé.' }); // ユーザーが見つかりません
            }

            next(); // L'utilisateur est authentifié, passe au contrôleur
            // ユーザーが認証されました。コントローラーに進みます

        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Token invalide ou expiré.' }); // トークンが無効または期限切れです
        }
    } else {
        return res.status(401).json({ message: 'Accès non autorisé, aucun token fourni.' });
        // アクセスが許可されていません。トークンが提供されていません
    }
};

module.exports = { protect };