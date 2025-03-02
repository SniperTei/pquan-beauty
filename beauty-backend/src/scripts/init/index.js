const path = require('path');
const fs = require('fs').promises;

async function runInitScripts() {
  try {
    // 获取所有初始化脚本
    const files = await fs.readdir(__dirname);
    const scriptFiles = files.filter(file => 
      file !== 'index.js' && file.endsWith('.js')
    );

    // 按顺序执行所有初始化脚本
    for (const file of scriptFiles) {
      console.log(`Running init script: ${file}`);
      require(path.join(__dirname, file));
      console.log(`Completed init script: ${file}\n`);
    }
  } catch (error) {
    console.error('Error running init scripts:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runInitScripts();
} 