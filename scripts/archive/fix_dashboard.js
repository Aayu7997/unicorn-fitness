const fs = require('fs');
const path = require('path');

const tabsDir = path.join(__dirname, 'app', 'dashboard', 'tabs');
const files = fs.readdirSync(tabsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(tabsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove `transition={{...}}` and `animate={{...}}` and `layout` if they are standalone
  // Note: we're aggressively removing them because divs don't support them
  content = content.replace(/\btransition=\{\{[^}]+\}\}/g, '');
  content = content.replace(/\banimate=\{\{[^}]+\}\}/g, '');
  content = content.replace(/\blayout={true}/g, '');
  content = content.replace(/\blayout\s+/g, ' ');
  content = content.replace(/\blayout\n/g, '\n');
  content = content.replace(/\blayout>/g, '>');
  content = content.replace(/\blayout\/>/g, '/>');

  // Fix duplicate classNames:
  // E.g. className="animate-in fade-in zoom-in-95 duration-300" className="..."
  // E.g. className="animate-in fade-in zoom-in-95 duration-300" key="..." className="..."
  content = content.replace(/className="animate-in fade-in zoom-in-95 duration-300"\s*className="/g, 'className="animate-in fade-in zoom-in-95 duration-300 ');
  content = content.replace(/className="animate-in fade-in zoom-in-95 duration-300"\s*key="([^"]*)"\s*className="/g, 'key="$1" className="animate-in fade-in zoom-in-95 duration-300 ');
  content = content.replace(/className="animate-in fade-in zoom-in-95 duration-300"\s*([\w]+)="([^"]*)"\s*className="/g, '$1="$2" className="animate-in fade-in zoom-in-95 duration-300 ');

  // Sometime it might be multiline
  content = content.replace(/className="animate-in fade-in zoom-in-95 duration-300"\s*\n\s*className="/g, 'className="animate-in fade-in zoom-in-95 duration-300 ');
  content = content.replace(/className="animate-in fade-in zoom-in-95 duration-300"\s*\n\s*key="([^"]*)"\s*\n\s*className="/g, 'key="$1" className="animate-in fade-in zoom-in-95 duration-300 ');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed syntax in ${file}`);
  }
}
