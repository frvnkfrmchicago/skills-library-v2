const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const spriteDir = '/Users/franklawrencejr./Downloads/skills-library-v2 2/retro-diner-fighters/public/sprites';
  const files = fs.readdirSync(spriteDir).filter(f => f.endsWith('.png'));
  
  console.log(`Analyzing ${files.length} sprite sheets...`);
  
  for (const file of files) {
    const filePath = path.join(spriteDir, file);
    const dataUrl = `data:image/png;base64,${fs.readFileSync(filePath).toString('base64')}`;
    
    const result = await page.evaluate((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const w = img.width;
          const h = img.height;
          const corners = [
            ctx.getImageData(0, 0, 1, 1).data,
            ctx.getImageData(w - 1, 0, 1, 1).data,
            ctx.getImageData(0, h - 1, 1, 1).data,
            ctx.getImageData(w - 1, h - 1, 1, 1).data
          ];
          
          const cellCorner = ctx.getImageData(10, 10, 1, 1).data;
          
          resolve({
            width: w,
            height: h,
            corners: corners.map(c => Array.from(c)),
            cellCorner: Array.from(cellCorner)
          });
        };
        img.src = url;
      });
    }, dataUrl);
    
    console.log(`\nFile: ${file}`);
    console.log(`Dimensions: ${result.width}x${result.height}`);
    console.log(`Corners:`, JSON.stringify(result.corners));
    console.log(`Cell Corner (10, 10):`, JSON.stringify(result.cellCorner));
  }
  
  await browser.close();
})();
