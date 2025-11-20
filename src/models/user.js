// ユーザーモデル
// models/User.js
// User Model
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true, // 主キー
            autoIncrement: true, // 自動インクリメント
        },
        username : {
        type: DataTypes.STRING,
        allowNull: false, // NULLを許可しない
        defaultValue: 'User', // デフォルト値
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false, // NULLを許可しない
            unique: true, // 一意制約
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false, // NULLを許可しない
            hashed : true, // ハッシュ化済み
        },
        // NOTE: deviceName est utilisé dans iot.controller.js et mode.controller.js
        // 注意: deviceNameはiot.controller.jsとmode.controller.jsで使用されますが、
        // 現在はコメントアウトされています。この機能が必要な場合は、
        // 以下のフィールドのコメントを解除してください：
        // deviceName: {
        //     type: DataTypes.STRING,
        //     defaultValue: null,
        // },
    }, {
        // Sequelizeのオプション
        // Sequelize Options
        tableName: 'users', // テーブル名
        timestamps: true, // createdAt と updatedAt を自動管理
    });

    // Note: Le hachage du mot de passe est maintenant fait dans le contrôleur
    // 注意: パスワードのハッシュ化は、ユーザー作成前にコントローラーで行われます。
    // beforeValidateフックは不要になりました。password_hashは直接User.create()に渡されます。

    // --- Méthodes Personnalisées (pour comparer le mot de passe) ---
    // カスタムメソッド（パスワードの比較用）
    User.prototype.comparePassword = function (candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password_hash);
    };

    return User;
};