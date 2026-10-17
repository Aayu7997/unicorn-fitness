const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace hsl(var(--something)) with var(--something)
  content = content.replace(/hsl\((var\(--[a-zA-Z0-9-]+\))\)/g, '$1');
  
  // Replace hsl(var(--something)/0.5) inside cursor={{ fill: ... }} with var(--something) and add fillOpacity
  // Actually, we can just regex for hsl(var(--something)/X) and replace with color-mix
  content = content.replace(/hsl\(var\((--[a-zA-Z0-9-]+)\)\/([0-9.]+)\)/g, (match, p1, p2) => {
    // Recharts SVG doesn't perfectly support all modern CSS functions in all browsers for SVG attributes if exported, but color-mix is well supported.
    // However, it's safer to just set fill="var(--something)" and fillOpacity=0.5 if possible.
    // In our specific case: cursor={{ fill: "hsl(var(--muted)/0.5)" }}
    return `color-mix(in srgb, var(${p1}) ${parseFloat(p2)*100}%, transparent)`;
  });

  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

fixFile('app/admin/tabs/analytics-tab.tsx');
fixFile('app/admin/tabs/overview-tab.tsx');
