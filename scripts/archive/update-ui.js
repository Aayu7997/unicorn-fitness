const fs = require('fs');
const files = [
  'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\app\\signin\\page.tsx',
  'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\app\\signup\\page.tsx'
];

for (const p of files) {
  if (fs.existsSync(p)) {
    let code = fs.readFileSync(p, 'utf8');
    const target = `<button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 border border-accent/20 rounded-lg hover:bg-accent/5 transition-colors text-foreground"
                >`;
    const replacement = `<button
                  type="button"
                  onClick={() => window.location.href = '/api/auth/google'}
                  className="flex items-center justify-center gap-2 py-3 border border-accent/20 rounded-lg hover:bg-accent/5 transition-colors text-foreground"
                >`;
    if (code.includes(target)) {
      code = code.replace(target, replacement);
      fs.writeFileSync(p, code, 'utf8');
      console.log(`Updated ${p}`);
    } else {
      console.log(`Target not found in ${p}`);
    }
  }
}
