const User = require('../models/User');

exports.generateLinkCode = async (req, res) => {
    try {
        const firebaseUid = req.user.uid;

        // 4桁のランダムな数字コードを生成
        const linkCode = Math.floor(1000 + Math.random() * 9000).toString();

        // 該当のユーザーに linkCode のみを保存
        const user = await User.findOneAndUpdate(
            { firebaseUid: firebaseUid },
            { linkCode: linkCode },
            { returnDocument: 'after', upsert: true }
        );

        res.status(200).json({ ok: true, linkCode: user.linkCode });
    } catch (error) {
        console.error('Code generation error:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
};