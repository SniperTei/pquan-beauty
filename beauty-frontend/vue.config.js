const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  
  // 开发服务器配置
  devServer: {
    port: 8080,
    open: true,
    proxy: {
      // 代理所有/api开头的请求到目标服务器
      '/api': {
        target: 'http://localhost:3000', // 后端API服务器地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api' // 可以根据实际情况重写路径
        }
      }
    }
  },
  
  // 生产环境配置
  productionSourceMap: false, // 生产环境不生成source map
}); 