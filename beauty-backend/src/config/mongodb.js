function getMongoUri() {
  const { 
    MONGODB_HOST, 
    MONGODB_PORT, 
    MONGODB_DATABASE,
    MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD 
  } = process.env;
  
  if (process.env.NODE_ENV === 'production') {
    return process.env.MONGODB_URI;
  }

  // 如果设置了用户名和密码，添加到连接字符串中
  if (MONGO_INITDB_ROOT_USERNAME && MONGO_INITDB_ROOT_PASSWORD) {
    return `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=admin`;
  }
  
  return `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
}

module.exports = {
  uri: getMongoUri(),
  options: {
    serverSelectionTimeoutMS: 5000, // 超时时间设置为 5 秒
    socketTimeoutMS: 45000, // Socket 超时时间
    connectTimeoutMS: 10000, // 连接超时时间
  }
}; 