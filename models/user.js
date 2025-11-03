//ユーザー関連のモデル設定
exports.getUsers = (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('ユーザー取得エラー:', err);
      return res.status(500).json({ error: 'ユーザー取得エラー' });
    }
    res.json(results);
  });
};

// ユーザーの追加
exports.addUser = (req, res) => {
  const { name, email, password } = req.body;
  const newUser = { name, email, password };
  db.query('INSERT INTO users SET ?', newUser, (err, result) => {
    if (err) {
      console.error('ユーザー追加エラー:', err);
      return res.status(500).json({ error: 'ユーザー追加エラー' });
    }
    res.status(201).json({ id: result.insertId, ...newUser });
  });
};
