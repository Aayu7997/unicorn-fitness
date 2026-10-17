const fs = require('fs');
const p = 'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\app\\signup\\page.tsx';

if (fs.existsSync(p)) {
  let code = fs.readFileSync(p, 'utf8');
  const target = `<button
                    type="button"
                    className="py-3 px-4 border border-border rounded-xl hover:border-accent/50 transition-colors flex items-center justify-center gap-2"
                  >`;
  const replacement = `<button
                    type="button"
                    onClick={() => window.location.href = '/api/auth/google'}
                    className="py-3 px-4 border border-border rounded-xl hover:border-accent/50 transition-colors flex items-center justify-center gap-2"
                  >`;
  if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync(p, code, 'utf8');
    console.log(`Updated ${p}`);
  } else {
    console.log(`Target not found in ${p}`);
  }
}
