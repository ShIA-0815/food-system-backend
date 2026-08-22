const Food = require('../models/Food');

// 食材の保存（アップロード）
exports.uploadFood = async (req, res) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({
                ok: false,
                message: 'User ID not found'
            })
        }

        const foodName = req.body.foodName || 'unknown';
        const weight = req.body.weight ? parseInt(req.body.weight) : null;
        const expirationDate = req.body.expiryDate || null;
        const notifyDaysBefore = req.body.notifyDaysBefore ? parseInt(req.body.notifyDaysBefore) : 1;
        const imagePath = req.file ? req.file.path : '';

        console.log(`receive data-name: ${foodName}, Weight: ${weight}, Exp: ${expirationDate}, Path: ${imagePath}, userId: ${userId}`);

        const newFood = new Food({
            userId: userId,
            food_name: foodName,
            weight: weight,
            image_path: imagePath,
            expiration_date: expirationDate,
            notifyDaysBefore: notifyDaysBefore
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
        const userId = req.user?.uid;
        
        if (!userId) {
            return res.status(401).json({ ok: false, message: 'User ID not found' });
        }

        const sortBy = req.query.sort || 'expiry';

        let sortOption = {};

        if (sortBy === 'created') {
            sortOption = {created_at: -1};
        } else if (sortBy === 'name') {
            sortOption = { food_name: 1 };
        } else {
            sortOption = { expiration_date: 1 };
        }
        const foods = await Food.find({ userId: userId }).sort(sortOption);
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
        const userId = req.user.uid;
        await Food.deleteMany({ userId: userId });
        res.json({ message: "All reset" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};