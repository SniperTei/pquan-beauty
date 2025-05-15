const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../../config');

function buildMongorestoreCommand(backupPath) {
  const { 
    MONGODB_HOST = 'localhost',
    MONGODB_PORT = '27017',
    MONGODB_DATABASE,
    MONGODB_USERNAME,
    MONGODB_PASSWORD 
  } = process.env;

  let command = `mongorestore --host ${MONGODB_HOST} --port ${MONGODB_PORT}`;

  if (MONGODB_DATABASE) {
    command += ` --db ${MONGODB_DATABASE}`;
  }

  if (MONGODB_USERNAME && MONGODB_PASSWORD) {
    command += ` --username ${MONGODB_USERNAME} --password ${MONGODB_PASSWORD} --authenticationDatabase admin`;
  }

  // 检查备份路径是否包含数据库名称目录
  const dbPath = path.join(backupPath, MONGODB_DATABASE || '');
  if (fs.existsSync(dbPath)) {
    backupPath = dbPath;
  }

  command += ` --drop ${backupPath}`;

  return command;
}

async function restore(backupPath) {
  try {
    // 确保备份路径是绝对路径
    const absolutePath = path.resolve(process.cwd(), backupPath);
    
    // 检查备份目录是否存在
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`备份目录不存在: ${absolutePath}`);
    }

    console.log('开始恢复数据库...');
    console.log(`从备份恢复: ${absolutePath}`);

    return new Promise((resolve, reject) => {
      exec(buildMongorestoreCommand(absolutePath), (error, stdout, stderr) => {
        if (error) {
          console.error('恢复失败:', error.message);
          reject(error);
          return;
        }

        if (stderr) {
          // 过滤掉废弃警告信息
          const realErrors = stderr.split('\n').filter(line => 
            !line.includes('deprecated') && 
            line.trim() !== ''
          );
          
          if (realErrors.length > 0) {
            console.warn('恢复警告:', realErrors.join('\n'));
          }
        }

        if (stdout) {
          console.log('恢复输出:', stdout);
        }

        console.log('恢复完成!');
        resolve();
      });
    });
  } catch (error) {
    console.error('恢复准备失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const backupPath = process.argv[2];
  if (!backupPath) {
    console.error('请提供备份路径');
    console.error('使用方法: npm run restore:db <备份路径>');
    console.error('示例: npm run restore:db backups/backup_20240511_171655');
    process.exit(1);
  }

  restore(backupPath).catch(error => {
    console.error('恢复失败:', error.message);
    process.exit(1);
  });
}

module.exports = restore; 