const fs = require('fs');
const path = require('path');

function parsePage(dirName) {
  console.log(`\n=================== PAGE: ${dirName} ===================`);
  const htmlPath = path.join(__dirname, dirName, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.log("No index.html found.");
    return;
  }
  const html = fs.readFileSync(htmlPath, 'utf8');

  console.log("=== HEADINGS ===");
  const headingMatches = html.matchAll(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi);
  for (const match of headingMatches) {
    console.log(match[0].replace(/<[^>]*>/g, '').trim());
  }

  console.log("\n=== LINKS ===");
  const linkMatches = html.matchAll(/<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi);
  const uniqueLinks = new Set();
  for (const match of linkMatches) {
    const href = match[1];
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    if (href && !href.startsWith('javascript') && !href.startsWith('#')) {
      uniqueLinks.add(`${text} -> ${href}`);
    }
  }
  Array.from(uniqueLinks).slice(0, 15).forEach(l => console.log(l));

  console.log("\n=== TEXT BLOCKS (PARAGRAPHS) ===");
  const pMatches = html.matchAll(/<p[^>]*>(.*?)<\/p>/gi);
  let pCount = 0;
  for (const match of pMatches) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    if (text.length > 20) {
      console.log(`- ${text}`);
      pCount++;
      if (pCount > 10) break;
    }
  }
}

parsePage('adelak-home');
parsePage('adelak-portfolio');
parsePage('adelak-contact');
