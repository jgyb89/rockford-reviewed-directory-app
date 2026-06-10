const fs = require('fs');
const content = fs.readFileSync('./src/lib/auth.js', 'utf8');

const match = content.match(/query GetViewer \{([\s\S]*?)`\s*;/);
const query = match[0];
let lines = query.split('\n');

let openCount = 0;
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  for (let c of line) {
    if (c === '{') openCount++;
    if (c === '}') openCount--;
  }
  console.log(`${String(i).padStart(3)} | ${openCount} | ${line}`);
}
