// server.js
//node index ファイル
// Main server file
require('dotenv').config();
const express = require('express');
const http = require('http');
const db = require('./config/db.config.js'); // <-- IMPORT from DB CONFIG // DB設定のインポート
const { initSocket } = require('./services/socketService');
const { connectMqtt } = require('./services/mqttService');
const cors = require("cors");
const app = express();
const server = http.createServer(app);

// CORS configuration (doit être avant les routes)
// CORS設定（ルートの前に配置する必要があります）
// En développement, autoriser toutes les origines localhost
// 開発環境では、すべてのlocalhostオリジンを許可
const corsOptions = {
    origin: function (origin, callback) {
        // Autoriser les requêtes sans origine (Postman, mobile apps, etc.)
        // オリジンなしのリクエストを許可（Postman、モバイルアプリなど）
        if (!origin) return callback(null, true);
        // Autoriser toutes les origines localhost
        // すべてのlocalhostオリジンを許可
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        // En production, spécifier les origines autorisées
        // 本番環境では、許可されたオリジンを指定
        callback(null, true); // Pour le développement, autoriser toutes les origines // 開発用：すべてのオリジンを許可
    },
    credentials: true, // 資格情報を許可
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json()); // JSONボディパーサー

// Middleware de logging pour déboguer les requêtes
// リクエストをデバッグするためのロギングミドルウェア
app.use((req, res, next) => {
    if (req.path.includes('/register') || req.path.includes('/login')) {
        console.log(`\n📨 ${req.method} ${req.path}`);
        console.log('📦 Body:', JSON.stringify(req.body, null, 2));
        console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
    }
    next();
});

// --- 1. Connexion et Synchronisation à la Base de Données (MySQL) ---
// データベース（MySQL）への接続と同期
// Test de connexion à la base de données
// データベースへの接続テスト
db.sequelize.authenticate()
    .then(() => {
        console.log('✅ Connexion à la base de données réussie.'); // データベースへの接続が成功しました
        // Synchronise tous les modèles définis avec la base de données (crée les tables si elles n'existent pas)
        // 定義されたすべてのモデルをデータベースと同期（テーブルが存在しない場合は作成）
        return db.sequelize.sync({ alter: true }); // `alter: true` ajuste les tables sans les supprimer (utile en dev)
        // alter: true はテーブルを削除せずに調整します（開発時に便利）
    })
    .then(() => {
        console.log('✅ Synchronisation de la Base de Données MySQL réussie.'); // MySQLデータベースの同期が成功しました
    })
    .catch(err => {
        console.error('❌ Erreur de connexion/synchronisation DB:', err.message); // DB接続/同期エラー
        console.error('❌ Vérifiez vos paramètres de connexion dans le fichier .env'); // .envファイルの接続パラメータを確認してください
        // Le serveur démarre quand même, mais les requêtes DB échoueront
        // サーバーは起動しますが、DBリクエストは失敗します
    });

// --- 2. Initialisation des Services IoT ---
// IoTサービスの初期化
initSocket(server);
connectMqtt();

// --- 3. Définition des Routes ---
// ルートの定義
const authRoutes = require('./routes/auth.routes');
// ... autres routes // ... その他のルート


const userRoutes = require('./routes/User.route');
app.use('/app', userRoutes);


app.use('/api/auth', authRoutes);

// Route de test simple pour la racine (/)
// ルート（/）のシンプルなテストルート
app.get('/', (req, res) => {
    // Vous pouvez renvoyer un simple message JSON ou du texte
    // シンプルなJSONメッセージまたはテキストを返すことができます
    res.status(200).json({ 
        message: 'API IoT est en cours d\'execution ! Accedez aux routes d\'API via /api/...' 
        // API IoTが実行中です！/api/...経由でAPIルートにアクセスしてください
    });
});

// Middleware de gestion d'erreur global (doit être après toutes les routes)
// グローバルエラーハンドリングミドルウェア（すべてのルートの後に配置する必要があります）
app.use((err, req, res, next) => {
    console.error('Erreur non gérée:', err); // 未処理のエラー
    res.status(err.status || 500).json({
        message: err.message || 'Une erreur interne du serveur s\'est produite.', // サーバー内部エラーが発生しました
        error: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });
});

// Middleware pour les routes non trouvées
// 見つからないルート用のミドルウェア
app.use((req, res) => {
    res.status(404).json({
        message: 'Route non trouvée', // ルートが見つかりません
        path: req.originalUrl
    });
});

// Démarrage du serveur (un seul appel listen sur server pour Socket.io)
// サーバーの起動（Socket.io用にserverでlistenを1回だけ呼び出す）
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://localhost:${PORT}`); // サーバーが実行中
});