const fs = require('fs');
const p = 'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\prisma\\schema.prisma';
let content = fs.readFileSync(p, 'utf8');
content = content.replace('passwordHash       String', `passwordHash       String?\n  authProvider       String    @default("local")\n  googleId           String?   @unique`);
fs.writeFileSync(p, content, 'utf8');
console.log('Schema updated successfully.');
