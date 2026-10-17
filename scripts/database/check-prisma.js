const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\package.json', 'utf8'));
console.log(pkg.dependencies['@prisma/client']);
console.log(pkg.devDependencies['prisma']);
