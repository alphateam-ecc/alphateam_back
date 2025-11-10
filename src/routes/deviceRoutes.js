// デバイス一覧の取得
exports.getDevices = (req, res) => {
  db.query('SELECT * FROM devices', (err, results) => {
    if (err) {
      console.error('デバイス取得エラー:', err);
      return res.status(500).json({ error: 'デバイス取得エラー' });
    }
    res.json(results);
  });
};

// デバイスの追加
exports.addDevice = (req, res) => {
  const { name, type, location } = req.body;
  const newDevice = { name, type, location };
  db.query('INSERT INTO devices SET ?', newDevice, (err, result) => {
    if (err) {
      console.error('デバイス追加エラー:', err);
      return res.status(500).json({ error: 'デバイス追加エラー' });
    }
    res.status(201).json({ id: result.insertId, ...newDevice });
  });
};