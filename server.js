const multer = require('multer');
const express = require('express');
const app = express();

// uploadされた写真の保存先（今は仮で自分のPC直下）
const upload = multer({ dest: 'C:/food-images/' });

// 送られてきたファイルの受信
app.post('/api/upload-food', upload.single('image'), (req, res) => {
    console.log(`originalname: ${req.file.originalname}`);
    console.log(`path: ${req.file.path}`);
    res.json({ok : true, message : "received image"});
})