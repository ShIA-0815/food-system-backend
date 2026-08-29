// utils/lineNotifier.js
const { messagingApi } = require('@line/bot-sdk');

// 💡 v8以降の新しいクライアント初期化方法
const client = new messagingApi.MessagingApiClient({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

// 指定した lineUserId 宛にメッセージを送信する関数
exports.sendExpirationNotice = async (lineUserId, foodName, daysLeft) => {
    let messageText = '';
    if (daysLeft === 0) {
        messageText = `⚠️【本日賞味期限】\n「${foodName}」の賞味期限が今日までです！早めに消費しましょう！`;
    } else {
        messageText = `🔔【賞味期限のお知らせ】\n「${foodName}」の賞味期限まであと ${daysLeft} 日です！`;
    }

    try {
        // 💡 v8以降の新しい Push メッセージ送信方法
        await client.pushMessage({
            to: lineUserId,
            messages: [{ type: 'text', text: messageText }]
        });
        console.log(`Notification sent to ${lineUserId} for ${foodName}`);
    } catch (error) {
        console.error('Push notification error:', error);
    }
};