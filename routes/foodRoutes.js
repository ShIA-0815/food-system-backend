const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const upload = require('../config/cloudinary');
const checkAuth = require('../middlewares/authMiddleware');

// POST: 食材アップロード
router.post('/upload-food', checkAuth, upload.single('image'), foodController.uploadFood);

// GET: 食材一覧取得
router.get('/get-foods', checkAuth, foodController.getFoods);

// POST: リセット
router.post('/reset', checkAuth, foodController.resetFoods);
// DELETE: 食材登録解除
router.delete('/delete-food/:id', checkAuth, foodController.deleteFood);

router.get('/check-expirations', foodController.checkAndNotifyExpirations);

module.exports = router;