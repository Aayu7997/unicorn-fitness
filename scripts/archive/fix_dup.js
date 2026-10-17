const fs = require('fs');
const path = require('path');

const tabsDir = path.join(__dirname, 'app', 'dashboard', 'tabs');
const files = fs.readdirSync(tabsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(tabsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix exact match:
  // className="animate-in fade-in zoom-in-95 duration-300"
  // key={...}
  // className="..."
  
  content = content.replace(/className="animate-in fade-in zoom-in-95 duration-300"\s*key=\{([^}]+)\}\s*className=/g, 'key={$1} className="animate-in fade-in zoom-in-95 duration-300 ');
  content = content.replace(/className="animate-in fade-in zoom-in-95 duration-300"\s*key=\{([^}]+)\}\s*onClick=\{([^}]+)\}\s*className=/g, 'key={$1} onClick={$2} className="animate-in fade-in zoom-in-95 duration-300 ');

  // For exercises-tab.tsx specifically where key={ex.id} is between classNames
  // <div
  //   className="animate-in fade-in zoom-in-95 duration-300"
  //   key={ex.id}
  //   className={`...`}
  
  content = content.replace(/className="animate-in fade-in zoom-in-95 duration-300"\s*key=\{([a-zA-Z0-9.]+)\}\s*className=/g, 'key={$1} className="animate-in fade-in zoom-in-95 duration-300 ');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed syntax in ${file}`);
  }
}
