const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

if (getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

// 認証システム
const checkAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Headerにトークンがない、または Bearer から始まらない場合は弾く
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ ok: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Google側で検閲
        const decodedToken = await getAuth().verifyIdToken(token);

        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('トークン検証エラー:', error.message);
        return res.status(403).json({ ok: false, message: 'Invalid token' });
    }
};

module.exports = checkAuth;