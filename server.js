const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

//ルートのインポート
const deviceRoutes = require('./routes/deviceRoutes.js');


const app = express();
const PORT = process.env.PORT || 5000;

// ルートミドルウェアの設定
app.use('/api/devices', deviceRoutes);

//  ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

//ルートハンドラー
app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
