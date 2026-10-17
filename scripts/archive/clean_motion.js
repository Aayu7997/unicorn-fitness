const fs = require('fs');
const path = require('path');

const tabsDir = path.join(__dirname, 'app', 'admin', 'tabs');
const files = fs.readdirSync(tabsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(tabsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove framer-motion imports
  content = content.replace(/import\s*\{[^}]*motion[^}]*\}\s*from\s*['"]framer-motion['"];?\n?/g, '');
  content = content.replace(/import\s*\{[^}]*AnimatePresence[^}]*\}\s*from\s*['"]framer-motion['"];?\n?/g, '');

  // Replace <motion.div ...> with <div ...> and add fade-in
  content = content.replace(/<motion\.div/g, '<div className="animate-in fade-in zoom-in-95 duration-300"');
  content = content.replace(/<\/motion\.div>/g, '</div>');
  
  // Replace <motion.button ...> with <button ...>
  content = content.replace(/<motion\.button/g, '<button');
  content = content.replace(/<\/motion\.button>/g, '</button>');

  // Replace <motion.span ...> with <span ...>
  content = content.replace(/<motion\.span/g, '<span');
  content = content.replace(/<\/motion\.span>/g, '</span>');

  // Remove framer-motion specific props
  content = content.replace(/\s+initial=\{\{[^}]+\}\}/g, '');
  content = content.replace(/\s+animate=\{\{[^}]+\}\}/g, '');
  content = content.replace(/\s+exit=\{\{[^}]+\}\}/g, '');
  content = content.replace(/\s+layoutId=(?:\{[^}]+\}|"[^"]+"|'[^']+')/g, '');
  content = content.replace(/\s+whileHover=\{\{[^}]+\}\}/g, '');
  content = content.replace(/\s+whileTap=\{\{[^}]+\}\}/g, '');

  // Fix up <AnimatePresence> since it's no longer imported
  content = content.replace(/<AnimatePresence[^>]*>/g, '');
  content = content.replace(/<\/AnimatePresence>/g, '');

  // Clean up cases where className="animate-in fade-in zoom-in-95 duration-300" is next to an existing className
  // E.g. <div className="animate-in fade-in zoom-in-95 duration-300" className="flex ..."> 
  // We need to merge them.
  content = content.replace(/className="animate-in fade-in zoom-in-95 duration-300"\s*(key="[^"]*"\s*)?className="/g, 'className="animate-in fade-in zoom-in-95 duration-300 $1 ');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned motion from ${file}`);
  }
}
