const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app', 'admin', 'tabs');

const colorMap = {
  'bg-blue-500': 'bg-primary',
  'bg-blue-600': 'bg-primary/90',
  'bg-blue-400': 'bg-primary/80',
  'text-blue-500': 'text-primary',
  'text-blue-400': 'text-primary/80',
  'text-blue-600': 'text-primary',
  'border-blue-500': 'border-primary',
  'border-blue-500/20': 'border-primary/20',
  'bg-blue-500/10': 'bg-primary/10',
  'bg-blue-500/20': 'bg-primary/20',
  'text-green-500': 'text-emerald-500', // Success state
  'text-green-400': 'text-emerald-500',
  'bg-green-500/10': 'bg-emerald-500/10',
  'border-green-500/20': 'border-emerald-500/20',
  'text-red-500': 'text-destructive',
  'text-red-400': 'text-destructive',
  'bg-red-500/10': 'bg-destructive/10',
  'border-red-500/20': 'border-destructive/20',
  'text-orange-500': 'text-warning', // Assuming warning exists, or use amber-500
  'bg-orange-500/10': 'bg-warning/10',
  'text-purple-500': 'text-primary',
  'bg-purple-500/10': 'bg-primary/10'
};

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Replace colors
  for (const [oldColor, newColor] of Object.entries(colorMap)) {
    // regex to match exact class name with word boundaries
    const regex = new RegExp(`\\b${oldColor.replace(/\//g, '\\/')}\\b`, 'g');
    content = content.replace(regex, newColor);
  }
  
  // also replace arbitrary Framer Motion motion.divs with standard divs if it's just opacity/y
  // (We'll leave motion.div alone for now to avoid breaking JSX again)

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated colors in ${file}`);
  }
}
