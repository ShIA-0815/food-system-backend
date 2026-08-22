const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const checkAuth = require('../middleware/checkAuth'); // トークン検証用ミドルウェア

router.post('/generate-link-code', checkAuth, userController.generateLinkCode);

module.exports = router;