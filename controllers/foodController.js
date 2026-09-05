const Food = require('../models/Food');
const User = require('../models/User');
const { sendExpirationNotice } = require('../utils/lineNotifier');

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
        const notifyDaysBefore = Number(req.body.notifyDaysBefore) ?? 1;
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

exports.deleteFood = async (req, res) => {
    try {
        const { id } = req.params;

        // 該当のIDの食材をDBから削除
        const deletedFood = await Food.findByIdAndDelete(id);

        if (!deletedFood) {
            return res.status(404).json({ message: 'target of food not found' });
        }

        res.status(200).json({ message: 'complete delete', id });
    } catch (error) {
        console.error('Delete food error:', error);
        res.status(500).json({ message: 'failed to delete', error: error.message });
    }
};

exports.checkAndNotifyExpirations = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 全食材データを取得
        const foods = await Food.find({});

        for (const food of foods) {
            if (!food.expiration_date) continue;

            const expDate = new Date(food.expiration_date);
            expDate.setHours(0, 0, 0, 0);

            // 残り日数を計算
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // 設定された通知日数（notifyDaysBefore）と一致する場合
            if (diffDays === food.notifyDaysBefore) {
                // その食材の持ち主の LINE User ID を取得
                const user = await User.findOne({ userId: food.userId });
                if (user && user.lineUserId) {
                    await sendExpirationNotice(user.lineUserId, food.food_name, diffDays);
                }
            }
        }

        res.json({ ok: true, message: 'Expiration check completed' });
    } catch (error) {
        console.error('Check error:', error);
        res.status(500).json({ ok: false, message: 'Server error' });
    }
};