const Food = require('../models/Food');

// 食材の保存（アップロード）
exports.uploadFood = async (req, res) => {
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
};

// 食材一覧の取得
exports.getFoods = async (req, res) => {
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
};

// 全データのリセット
exports.resetFoods = async (req, res) => {
    try {
        await Food.deleteMany({});
        res.json({ message: "All reset" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};