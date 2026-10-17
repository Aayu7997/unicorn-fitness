const fs = require('fs');
const p = 'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\app\\signup\\page.tsx';
if (fs.existsSync(p)) {
  const code = fs.readFileSync(p, 'utf8');
  console.log(code.substring(code.indexOf('{/* Social Login */}'), code.indexOf('{/* Social Login */}') + 1500));
}
