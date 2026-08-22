const express = require('express');
const router = express.Router();
const { messagingApi, middleware } = require('@line/bot-sdk');
const User = require('../models/User');

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new messagingApi.MessagingApiClient({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

// LINEからのメッセージ受信用
router.post('/webhook', middleware(config), async (req, res) => {
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
    const lineUserId = event.source.userId; // LINE側のユーザーID

    // 💡 4桁の数字が送られてきた場合（連携コード判定）
    if (/^\d{4}$/.test(userText)) {
        try {
            // DBからその連携コードを持つユーザーを探して lineUserId を保存
            const user = await User.findOneAndUpdate(
                { linkCode: userText },
                { lineUserId: lineUserId, linkCode: null } // 連携後はコードを消去
            );

            if (user) {
                return client.replyMessage({
                    replyToken: event.replyToken,
                    messages: [{
                        type: 'text',
                        text: 'アカウントの連携が完了しました。賞味期限の通知をここでお知らせします。'
                    }]
                });
            } else {
                return client.replyMessage({
                    replyToken: event.replyToken,
                    messages: [{
                        type: 'text',
                        text: '連携コードが見つからないか、期限が切れています。Web画面で再発行してください。'
                    }]
                });
            }
        } catch (error) {
            console.error('連携エラー:', error);
        }
    }

    // 通常のメッセージ返信
    return client.replyMessage({
        replyToken: event.replyToken,
        messages: [{
            type: 'text',
            text: `受信しました: ${userText}\n\n連携を行う場合は、Web画面に表示されている4桁のコードを送信してください!`
        }]
    });
}

module.exports = router;