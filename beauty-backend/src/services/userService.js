const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

class UserService {
  async register(userData) {
    // 检查用户是否已存在
    const existingUser = await User.findOne({ username: userData.username });
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    // 创建新用户
    const user = await User.create(userData);
    
    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async login(username, password) {
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('用户名或密码错误');
    }

    // 生成 token
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        isAdmin: user.isAdmin 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // 返回用户信息和token（不包含密码）
    const { password: _, ...userWithoutPassword } = user.toObject();
    return {
      token,
      user: userWithoutPassword
    };
  }

  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async updateUser(userId, updateData) {
    // 不允许更新敏感字段
    delete updateData.password;
    delete updateData.isAdmin;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('用户不存在');
    }

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}

module.exports = new UserService(); 