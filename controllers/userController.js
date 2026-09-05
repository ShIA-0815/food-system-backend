const User = require('../models/User');

exports.generateLinkCode = async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ ok: false, message: 'User ID not found' });
        }

        // ランダムな4桁の数字（例: "4821"）を生成
        const linkCode = Math.floor(1000 + Math.random() * 9000).toString();

        // 既存ユーザーを更新、いなければ新規作成（upsert）
        const user = await User.findOneAndUpdate({ linkCode }, { lineUserId }, { returnDocument: 'after' });

        res.json({
            ok: true,
            linkCode: user.linkCode,
            lineUserId: user.lineUserId // 連携済みかどうかも一緒に返す
        });
    } catch (error) {
        console.error('Code generation error:', error);
        res.status(500).json({ ok: false, message: 'Server error' });
    }
};