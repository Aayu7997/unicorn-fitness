const fs = require('fs');
const path = 'C:/Users/ayush/Downloads/Projects/UFC GYM/app/signin/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = 'className="w-full pl-11 pr-11 py-3 bg-background border border-accent/20 rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"\n                    placeholder=""';

const replaceStr = 'className="w-full pl-11 pr-11 py-3 bg-background border border-accent/20 rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"\n                    placeholder="\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022\\u2022"';

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed');
