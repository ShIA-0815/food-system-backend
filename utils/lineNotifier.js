const line = require('@line/bot-sdk');

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

// 特定のユーザーにLINEメッセージを送る関数
const sendLineMessage = async (toUserId, messageText) => {
    try {
        await client.pushMessage(toUserId, {
            type: 'text',
            text: messageText,
        });
        console.log('LINE通知送信成功');
    } catch (error) {
        console.error('LINE通知エラー:', error);
    }
};

module.exports = sendLineMessage;