const userService = require('../services/userService');

class UserController {
  async register(req, res) {
    try {
      const userData = req.body;
      const user = await userService.register(userData);
      res.success(user, '用户注册成功');
    } catch (error) {
      res.error(400, 'A00100', error.message);
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await userService.login(username, password);
      res.success(user, '登录成功');
    } catch (error) {
      res.error(401, 'A00101', error.message);
    }
  }

  async getProfile(req, res) {
    try {
      const user = await userService.getUserById(req.user.userId);
      res.success(user, '获取用户信息成功');
    } catch (error) {
      res.error(400, 'A00102', error.message);
    }
  }

  async updateProfile(req, res) {
    try {
      const updatedUser = await userService.updateUser(req.user.userId, req.body);
      res.success(updatedUser, '更新用户信息成功');
    } catch (error) {
      res.error(400, 'A00103', error.message);
    }
  }

  async initiatePasswordReset(req, res) {
    try {
      const { username } = req.body;
      const resetToken = await userService.initiatePasswordReset(username);
      
      // 在实际应用中，这里应该发送邮件给用户
      res.json({
        success: true,
        message: '密码重置链接已发送',
        resetToken // 在实际应用中不应直接返回给前端
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { resetToken, newPassword } = req.body;
      const result = await userService.resetPassword(resetToken, newPassword);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();