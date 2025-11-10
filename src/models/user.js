// ユーザーモデル
const User = {
  // ユーザーの作成
  create: (userData, callback) => {
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [userData.name, userData.email, userData.password], (err, result) => {
      if (err) return callback(err);
      callback(null, { id: result.insertId, ...userData });
    });
  },

  // ユーザーの取得
  findById: (userId, callback) => {
    const sql = "SELECT * FROM users WHERE id = ?";
    db.query(sql, [userId], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },
};

//   // ユーザーの更新
//   update: (userId, userData, callback) => {
//     const sql = "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";
//     db.query(sql, [userData.name, userData.email, userData.password, userId], (err, result) => {
//       if (err) return callback(err);
//       callback(null, { id: userId, ...userData });
//     });
//   },

//   // ユーザーの削除
//   delete: (userId, callback) => {
//     const sql = "DELETE FROM users WHERE id = ?";
//     db.query(sql, [userId], (err, result) => {
//       if (err) return callback(err);
//       callback(null, { id: userId });
//     });
//   }
// };

module.exports = User;
