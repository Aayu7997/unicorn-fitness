const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'app', 'admin', 'tabs'),
  // We can do dashboard later, user specifically asked for admin panel
];

const patterns = [
  // Backgrounds
  { regex: /dark:bg-white\/[0-9]+\s+bg-black\/[0-9]+/g, replacement: 'bg-muted' },
  { regex: /bg-black\/[0-9]+\s+dark:bg-white\/[0-9]+/g, replacement: 'bg-muted' },
  { regex: /bg-black\/[0-9]+\s+dark:bg-black\/[0-9]+/g, replacement: 'bg-muted/50' },
  { regex: /dark:bg-white\/[0-9]+/g, replacement: 'bg-muted' }, // fallback
  { regex: /bg-black\/[0-9]+/g, replacement: 'bg-muted' }, // fallback

  // Borders
  { regex: /border-border\/[0-9]+/g, replacement: 'border-border' },
  
  // Specific warnings/success colors that were hardcoded
  { regex: /text-amber-[0-9]+\s+dark:text-amber-[0-9]+/g, replacement: 'text-warning' },
  { regex: /text-amber-[0-9]+\/[0-9]+\s+dark:text-amber-[0-9]+\/[0-9]+/g, replacement: 'text-warning/80' },
  { regex: /text-emerald-[0-9]+\s+dark:text-emerald-[0-9]+/g, replacement: 'text-emerald-500' },
  { regex: /text-orange-[0-9]+\s+dark:text-orange-[0-9]+/g, replacement: 'text-warning' },
  { regex: /text-primary\s+dark:text-primary\/[0-9]+/g, replacement: 'text-primary' },

  // Shadows and visual noise (remove drop-shadow and heavy shadows)
  { regex: /shadow-[a-z]+/g, replacement: 'shadow-sm' }, // flatten to shadow-sm
  { regex: /drop-shadow-[a-z]+/g, replacement: '' }, // remove drop shadow

  // Transitions
  // { regex: /transition-all/g, replacement: 'transition-colors' },
];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    for (const { regex, replacement } of patterns) {
      content = content.replace(regex, replacement);
    }

    // Clean up multiple spaces that might result from regex
    content = content.replace(/\s+class(Name)?="/g, ' class$1="');
    content = content.replace(/"\s+/g, '"');
    content = content.replace(/\s+"/g, '"');
    
    // Some manual cleanups
    content = content.replace(/shadow-sm shadow-sm/g, 'shadow-sm');
    content = content.replace(/bg-muted bg-muted/g, 'bg-muted');

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Audited styles in ${file}`);
    }
  }
}
