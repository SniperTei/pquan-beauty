require('dotenv').config({ path: '.env.development' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/userModel');
const config = require('../../config');

async function createAdminUser() {
  try {
    // 连接数据库
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('Connected to MongoDB');

    // 检查 admin 用户是否已存在
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // 创建密码哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('zheng0104', salt);

    // 创建 admin 用户
    const adminUser = new User({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      isAdmin: true,
      isActive: true,
      mobile: '13800138000'
    });

    await adminUser.save();
    console.log('Admin user created successfully');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser(); 