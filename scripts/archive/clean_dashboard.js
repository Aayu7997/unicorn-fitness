const fs = require('fs');
const path = require('path');

const tabsDir = path.join(__dirname, 'app', 'dashboard', 'tabs');
const files = fs.readdirSync(tabsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(tabsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove framer-motion imports
  content = content.replace(/import\s*\{[^}]*motion[^}]*\}\s*from\s*['"]framer-motion['"];?\n?/g, '');
  content = content.replace(/import\s*\{[^}]*AnimatePresence[^}]*\}\s*from\s*['"]framer-motion['"];?\n?/g, '');
  content = content.replace(/import\s*framerMotion,\s*\{\s*[^}]*\s*\}\s*from\s*['"]framer-motion['"];?\n?/g, '');
  
  // Clean AnimatePresence wrapped blocks: <AnimatePresence>{...}</AnimatePresence> -> <>{...}</>
  // This is safer than just deleting the tags
  content = content.replace(/<AnimatePresence[^>]*>/g, '<>');
  content = content.replace(/<\/AnimatePresence>/g, '</>');

  // Replace <motion.div ...> with <div ...> and add fade-in
  content = content.replace(/<motion\.div/g, '<div className="animate-in fade-in zoom-in-95 duration-300"');
  content = content.replace(/<\/motion\.div>/g, '</div>');
  
  content = content.replace(/<motion\.button/g, '<button');
  content = content.replace(/<\/motion\.button>/g, '</button>');

  content = content.replace(/<motion\.span/g, '<span');
  content = content.replace(/<\/motion\.span>/g, '</span>');

  // Remove framer-motion specific props
  content = content.replace(/\s+initial=\{\{[^}]+\}\}/g, '');
  content = content.replace(/\s+animate=\{\{[^}]+\}\}/g, '');
  content = content.replace(/\s+exit=\{\{[^}]+\}\}/g, '');
  content = content.replace(/\s+layoutId=(?:\{[^}]+\}|"[^"]+"|'[^']+')/g, '');
  content = content.replace(/\s+whileHover=\{\{[^}]+\}\}/g, '');
  content = content.replace(/\s+whileTap=\{\{[^}]+\}\}/g, '');

  // Fix className merges
  content = content.replace(/className="animate-in fade-in zoom-in-95 duration-300"\s*key="([^"]*)"\s*className="/g, 'key="$1" className="animate-in fade-in zoom-in-95 duration-300 ');
  content = content.replace(/className="animate-in fade-in zoom-in-95 duration-300"\s*className="/g, 'className="animate-in fade-in zoom-in-95 duration-300 ');

  // Standardize shadow and background colors from the UI_UX.md audit
  // Note: we're standardizing dark:bg-* overrides to standard bg-*
  content = content.replace(/bg-black\/5\s+dark:bg-white\/5/g, 'bg-muted');
  content = content.replace(/dark:bg-white\/5\s+bg-black\/5/g, 'bg-muted');
  content = content.replace(/shadow-(md|lg|xl|2xl)/g, 'shadow-sm');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned dashboard tab ${file}`);
  }
}
