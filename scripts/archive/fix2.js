const fs = require('fs')

const p2 = "C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\app\\admin\\tabs\\gallery-tab.tsx"
let content2 = fs.readFileSync(p2, 'utf8')

// Fix the nested ternary
const badPattern1 = /\{img\.imageUrl\.match[^]*?<img src=\{img\.imageUrl\}[^]*?\s+\)}/g
// Let's just find the section and replace it perfectly.
// For the grid image:
const gridImgTarget = `
              {img.imageUrl.match(/\\.(mp4|webm|mov)$/i) ? (
                <video src={img.imageUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : (
                {img.imageUrl.match(/\\.(mp4|webm|mov)$/i) ? (
                <video src={img.imageUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={img.imageUrl} alt={img.title ?? ''} className="w-full h-full object-cover" />
              )}
              )}
`

// Just replace everything between `<motion.div ...>` and `<div className="absolute inset-0...`
const start1 = "className={`group relative aspect-square rounded-xl overflow-hidden bg-white/5 ${!img.active ? 'opacity-40' : ''}`}>\n"
const end1 = '\n              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">'
let parts1 = content2.split(start1)
if (parts1.length > 1) {
  let subparts1 = parts1[1].split(end1)
  content2 = parts1[0] + start1 + 
`              {img.imageUrl.match(/\\.(mp4|webm|mov)$/i) ? (
                <video src={img.imageUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={img.imageUrl} alt={img.title ?? ''} className="w-full h-full object-cover" />
              )}` + end1 + subparts1.slice(1).join(end1)
}

// For the edit modal:
const start2 = '<div className="p-6 space-y-4">\n'
const end2 = '\n                <div>\n                  <label className="block text-white/50 text-xs font-medium mb-1.5">Title (optional)</label>'
let parts2 = content2.split(start2)
if (parts2.length > 1) {
  let subparts2 = parts2[1].split(end2)
  content2 = parts2[0] + start2 + 
`                {editModal.image.imageUrl.match(/\\.(mp4|webm|mov)$/i) ? (
                  <video src={editModal.image.imageUrl} autoPlay loop muted playsInline className="w-full h-48 object-cover rounded-lg" />
                ) : (
                  <img src={editModal.image.imageUrl} alt="" className="w-full h-48 object-cover rounded-lg" />
                )}` + end2 + subparts2.slice(1).join(end2)
}

fs.writeFileSync(p2, content2, 'utf8')
console.log('Fixed gallery-tab.tsx')
