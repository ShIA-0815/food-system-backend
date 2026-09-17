const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: { type: String, required: true, unique: true }, // Firebaseのuid
    lineUserId: { type: String, default: null },           // LINEのユーザーID
    linkCode: { type: String, default: null },             // 連携用の4桁コード
    created_at: { type: Date, default: Date.now }
}, {
    autoIndex: false
});

module.exports = mongoose.model('User', userSchema);