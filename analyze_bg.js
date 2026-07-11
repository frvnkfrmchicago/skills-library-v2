const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const spriteDir = '/Users/franklawrencejr./Downloads/skills-library-v2 2/retro-diner-fighters/public/sprites';
  const targetFiles = ['biker.png', 'chef.png'];
  
  for (const file of targetFiles) {
    const filePath = path.join(spriteDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
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
          
          // Sample a 100x100 region in the top left corner (first cell's corner area)
          const imgData = ctx.getImageData(0, 0, 100, 100).data;
          const colorCounts = {};
          
          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];
            const key = `${r},${g},${b},${a}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;
          }
          
          const sorted = Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
            
          resolve(sorted);
        };
        img.src = url;
      });
    }, dataUrl);
    
    console.log(`\nMost common colors in top-left 100x100 of ${file}:`);
    result.forEach(([color, count]) => {
      console.log(`  RGBA(${color}): ${count} pixels`);
    });
  }
  
  await browser.close();
})();
