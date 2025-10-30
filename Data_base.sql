--  users – アプリケーションのユーザー
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2️ user_profiles – ユーザープロファイル
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    profile_name VARCHAR(50) NOT NULL,       -- Ex: 子供, 高齢者, 大人
    preferred_temperature FLOAT,             --　ユーザーの好みの温度設定
    preferred_humidity FLOAT,                --　ユーザーの好みの湿度設定
    energy_mode ENUM('normal','eco','custom') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- ユーザーは複数のプロファイルを作成でき、各プロファイルには異なる設定があります
-- 3️ devices – デバイス
CREATE TABLE devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('AC','humidifier','curtain','window','fan','heater') NOT NULL,
    status ENUM('on','off') DEFAULT 'off',
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4️ sensor_data – センサーデータ
CREATE TABLE sensor_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    temperature FLOAT,
    humidity FLOAT,
    co2 FLOAT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);


-- 各デバイスからのセンサーデータを保存

-- 5 pid_settings – PID制御設定
CREATE TABLE pid_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    profile_id INT,                        -- NULLの場合、リアルタイム設定
    Kp FLOAT DEFAULT 1,
    Ki FLOAT DEFAULT 0,
    Kd FLOAT DEFAULT 0,
    setpoint_temperature FLOAT,
    setpoint_humidity FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);


-- PID制御パラメータを保存、プロファイルごとまたはリアルタイム設定

-- 6️ action_logs – アクションログ
CREATE TABLE action_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    profile_id INT,
    device_id INT,
    action VARCHAR(50),                   --Ex: 'set_temperature','turn_on','turn_off'
    value VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (profile_id) REFERENCES user_profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);


-- ユーザーアクションのログを保存

-- 7️ energy_modes – エネルギーモード設定
CREATE TABLE energy_modes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    season ENUM('spring','summer','autumn','winter') NOT NULL,
    temperature FLOAT,
    humidity FLOAT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 季節ごとのエネルギーモード設定を保存
-- 8️ ir_signals – デバイスの赤外線信号
CREATE TABLE ir_signals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    button_name VARCHAR(50) NOT NULL,
    signal_code VARCHAR(255) NOT NULL,   -- 各ボタンのIRコード
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);


-- 赤外線リモコンデバイスの信号コードを保存

-- 9️ manual_controls – 手動制御ログ
CREATE TABLE manual_controls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    user_id INT,
    temperature FLOAT,
    humidity FLOAT,
    action ENUM('on','off','adjust') DEFAULT 'adjust',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);