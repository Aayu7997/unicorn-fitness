const fs = require('fs');
const path = require('path');

const tabsDir = path.join(__dirname, 'app', 'admin', 'tabs');
const files = fs.readdirSync(tabsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(tabsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix the broken className merge from previous script
  // It looks like: className="animate-in fade-in zoom-in-95 duration-300 key="audit"\n               space-y-4"
  // We want to turn it back to: key="audit" className="animate-in fade-in zoom-in-95 duration-300 \n               space-y-4"
  
  content = content.replace(/className="animate-in fade-in zoom-in-95 duration-300 key="([^"]*)"/g, 'key="$1" className="animate-in fade-in zoom-in-95 duration-300 ');

  // What if it didn't have a key? 
  // className="animate-in fade-in zoom-in-95 duration-300 \n space-y-4"
  // The original regex had `(key="[^"]*"\s*)?` so if there was no key, it just removed the second `className="` and merged them correctly!
  
  // Also let's fix any `className="animate-in fade-in zoom-in-95 duration-300  ` where it merged correctly but left double spaces. That's fine.

  // Let's also make sure there are no other syntax errors like double quotes.
  // E.g., if there's any remaining `className="animate-in fade-in zoom-in-95 duration-300 ` without a closing quote?
  // If my script did `className="animate-in fade-in zoom-in-95 duration-300 key="audit" `, it removed the closing quote of the FIRST className, and removed the `className="` of the SECOND className.
  // So `className="A" key="B" className="C"` became `className="A key="B" C"`.
  // Wait, if it became `className="A key="B" C"`, then my replacement `className="A key="B"` -> `key="B" className="A` turns it into `key="B" className="A C"`. Which is PERFECT.

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed syntax in ${file}`);
  }
}
