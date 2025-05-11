const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const config = require('../../config');

// 创建备份目录
const backupDir = path.join(__dirname, '../../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// 生成备份文件名
const timestamp = moment().format('YYYYMMDD_HHmmss');
const backupPath = path.join(backupDir, `backup_${timestamp}`);

// 构建mongodump命令
function buildMongodumpCommand() {
  const { 
    MONGODB_HOST = 'localhost',
    MONGODB_PORT = '27017',
    MONGODB_DATABASE,
    MONGODB_USERNAME,
    MONGODB_PASSWORD 
  } = process.env;

  let command = `mongodump --host ${MONGODB_HOST} --port ${MONGODB_PORT}`;

  if (MONGODB_DATABASE) {
    command += ` --db ${MONGODB_DATABASE}`;
  }

  if (MONGODB_USERNAME && MONGODB_PASSWORD) {
    command += ` --username ${MONGODB_USERNAME} --password ${MONGODB_PASSWORD} --authenticationDatabase admin`;
  }

  command += ` --out ${backupPath}`;

  return command;
}

// 执行备份
async function backup() {
  return new Promise((resolve, reject) => {
    console.log('开始备份数据库...');
    console.log(`备份路径: ${backupPath}`);

    exec(buildMongodumpCommand(), (error, stdout, stderr) => {
      if (error) {
        console.error('备份失败:', error);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn('备份警告:', stderr);
      }

      console.log('备份完成!');
      console.log(`备份文件保存在: ${backupPath}`);
      resolve(backupPath);
    });
  });
}

// 如果直接运行此脚本
if (require.main === module) {
  backup().catch(error => {
    console.error('备份失败:', error);
    process.exit(1);
  });
}

module.exports = backup; 