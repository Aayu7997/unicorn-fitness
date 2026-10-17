const fs = require('fs');
const path = require('path');
const p = path.join('C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM', 'app/api/auth/login/route.ts');
if (fs.existsSync(p)) {
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  lines.forEach((l, i) => {
    if (l.includes('passwordHash')) {
      console.log(`L${i+1}: ${l.trim()}`);
    }
  });
}
