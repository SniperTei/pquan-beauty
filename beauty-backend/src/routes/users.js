const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authHandler = require('../middleware/authHandler');

// 注册路由
router.post('/register', userController.register.bind(userController));

// 登录路由
router.post('/login', userController.login.bind(userController));

// 需要认证的路由
router.get('/profile', authHandler, userController.getProfile.bind(userController));
router.put('/profile', authHandler, userController.updateProfile.bind(userController));

module.exports = router; 