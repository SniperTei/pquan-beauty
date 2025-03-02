const ApiResponse = require('../utils/responseUtil');
// 使用moment
const moment = require('moment');

// 格式化时间戳
const formatTimestamp = () => format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');

// 扩展 Response 对象
const responseHandler = (req, res, next) => {
  // 成功响应
  res.success = function(data = null, msg = 'Success') {
    const response = {
      code: '000000',
      statusCode: 200,
      msg,
      data,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss.SSS')
    };
    res.json(response);
  };

  // 错误响应
  res.error = function(statusCode = 500, code = 'A00001', msg = 'Internal Server Error') {
    const response = {
      code,
      statusCode,
      msg,
      data: null,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss.SSS')
    };
    res.status(statusCode).json(response);
  };

  next();
};

module.exports = responseHandler; 