// models/Mode.js
//テーブル名：Profiles（Mode）
module.exports = (sequelize, DataTypes) => {
    const Mode = sequelize.define('Mode', {
        profile_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: { // ユーザーにリンクするための外部キー
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'user_id' } 
        },
        profile_name: { // モード名（例："ベビーモード", "ナイトモード"）
            type: DataTypes.STRING,
            allowNull: false,
        },
        setpoint_temp: { // 目標温度
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 25.0,
        },
        setpoint_hum: { // 目標湿度
            type: DataTypes.FLOAT,
            defaultValue: 60.0,
        },
        // このモードを有効にするために送信するIRコードの例
        irCommandCode: { 
            type: DataTypes.JSON, // JSONオブジェクトまたはコードの配列を保存
            allowNull: false,
        }
    }, {
        tableName: 'profiles',
        timestamps: true,
    });

    // ユーザーモデルとの関係を定義
    Mode.associate = (models) => {
        Mode.belongsTo(models.User, { foreignKey: 'user_id', as: 'users' });
    };

    return Mode;
};
