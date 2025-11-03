// src/index.js
const express = require('express');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api.routes');
const { initDatabase } = require('./database'); // ĐÚNG

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// KHỞI TẠO DB TRƯỚC
initDatabase(); // PHẢI CÓ DÒNG NÀY

// Routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});