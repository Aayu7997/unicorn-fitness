const fs = require('fs');
const p = 'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\app\\signin\\page.tsx';
if (fs.existsSync(p)) {
  const code = fs.readFileSync(p, 'utf8');
  console.log(code.substring(code.indexOf('type="submit"'), code.indexOf('type="submit"') + 1500));
}
