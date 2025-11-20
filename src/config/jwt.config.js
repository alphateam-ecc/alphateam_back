// config/jwt.config.js
require('dotenv').config();

// Récupération de la clé secrète depuis le fichier .env
//.env から秘密鍵を取得
const secret = process.env.JWT_SECRET; 

// Options pour la création (signature) du token
//tokenを作成するためのオプション
const signOptions = {
    // Le token expirera après 7 jours
    //tokenは7日後に期限切れになります
    expiresIn: '7d', 
    // Optionnel : l'émetteur (issuer) du token
    // issuer: 'Mon-API-IoT' 
};

// Options pour la vérification du token (doit correspondre aux options de signature)
//tokenの確認
const verifyOptions = {
    // Optionnel : vérifie l'émetteur (issuer)
    // issuer: 'Mon-API-IoT', 
    // Optionnel : vérifie l'algorithme (par défaut, souvent HS256)
    // algorithms: ['HS256']
};

module.exports = {
    secret,
    signOptions,
    verifyOptions
};