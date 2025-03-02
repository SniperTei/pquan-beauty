const jwt = require('jsonwebtoken');
const config = require('../config');

const authHandler = (req, res, next) => {
  // 从请求头获取 token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.error(401, 'A00401', '未提供认证令牌');
  }

  // 验证 token 格式
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.error(401, 'A00402', '认证令牌格式错误');
  }

  const token = parts[1];

  try {
    // 验证 token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 将用户信息添加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.error(401, 'A00403', '认证令牌已过期');
    }
    return res.error(401, 'A00404', '无效的认证令牌');
  }
};

module.exports = authHandler; 