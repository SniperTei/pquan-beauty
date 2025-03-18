var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
const config = require(path.join(__dirname, 'src/config'));
const { requestLogger, responseCapture } = require('./src/middleware/requestLogger');
const responseHandler = require('./src/middleware/responseHandler');

// 连接数据库
mongoose.connect(config.mongodb.uri, config.mongodb.options)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

var usersRouter = require('./src/routes/users');
var customersRouter = require('./src/routes/customers');
var uploadRouter = require('./src/routes/upload');
var dictsRouter = require('./src/routes/dicts');

var app = express();

// 请求日志中间件
app.use(responseCapture);
app.use(requestLogger);

// 在所有路由之前添加响应处理中间件
app.use(responseHandler);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 添加静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/customers', customersRouter);
app.use('/api/v1/common/upload', uploadRouter);
app.use('/api/v1/common/dicts', dictsRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  const statusCode = err.status || 500;
  const errorCode = err.code || 'A00001';
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  
  res.error(statusCode, errorCode, message);
});

module.exports = app;
