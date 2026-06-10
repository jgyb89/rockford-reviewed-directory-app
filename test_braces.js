const fs = require('fs');
const content = fs.readFileSync('./src/lib/auth.js', 'utf8');

// extract the query string
const match = content.match(/query GetViewer \{([\s\S]*?)`\s*;/);
if (!match) {
  console.log("No query found");
  process.exit(1);
}
const query = match[0];
let open = 0;
let close = 0;
for (let char of query) {
  if (char === '{') open++;
  if (char === '}') close++;
}
console.log(`Open: ${open}, Close: ${close}`);
