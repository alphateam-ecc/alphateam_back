// controllers/auth.controller.js
const db = require('../config/db.config'); // インポートDB設定
const User = db.User; // Récupère le modèle User // ユーザーモデルを取得
const jwt = require('jsonwebtoken'); // Importe la librairie JWT // JWTライブラリをインポート
const jwtConfig = require('../config/jwt.config'); // Importe les options JWT (secret, expires) // JWTオプションをインポート（秘密鍵、有効期限）
const bcrypt = require('bcryptjs'); // Pour hacher le mot de passe // パスワードをハッシュ化するため

// Fonction utilitaire pour générer le JWT
//JWTを生成するユーティリティ関数
const generateToken = (id) => {
    // Vérifie que JWT_SECRET est défini
    //JWT_SECRETが定義されているか確認
    if (!jwtConfig.secret) {
        throw new Error('JWT_SECRET n\'est pas défini dans les variables d\'environnement');
    }
    // Utilise la clé secrète et les options (expiresIn) définies dans jwt.config.js
    //jwt.config.jsで定義された秘密鍵とオプション（expiresIn）を使用
    return jwt.sign({ id }, jwtConfig.secret, jwtConfig.signOptions);
};

// Logique d'Inscription (Register)
//登録ロジック
exports.register = async (req, res) => {
    // Log pour débogage (à retirer en production)
    //デバッグ用ログ（本番環境では削除）
    console.log('📥 Données reçues pour register:', JSON.stringify(req.body, null, 2));
    
    // Accepte plusieurs variantes de noms de champs
    //複数のフィールド名のバリエーションを受け入れる
    const name = req.body.name || req.body.username || req.body.userName;
    const email = req.body.email;
    const password = req.body.password;
    
    try {
        // 1. Validation des champs requis avec messages détaillés
        //必須フィールドの詳細なメッセージ付きバリデーション
        const missingFields = [];
        if (!name) missingFields.push('username');
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        
        if (missingFields.length > 0) {
            console.error('❌ Champs manquants:', missingFields); // 不足しているフィールド
            console.error('❌ Champs reçus:', Object.keys(req.body)); // 受信したフィールド
            return res.status(400).json({ 
                message: `Champs manquants: ${missingFields.join(', ')}`, // 不足しているフィールド
                received: Object.keys(req.body), // 受信したフィールド
                receivedValues: {
                    username: name || null,
                    email: email || null,
                    password: password ? '***' : null
                },
                required: ['username', 'email', 'password'] // 必須フィールド
            });
        }

        // 2. Validation du format email
        //メール形式のバリデーション
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('❌ Format d\'email invalide:', email); // 無効なメール形式
            return res.status(400).json({ 
                message: 'Format d\'email invalide.', // 無効なメール形式
                received: { email }, // 受信したメール
                expectedFormat: 'exemple@domaine.com' // 期待される形式
            });
        }

        // 3. Validation de la longueur du mot de passe
        //パスワードの長さのバリデーション
        if (password.length < 6) {
            console.error('❌ Mot de passe trop court:', password.length, 'caractères'); // パスワードが短すぎる
            return res.status(400).json({ 
                message: 'Le mot de passe doit contenir au moins 6 caractères.', // パスワードは6文字以上である必要があります
                receivedLength: password.length, // 受信した長さ
                minimumLength: 6 // 最小長さ
            });
        }

        // 4. Vérifie si l'utilisateur existe déjà (par email ou username)
        //メールまたはユーザー名で既にユーザーが存在するか確認
        let userByEmail = await User.findOne({ where: { email } });
        if (userByEmail) {
            console.error('❌ Utilisateur existe déjà avec cet email:', email); // このメールで既にユーザーが存在
            return res.status(400).json({ 
                message: 'Cet email est déjà utilisé.', // このメールは既に使用されています
                field: 'email', // フィールド
                value: email // 値
            });
        }
        
        let userByUsername = await User.findOne({ where: { username: name } });
        if (userByUsername) {
            console.error('❌ Utilisateur existe déjà avec ce username:', name); // このユーザー名で既にユーザーが存在
            return res.status(400).json({ 
                message: 'Ce nom d\'utilisateur est déjà utilisé.', // このユーザー名は既に使用されています
                field: 'username', // フィールド
                value: name // 値
            });
        }

        // 5. Hache le mot de passe avant de créer l'utilisateur
        // パスワードをハッシュ化してからユーザーを作成
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        // 6. Crée l'utilisateur avec le mot de passe déjà haché
        // ハッシュ化されたパスワードでユーザーを作成
        user = await User.create({ 
            email, 
            password_hash,  // Mot de passe déjà haché // ハッシュ化されたパスワード
            username: name 
        });

        // 7. Génère le token
        // トークンを生成
        const token = generateToken(user.user_id);

        res.status(201).json({
            id: user.user_id,
            name: user.username,
            email: user.email,
            token,
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'inscription:', error);
        console.error('❌ Nom de l\'erreur:', error.name);
        console.error('❌ Message:', error.message);
        console.error('❌ Stack trace:', error.stack);
        
        // Gestion spécifique des erreurs Sequelize
        //Sequelizeの特定のエラー処理
        if (error.name === 'SequelizeValidationError') {
            console.error('❌ Erreurs de validation Sequelize:', error.errors); // Sequelizeバリデーションエラー
            return res.status(400).json({
                message: 'Erreur de validation des données', // データバリデーションエラー
                errors: error.errors.map(e => ({
                    field: e.path, // フィールド
                    message: e.message, // メッセージ
                    value: e.value // 値
                }))
            });
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error('❌ Contrainte unique violée'); // 一意制約違反
            console.error('❌ Champs en conflit:', error.fields); // 競合しているフィールド
            console.error('❌ Erreurs:', error.errors); // エラー
            
            // Détermine quel champ est en conflit
            // どのフィールドが競合しているかを判断します
            const conflictField = error.errors && error.errors.length > 0 
                ? error.errors[0].path 
                : (error.fields ? Object.keys(error.fields)[0] : 'unknown');
            
            const conflictValue = error.fields ? error.fields[conflictField] : 'unknown';
            
            let message = 'Cette valeur est déjà utilisée.'; // この値は既に使用されています
            if (conflictField === 'email') {
                message = 'Cet email est déjà utilisé.'; // このメールは既に使用されています
            } else if (conflictField === 'username') {
                message = 'Ce nom d\'utilisateur est déjà utilisé.'; // このユーザー名は既に使用されています
            }
            
            return res.status(400).json({
                message: message,
                field: conflictField, // フィールド
                value: conflictValue, // 値
                errors: error.errors ? error.errors.map(e => ({
                    field: e.path, // フィールド
                    message: e.message, // メッセージ
                    value: e.value // 値
                })) : []
            });
        }
        
        if (error.name === 'SequelizeDatabaseError') {
            console.error('❌ Erreur de base de données'); // データベースエラー
            return res.status(500).json({
                message: 'Erreur de base de données. Vérifiez la connexion.', // データベースエラー。接続を確認してください
                error: process.env.NODE_ENV !== 'production' ? error.message : undefined
            });
        }
        
        // Retourne un message d'erreur plus détaillé en développement
        //開発環境でより詳細なエラーメッセージを返す
        const errorMessage = process.env.NODE_ENV === 'production' 
            ? '登録時のエラーが発生しました。' 
            : error.message || '登録時のエラーが発生しました。';
        res.status(500).json({ 
            message: errorMessage,
            error: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
            errorName: error.name
        });
    }
};

