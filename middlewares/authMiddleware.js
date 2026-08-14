const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// 認証システム
const checkAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Headerにトークンがない、または Bearer から始まらない場合は弾く
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ ok: false, message: '認証トークンがありません' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Google側で検閲
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('トークン検証エラー:', error.message);
        return res.status(403).json({ ok: false, message: '不正なトークンです' });
    }
};

module.exports = checkAuth;