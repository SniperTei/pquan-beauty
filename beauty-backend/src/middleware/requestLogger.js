const logger = require('morgan');

// 自定义日志格式
const loggerFormat = (tokens, req, res) => {
  const logObject = {
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: `${tokens['response-time'](req, res)} ms`,
    request: {
      body: req.body,
      query: req.query
    },
    response: res.locals.responseBody
  };

  return JSON.stringify(logObject, null, 2);
};

// 响应体捕获中间件
const responseCapture = (req, res, next) => {
  const originalSend = res.json;
  
  res.json = function(body) {
    res.locals.responseBody = body;
    return originalSend.call(this, body);
  };
  
  next();
};

module.exports = {
  requestLogger: logger(loggerFormat),
  responseCapture
}; 