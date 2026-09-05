const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const foodRoutes = require('./routes/foodRoutes');
const lineRoutes = require('./routes/lineRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// DB接続実行
connectDB();

// ミドルウェアの設定
app.use(cors());

app.use('/api/line', lineRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ルーティング適用 (/api/upload-food や /api/get-foods に繋がる)
app.use('/api/food', foodRoutes);
app.use('/api/user', userRoutes);


// PORT開放
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});