var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
const config = require(path.join(__dirname, 'src/config'));
const { requestLogger, responseCapture } = require('./src/middleware/requestLogger');
const responseHandler = require('./src/middleware/responseHandler');
const cors = require('cors');

// 创建 express 应用
const app = express();

// 请求日志中间件
app.use(responseCapture);
app.use(requestLogger);

// 添加CORS中间件
app.use(cors());

// 在所有路由之前添加响应处理中间件
app.use(responseHandler);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 添加静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由配置
var usersRouter = require('./src/routes/users');
var customersRouter = require('./src/routes/customers');
var uploadRouter = require('./src/routes/upload');
var dictsRouter = require('./src/routes/dicts');
var purchaseRecordsRouter = require('./src/routes/purchaseRecords');

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/customers', customersRouter);
app.use('/api/v1/common/upload', uploadRouter);
app.use('/api/v1/common/dicts', dictsRouter);
app.use('/api/v1/purchaseRecords', purchaseRecordsRouter);

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

// 数据库连接配置
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', false);

// 数据库连接函数
async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri, {
      ...config.mongodb.options,
      bufferCommands: false,
      autoIndex: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    setTimeout(connectDB, 5000);
  }
}

// 监听数据库连接事件
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, trying to reconnect...');
  connectDB();
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// 初始连接数据库
connectDB();

module.exports = app;
