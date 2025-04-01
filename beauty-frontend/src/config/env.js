/**
 * 环境配置文件
 * 用于管理不同环境下的配置参数
 */

// 获取当前环境 - 使用 import.meta.env 替代 process.env
const env = import.meta.env.MODE || 'development';

// 配置对象
const config = {
  // 当前环境
  env,
  
  // 是否为开发环境
  isDev: env === 'development',
  
  // 是否为测试环境
  isTest: env === 'test',
  
  // 是否为生产环境
  isProd: env === 'production',
  
  // API基础URL - 使用 import.meta.env 替代 process.env
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:8080',
  
  // 请求超时时间
  timeout: 15000,
  
  // 是否启用Mock数据
  mockEnabled: env === 'development',
  
  // 系统标题 - 使用 import.meta.env 替代 process.env
  title: import.meta.env.VITE_APP_TITLE || '美容管理系统'
};

export default config; 