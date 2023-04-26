const fs = require('fs');
let count = 1, countFilePath = './public/build/count.txt';

function generateVersion() {
  // 获取当前日期
  const date = new Date().toISOString().substr(0, 10).replace(/-/g, '');
  // 检查是否创建了count.txt 文件
  if (fs.existsSync(countFilePath)) {
    // 获取打包次数
    count = parseInt(fs.readFileSync(countFilePath));
    if (process.env.npm_lifecycle_event === 'build') {
      count++;
    }
    if (isNaN(parseInt(count)) || count === 'NaN') {
      fs.writeFileSync(countFilePath, '0');
      count = parseInt(fs.readFileSync(countFilePath));
      if (process.env.npm_lifecycle_event === 'build') {
        count++;
      }
    }
  }
  fs.writeFileSync(countFilePath, count.toString());
  return {date, count}
}

module.exports = generateVersion;
