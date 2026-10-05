// npm run dev сам поставит зависимости при первом запуске
const fs = require('fs');
const { execSync } = require('child_process');
if (!fs.existsSync(__dirname + '/../node_modules/vite')) {
  console.log('Первый запуск: устанавливаю зависимости…');
  execSync('npm install', { stdio: 'inherit', cwd: __dirname + '/..' });
}
