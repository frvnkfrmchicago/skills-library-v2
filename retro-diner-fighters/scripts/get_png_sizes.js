import fs from 'fs';
import path from 'path';

const spriteDir = '/Users/franklawrencejr./Downloads/skills-library-v2 2/retro-diner-fighters/public/sprites';
const files = fs.readdirSync(spriteDir).filter(f => f.endsWith('.png'));

console.log(`Checking dimensions of ${files.length} sprite sheets:`);

files.forEach(file => {
  const filePath = path.join(spriteDir, file);
  const buffer = fs.readFileSync(filePath);
  
  // PNG signature is at 0-7. IHDR chunk starts at 12.
  // Width is 4 bytes at 16, Height is 4 bytes at 20.
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  
  console.log(`${file}: ${width}x${height}`);
});
