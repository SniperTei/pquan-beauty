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
  
  // 构建带认证的连接字符串
  const credentials = `${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@`;
  return `mongodb://${credentials}${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=admin`;
}

module.exports = {
  uri: getMongoUri(),
  options: {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000
  }
}; 