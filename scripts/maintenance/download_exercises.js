const fs = require('fs');
const path = require('path');

const DIR = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(DIR)) {
  fs.mkdirSync(DIR, { recursive: true });
}

fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json')
  .then(res => res.json())
  .then(data => {
    const transformed = data.map(ex => ({
      ...ex,
      images: ex.images.map(img => `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`)
    }));
    fs.writeFileSync(path.join(DIR, 'exercises.json'), JSON.stringify(transformed, null, 2));
    console.log(`Successfully saved ${transformed.length} exercises.`);
  })
  .catch(err => console.error(err));