const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'adelak.html');
if (!fs.existsSync(filePath)) {
  console.log("adelak.html not found");
  process.exit(1);
}

// Since the file is 23MB, reading it into memory is fine for Node.
const html = fs.readFileSync(filePath, 'utf8');

console.log("File size:", html.length, "chars");

// Find iframes (Soundcloud, Spotify, YouTube, etc.)
console.log("\n=== IFRAMES ===");
const iframeMatches = html.matchAll(/<iframe[^>]*src="([^"]*)"[^>]*>/gi);
const uniqueIframes = new Set();
for (const match of iframeMatches) {
  uniqueIframes.add(match[1]);
}
console.log(Array.from(uniqueIframes));

// Find audio/video elements
console.log("\n=== AUDIO / VIDEO TAGS ===");
const mediaMatches = html.matchAll(/<(audio|video)[^>]*src="([^"]*)"[^>]*>/gi);
const uniqueMedia = new Set();
for (const match of mediaMatches) {
  uniqueMedia.add(`${match[1]}: ${match[2]}`);
}
console.log(Array.from(uniqueMedia));

// Find any SoundCloud/Spotify links
console.log("\n=== MUSIC PLATFORM LINKS ===");
const musicPlatformLinks = new Set();
const linkMatches = html.matchAll(/href="([^"]*(soundcloud|spotify|apple|youtube|bandcamp|music|songs)[^"]*)"/gi);
for (const match of linkMatches) {
  musicPlatformLinks.add(match[1]);
}
console.log(Array.from(musicPlatformLinks).slice(0, 50));

// Find images that are not standard wix/static images
console.log("\n=== UNIQUE IMAGES ===");
const imageMatches = html.matchAll(/<img[^>]*src="([^"]*)"[^>]*>/gi);
const uniqueImages = new Set();
for (const match of imageMatches) {
  const src = match[1];
  if (!src.includes('wixstatic.com') && !src.startsWith('data:') && !src.includes('wix-image')) {
    uniqueImages.add(src);
  } else {
    // Collect wix images to see what original images were there
    uniqueImages.add(src.split('#')[0]); // strip hashes
  }
}
console.log("Total unique images:", uniqueImages.size);
console.log(Array.from(uniqueImages).slice(0, 30));
