const fs = require('fs');
const file = 'C:/Users/ayush/Downloads/Projects/UFC GYM/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/className=\{\r?\n\s*elative flex items-center gap-4 px-4 py-3\.5 rounded-2xl transition-all duration-300 group \$ \{/g, 'className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${');

content = content.replace(/<item\.icon className=\{\`w-5 h-5 flex-shrink-0 \`\$ \{/g, '<item.icon className={`w-5 h-5 flex-shrink-0 ${');

fs.writeFileSync(file, content);