// Logique de Connexion (Login)
//ログインロジック
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Validation des champs requis
        // 必須フィールドのバリデーション
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email et mot de passe sont requis.' // メールとパスワードが必要です
            });
        }

        // 2. Trouve l'utilisateur par email
        // メールでユーザーを探す
        const user = await User.findOne({ where: { email } });

        // 3. Vérifie si l'utilisateur existe ET si le mot de passe est valide
        // ユーザーが存在するか、パスワードが有効か確認
        if (user && (await user.comparePassword(password))) {
            
            // 4. Génère le token
            // トークンを生成
            const token = generateToken(user.user_id);
            
            res.json({
                id: user.user_id,
                name: user.username,
                email: user.email,
                token,
            });
        } else {
            res.status(401).json({ message: 'メールアドレスまたはパスワードが無効です。' }); // メールアドレスまたはパスワードが無効です
        }
    } catch (error) {
        console.error('接続時のエラー:', error); // 接続時のエラー
        const errorMessage = process.env.NODE_ENV === 'production' 
            ? '接続時のエラーが発生しました。' // 接続時のエラーが発生しました
            : error.message || '接続時のエラーが発生しました。';
        res.status(500).json({ 
            message: errorMessage,
            error: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    }
};
    
    
    // Récupérer un utilisateur par ID
    // IDでユーザーを取得
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id); // Sequelize: chercher par PK // Sequelize: 主キーで検索
        if (!user) {
            return res.status(404).json({ message: 'ユーザーが見つかりません。' }); // ユーザーが見つかりません
        }
        res.json(user);
    } catch (error) {
        console.error('ユーザーの取得中にエラーが発生しました:', error); // ユーザーの取得中にエラーが発生しました
        res.status(500).json({ message: 'サーバーエラーが発生しました。' }); // サーバーエラーが発生しました
    }
};

// //logique de creation de Modes
// //Un seul user peu creer plusieur Modes
// exports.Profiles = async (req, res) =>{
// //Profiles テーブルからの変数
//     const {Profile_id, User_id, profile_name, setpoint_temp, setpoint_hum, irCommandCode} = req.body;

//     try {
//         let mode = await Mode.findOne({ where: { profile_name } });
//         if (mode) {
//             return res.status(400).json({ message: 'プロフィールは既に存在します。' });
//         }
//     }catch (error) {
//         console.error('プロフィール作成中のエラー:', error);
//         res.status(500).json({ message: 'プロフィール作成中のエラーが発生しました。' });
//     }


// }