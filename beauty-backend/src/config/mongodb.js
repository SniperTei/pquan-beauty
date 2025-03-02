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
  
  return `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
}

module.exports = {
  uri: getMongoUri(),
}; 