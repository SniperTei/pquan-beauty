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
}

module.exports = new UserController(); 