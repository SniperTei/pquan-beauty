const path = require('path');
const fs = require('fs').promises;

async function runMigrations(direction = 'up') {
  try {
    const versionsDir = path.join(__dirname, 'versions');
    const files = await fs.readdir(versionsDir);
    
    // 按版本号排序
    const migrationFiles = files
      .filter(file => file.endsWith('.js'))
      .sort();

    if (direction === 'down') {
      migrationFiles.reverse();
    }

    // 执行迁移
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(versionsDir, file));
      await migration[direction]();
      console.log(`Completed migration: ${file}\n`);
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// 处理命令行参数
const direction = process.argv.includes('--down') ? 'down' : 'up';

if (require.main === module) {
  runMigrations(direction);
} 