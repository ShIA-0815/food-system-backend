const multer = require('multer');
const express = require('express');
const app = express();
const path = require('path');

// uploadされた写真の保存先（今は仮で自分のPC直下）
const myStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'C:/food-images/');
    },

    filename: (req, file, cb) => {
        const foodName = req.body.foodName || 'unknown';

        const uniqueSuffix = DataTransfer.now();

        cb(null, `${foodName}_${uniqueSuffix}.png`);
    }
});

const upload = multer({ storage: myStorage });

// 送られてきたファイルの受信
app.post('/api/upload-food', upload.single('image'), (req, res) => {
    console.log(`originalname: ${req.file.originalname}`);
    console.log(`path: ${req.file.path}`);
    res.json({ok : true, message : "received image"});
})