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
    // 打印加密后的密码
    console.log('加密后的密码:', userData.password);
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
    console.log('加密后的密码:', user.password);
    // 打印一下解密的密码
    const salt = await bcrypt.genSalt(10);
    const password1 = await bcrypt.hash(user.password, salt);
    console.log('解密后的密码:', password1);
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

  async initiatePasswordReset(username) {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 生成重置令牌
    const resetToken = jwt.sign(
      { userId: user._id },
      config.jwt.secret,
      { expiresIn: '1h' } // 重置令牌1小时内有效
    );

    // 保存重置令牌到用户记录
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1小时后过期
    await user.save();

    return resetToken;
  }

  async resetPassword(resetToken, newPassword) {
    // 验证重置令牌
    const decoded = jwt.verify(resetToken, config.jwt.secret);
    const user = await User.findOne({
      _id: decoded.userId,
      resetToken,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('重置令牌无效或已过期');
    }

    // 更新密码
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return { message: '密码重置成功' };
  }
}

module.exports = new UserService();