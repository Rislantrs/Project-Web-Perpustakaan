import fs from 'fs';
import path from 'path';

const dir = 'dist/assets';
const files = fs.readdirSync(dir);
const cssFile = files.find(f => f.endsWith('.css'));

if (!cssFile) {
  console.log('No CSS file found');
  process.exit(1);
}

const content = fs.readFileSync(path.join(dir, cssFile), 'utf8');
console.log('CSS file size:', content.length, 'bytes');

const classesToCheck = ['.hidden', '.md\\:flex', '.sm\\:flex', '@media'];
classesToCheck.forEach(cls => {
  const index = content.indexOf(cls);
  console.log(`Contains "${cls}":`, index !== -1 ? `Yes (at index ${index})` : 'No');
  if (index !== -1) {
    console.log(`Snippet near "${cls}":`, content.substring(Math.max(0, index - 50), Math.min(content.length, index + 150)));
  }
});
