const multer = require('multer');
const express = require('express');
const app = express();
const path = require('path');

// uploadされた写真の保存先（今は仮で自分のPC直下）
const myStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'C:/food-images/');
    },

    //filenameがタイムスタンプと一緒に管理されるように
    filename: (req, file, cb) => {
        const foodName = req.body.foodName || 'unknown';

        const uniqueSuffix = DataTransfer.now();

        cb(null, `${foodName}_${uniqueSuffix}.png`);
    }
});

const upload = multer({ storage: myStorage });

// 送られてきたファイルの受信
app.post('http://localhost:3000/api/upload-food', upload.single('photo'), (req, res) => {
    console.log(`originalname: ${req.file.originalname}`);
    console.log(`path: ${req.file.path}`);
    res.json({ok : true, message : "received image"});
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`number of Port: ${PORT}`);
});