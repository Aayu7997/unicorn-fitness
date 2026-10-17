const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      content = content.replace(/bg-\[\#13131f\]/g, 'bg-card');
      content = content.replace(/bg-\[\#1a1a2e\]/g, 'bg-card');
      content = content.replace(/bg-\[\#111111\]/g, 'bg-card');
      content = content.replace(/bg-\[\#0f0f1a\]/g, 'bg-card');
      content = content.replace(/bg-\[\#0a0a0a\]/g, 'bg-background');
      
      content = content.replace(/from-\[\#1a1a2e\]/g, 'from-card');
      content = content.replace(/to-\[\#0f0f1a\]/g, 'to-muted');
      
      content = content.replace(/border-white\/10/g, 'border-border');
      content = content.replace(/border-white\/5/g, 'border-border/50');
      content = content.replace(/border-gray-800/g, 'border-border');
      
      content = content.replace(/text-white\/70/g, 'text-muted-foreground');
      content = content.replace(/text-white\/50/g, 'text-muted-foreground');
      content = content.replace(/text-gray-400/g, 'text-muted-foreground');
      content = content.replace(/text-gray-500/g, 'text-muted-foreground');
      
      content = content.replace(/bg-white\/5/g, 'bg-muted');
      content = content.replace(/bg-white\/10/g, 'bg-muted/50');
      content = content.replace(/bg-black\/5/g, 'bg-muted');
      content = content.replace(/bg-black\/10/g, 'bg-muted/50');
      content = content.replace(/bg-black\/20/g, 'bg-muted');
      
      content = content.replace(/hover:bg-white\/5/g, 'hover:bg-muted');
      content = content.replace(/hover:bg-white\/10/g, 'hover:bg-muted/50');

      content = content.replace(/dark:bg-white\/5/g, 'bg-muted');
      content = content.replace(/dark:bg-white\/10/g, 'bg-muted/50');
      content = content.replace(/dark:border-white\/10/g, 'border-border');
      
      content = content.replace(/dark:text-white/g, 'text-foreground');
      content = content.replace(/dark:text-gray-400/g, 'text-muted-foreground');
      
      // Specifically target "text-white" when it's not inside a primary button
      // But it's hard with regex. We can just replace "text-white" with "text-foreground".
      // Let's replace text-white only if it's not part of an orange button text maybe?
      // Actually, text-foreground adapts to both modes perfectly.
      content = content.replace(/(?<![\w-])text-white(?![\w-])/g, 'text-foreground');
      content = content.replace(/(?<![\w-])text-black(?![\w-])/g, 'text-foreground');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed colors in ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'app', 'dashboard'));
processDir(path.join(__dirname, 'app', 'admin'));
