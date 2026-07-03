const multer = require('multer');
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// uploadされた写真の保存先（今は仮で自分のPC直下）
const myStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'C:/food-images/');
    },

    //filenameがタイムスタンプと一緒に管理されるように
    filename: (req, file, cb) => {
        const foodName = req.body.foodName || 'unknown';

        const uniqueSuffix = Date.now();

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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`number of Port: ${PORT}`);
});