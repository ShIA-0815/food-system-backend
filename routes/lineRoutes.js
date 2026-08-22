const express = require('express');
const router = express.Router();
const line = require('@line/bot-sdk');
const User = require('../models/User');

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

// LINEからのメッセージ受信用
router.post('/webhook', line.middleware(config), async (req, res) => {
    try {
        const events = req.body.events;
        await Promise.all(events.map(handleEvent));
        res.status(200).send('OK');
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
});

async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    const userText = event.message.text.trim();
    const lineUserId = event.source.userId;

    // 送られてきたテキストが4桁の数字（連携コード）か判定
    if (/^\d{4}$/.test(userText)) {
        // DBからその連携コードを持つFirebaseユーザーを検索してLINE IDを保存
        // const user = await User.findOneAndUpdate({ linkCode: userText }, { lineUserId: lineUserId });

        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `連携コード「${userText}」を受け取りました！アカウント連携を完了します。`
        });
    }

    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'アプリ画面に表示されている4桁の連携コードを送信してください!'
    });
}

module.exports = router;