const fs = require('fs');
const path = 'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\lib\\auth.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('passwordHash: null,', '');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed lib/auth.ts');
