const cron = require('node-cron');
const Food = require('../models/Food');
const sendLineMessage = require('../utils/lineNotifier');

// 毎日 朝 8:00 に自動実行されるスケジュール設定
cron.schedule('0 8 * * *', async () => {
    console.log('賞味期限をチェックしています．．．');

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const foods = await Food.find({});

        for (const food of foods) {
            if (!food.expiration_date) continue;

            const expDate = new Date(food.expiration_date);
            expDate.setHours(0, 0, 0, 0);

            // 賞味期限までの残り日数
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // ユーザーが設定した「通知したいタイミング（notifyDaysBefore）」と一致したら通知
            if (diffDays === food.notifyDaysBefore) {
                const msg = `【賞味期限のお知らせ】\n「${food.food_name}」の賞味期限まであと ${diffDays} 日です！（期限: ${food.expiration_date}）`;

                // 💡 ユーザーのLINE User ID宛てに送信（※要LINE ID連携）
                if (food.lineUserId) {
                    await sendLineMessage(food.lineUserId, msg);
                }
            }
        }
    } catch (error) {
        console.error('Cron実行エラー:', error);
    }
});