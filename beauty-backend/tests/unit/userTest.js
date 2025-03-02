const request = require('supertest');
const app = require('../../app');
const User = require('../../src/models/userModel');
const mongoose = require('mongoose');
const config = require('../../src/config/config');

describe('用户认证接口测试', () => {
  beforeAll(async () => {
    // 连接测试数据库
    await mongoose.connect(config.mongodb.uri);
  });

  afterAll(async () => {
    // 清理数据库并关闭连接
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // 每个测试前清理用户数据
    await User.deleteMany({});
  });

  describe('POST /api/v1/users/register', () => {
    const validUser = {
      username: 'testuser',
      password: 'Password123',
      email: 'test@example.com'
    };

    it('应该成功注册新用户', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send(validUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('username', validUser.username);
      expect(response.body.data).toHaveProperty('email', validUser.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('重复用户名应该注册失败', async () => {
      // 先创建一个用户
      await request(app)
        .post('/api/v1/users/register')
        .send(validUser);

      // 尝试创建同名用户
      const response = await request(app)
        .post('/api/v1/users/register')
        .send(validUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('用户名已存在');
    });

    it('缺少必要字段应该注册失败', async () => {
      const invalidUser = {
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/users/login', () => {
    const testUser = {
      username: 'testuser',
      password: 'Password123',
      email: 'test@example.com'
    };

    beforeEach(async () => {
      // 每个测试前创建测试用户
      await request(app)
        .post('/api/v1/users/register')
        .send(testUser);
    });

    it('使用正确凭据应该登录成功', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('username', testUser.username);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('使用错误的密码应该登录失败', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('用户名或密码错误');
    });

    it('使用不存在的用户名应该登录失败', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          username: 'nonexistentuser',
          password: 'anypassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('用户名或密码错误');
    });
  });
});
