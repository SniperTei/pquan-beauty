const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authHandler = require('../middleware/authHandler');

// 注册路由
router.post('/register', userController.register.bind(userController));

// 登录路由
router.post('/login', userController.login.bind(userController));

// 密码重置路由
router.post('/forgot-password', userController.initiatePasswordReset.bind(userController));
router.post('/reset-password', userController.resetPassword.bind(userController));

module.exports = router;