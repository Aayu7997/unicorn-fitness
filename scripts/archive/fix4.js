const fs = require('fs');
const path = 'C:/Users/ayush/Downloads/Projects/UFC GYM/app/signin/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('password: e.target.value')) {
        for (let j = i; j < i + 5; j++) {
            if (lines[j].includes('placeholder=')) {
                lines[j] = '                    placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"';
                break;
            }
        }
        break;
    }
}
fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed by line number search');
