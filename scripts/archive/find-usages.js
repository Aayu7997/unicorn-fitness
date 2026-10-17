const fs = require('fs');
const path = require('path');
const files = [
  'app/api/admin/change-password/route.ts',
  'app/api/admin/members/route.ts',
  'app/api/admin/members/[id]/route.ts',
  'app/api/user/profile/password/route.ts'
];
files.forEach(f => {
  const p = path.join('C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM', f);
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    lines.forEach((l, i) => {
      if (l.includes('passwordHash')) {
        console.log(`[${f}] L${i+1}: ${l.trim()}`);
      }
    });
  }
});
