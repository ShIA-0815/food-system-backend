const multer = require('multer');
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreDB(Renderと結びついてるDB)
const cloudinary = require('cloudinary').v2; // Cloudinary(外部の画像保存用クラウド)
const {CloudinaryStorage} = require('multer-storage-cloudinary');

// DBのURLに自動で切り替える
const connectionString = process.env.DATABASE_URL || 'postgresql://food_db_pnir_user:JoBrkfDO8DYjORfLk3NWwMEfCEnoB9FL@dpg-d95f5aflk1mc73cisek0-a.singapore-postgres.render.com/food_db_pnir';

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// PORT開放
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`number of Port: ${PORT}`);
});

// 接続テストの実行
pool.connect(async (err, client, release) => {
    if (err) {
        return console.error('failed to connect database:', err.stack);
    }
    console.log('connect database successfully');
    
    // テーブルの自動作成
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS foods (
                id SERIAL PRIMARY KEY,
                food_name TEXT NOT NULL,
                weight INTEGER,
                image_path TEXT NOT NULL,
                expiration_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('created table');
    } catch (tableErr) {
        console.error('failed to create table:', tableErr.stack);
    } finally {
        release();
    }
});

// Cloudinaryの接続設定
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// uploadされた写真をCloudinaryに保存
const myStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads-images',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: (req, file) => {
            const foodName = req.body.foodName || 'unknown';
            const uniqueSuffix = Date.now(); 
            return `${foodName}_${uniqueSuffix}`;
        }
    }
});

const upload = multer({ storage: myStorage });

// 送られてきたファイルの受信
app.post('/api/upload-food', upload.single('image'), async (req, res) => {
    try {
        const foodName = req.body.foodName || 'unknown';
        const weight = req.body.weight ? parseInt(req.body.weight) : null;
        const expirationDate = req.body.expirationDate || null;
        const imagePath = req.file ? req.file.path : '';  // 保存されたファイルのパス（uploads/〇〇.png）

        console.log(`receive data-name: ${foodName}, Weight: ${weight}, Exp: ${expirationDate}, Path: ${imagePath}`);

        const queryText = 'INSERT INTO foods (food_name, weight, image_path, expiration_date) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [foodName, weight, imagePath, expirationDate];

        const result = await pool.query(queryText, values);

        console.log('Saved to Postgre:', result.rows[0]);

        res.json({
            ok: true,
            message: "Saved successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error('saved-error:', error.stack);
        res.status(500).json({ ok: false, message: "server error" });
    }
});

app.get('/api/get-foods', async (req, res) => {
    try {
        const queryText = 'SELECT * FROM foods ORDER BY created_at DESC';
        const result = await pool.query(queryText);

        res.json({
            ok: true,
            data: result.rows
        });
    } catch (error) {
        console.error('failed to get foods:', error.stack);
        res.status(500).json({ ok: false, message: "server error" });
    }
});

