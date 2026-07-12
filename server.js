const multer = require('multer');
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose'); // mongoDB(外部DB)
const cloudinary = require('cloudinary').v2; // Cloudinary(外部の画像保存用クラウド)
const {CloudinaryStorage} = require('multer-storage-cloudinary');

// DBのURLに自動で切り替える
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.log('MongoDB connection error:', err));

const foodSchema = new mongoose.Schema({
    food_name: { type: String, required: true },
    weight: { type: Number, default: null },
    image_path: { type: String, required: true },
    expiration_date: { type: String, default: null },
    created_at: { type: Date, default: Date.now }
});

const Food = mongoose.model('Food', foodSchema);

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
// pool.connect(async (err, client, release) => {
//     if (err) {
//         return console.error('failed to connect database:', err.stack);
//     }
//     console.log('connect database successfully');
    
//     // テーブルの自動作成
//     try {
//         await client.query(`
//             CREATE TABLE IF NOT EXISTS foods (
//                 id SERIAL PRIMARY KEY,
//                 food_name TEXT NOT NULL,
//                 weight INTEGER,
//                 image_path TEXT NOT NULL,
//                 expiration_date DATE,
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//             );
//         `);
//         console.log('created table');
//     } catch (tableErr) {
//         console.error('failed to create table:', tableErr.stack);
//     } finally {
//         release();
//     }
// });

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
        const expirationDate = req.body.expiryDate || null;
        const imagePath = req.file ? req.file.path : '';

        console.log(`receive data-name: ${foodName}, Weight: ${weight}, Exp: ${expirationDate}, Path: ${imagePath}`);

        const newFood = new Food({
            food_name: foodName,
            weight: weight,
            image_path: imagePath,
            expiration_date: expirationDate
        });

        const savedFood = await newFood.save();

        console.log('Saved to MongoDB:', savedFood);

        res.json({
            ok: true,
            message: "Saved successfully",
            data: savedFood
        });

    } catch (error) {
        console.error('saved-error:', error.stack);
        res.status(500).json({ ok: false, message: "server error" });
    }
});

app.get('/api/get-foods', async (req, res) => {
    try {
        const foods = await Food.find().sort({ created_at: -1 });

        res.json({
            ok: true,
            data: foods
        });
    } catch (error) {
        console.error('failed to get foods:', error.stack);
        res.status(500).json({ ok: false, message: "server error" });
    }
});

