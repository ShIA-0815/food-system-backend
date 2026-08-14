const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const upload = require('../config/cloudinary');
const checkAuth = require('../middlewares/authMiddleware');

// POST: 食材アップロード
router.post('/upload-food', checkAuth, upload.single('image'), foodController.uploadFood);

// GET: 食材一覧取得
router.get('/get-foods', foodController.getFoods);

// POST: リセット
router.post('/reset', foodController.resetFoods);

module.exports = router;