import * as THREE from 'three';

/**
 * Convert RGB to HSL color space.
 */
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Load a sprite sheet and extract individual frames as separate textures.
 * Aggressive HSL-based chromakey and anchor-grounded normalization.
 */
export function loadSpriteSheet(url, cols, rows) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const frameW = Math.floor(img.width / cols);
      const frameH = Math.floor(img.height / rows);
      const textures = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const canvas = document.createElement('canvas');
          canvas.width = frameW;
          canvas.height = frameH;
          const ctx = canvas.getContext('2d');

          ctx.drawImage(
            img,
            col * frameW, row * frameH, frameW, frameH,
            0, 0, frameW, frameH
          );

          const imageData = ctx.getImageData(0, 0, frameW, frameH);
          const d = imageData.data;

          // Strategy 1: HSL green-screen detection (75 <= H <= 165, S >= 15%, L >= 10%)
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], b = d[i + 2];
            const [h, s, l] = rgbToHsl(r, g, b);

            let shouldRemove = false;
            let edgeSoften = false;

            // Pure HSL green screen range
            if (h >= 75 && h <= 165 && s >= 15 && l >= 8 && l <= 92) {
              shouldRemove = true;
            } else if (h >= 70 && h <= 170 && s >= 10 && l >= 5 && l <= 95) {
              edgeSoften = true;
            }

            // Fallback for strong pure green screen colors
            if (!shouldRemove && g > 90 && g > r * 1.3 && g > b * 1.3) {
              shouldRemove = true;
            }

            if (shouldRemove) {
              d[i + 3] = 0;
            } else if (edgeSoften) {
              d[i + 3] = Math.floor(d[i + 3] * 0.3);
            }
          }
          ctx.putImageData(imageData, 0, 0);

          // Strategy 2: Remove adjacent grid/bleed elements by connected column scanning
          const colActive = new Array(frameW).fill(false);
          const cleanedData = ctx.getImageData(0, 0, frameW, frameH);
          const cd = cleanedData.data;

          for (let x = 0; x < frameW; x++) {
            for (let y = 0; y < frameH; y++) {
              const idx = (y * frameW + x) * 4;
              if (cd[idx + 3] > 30) {
                colActive[x] = true;
                break;
              }
            }
          }

          const components = [];
          let currentComp = [];
          for (let x = 0; x < frameW; x++) {
            if (colActive[x]) {
              currentComp.push(x);
            } else {
              if (currentComp.length > 0) {
                components.push(currentComp);
                currentComp = [];
              }
            }
          }
          if (currentComp.length > 0) {
            components.push(currentComp);
          }

          let mainComponent = null;
          let maxLen = 0;
          components.forEach(comp => {
            if (comp.length > maxLen) {
              maxLen = comp.length;
              mainComponent = comp;
            }
          });

          // Erase small disconnected bleeding columns near boundaries (Ryu's two-character bug)
          if (mainComponent && components.length > 1) {
            components.forEach(comp => {
              if (comp !== mainComponent) {
                const compStart = comp[0];
                const compEnd = comp[comp.length - 1];
                if (compEnd < 12 || compStart > frameW - 12) {
                  comp.forEach(x => {
                    for (let y = 0; y < frameH; y++) {
                      const idx = (y * frameW + x) * 4;
                      cd[idx + 3] = 0;
                    }
                  });
                }
              }
            });
          }
          ctx.putImageData(cleanedData, 0, 0);

          // Clean isolated noisy pixels
          const finalClean = ctx.getImageData(0, 0, frameW, frameH);
          const fcd = finalClean.data;
          for (let y = 1; y < frameH - 1; y++) {
            for (let x = 1; x < frameW - 1; x++) {
              const idx = (y * frameW + x) * 4;
              if (fcd[idx + 3] > 0 && fcd[idx + 3] < 60) {
                const neighbors = [
                  fcd[((y - 1) * frameW + x) * 4 + 3],
                  fcd[((y + 1) * frameW + x) * 4 + 3],
                  fcd[(y * frameW + x - 1) * 4 + 3],
                  fcd[(y * frameW + x + 1) * 4 + 3],
                ];
                const transparentNeighbors = neighbors.filter(val => val === 0).length;
                if (transparentNeighbors >= 3) {
                  fcd[idx + 3] = 0;
                }
              }
            }
          }
          ctx.putImageData(finalClean, 0, 0);

          textures.push(canvas);
        }
      }

      // ── FRAME NORMALIZATION ──
      let finalTextures;
      try {
        const targetFillH = 0.85;
        const targetFillW = 0.70;

        // Read idle frame (frame 0) to establish static reference coordinates
        const ref = textures[0];
        const readCanvas = document.createElement('canvas');
        readCanvas.width = frameW;
        readCanvas.height = frameH;
        const readCtx = readCanvas.getContext('2d');
        readCtx.drawImage(ref, 0, 0);
        const refData = readCtx.getImageData(0, 0, frameW, frameH).data;

        let rMinY = frameH, rMaxY = 0, rMinX = frameW, rMaxX = 0;
        for (let i = 0; i < refData.length; i += 4) {
          if (refData[i + 3] > 30) {
            const px = (i / 4) % frameW;
            const py = Math.floor((i / 4) / frameW);
            if (py < rMinY) rMinY = py;
            if (py > rMaxY) rMaxY = py;
            if (px < rMinX) rMinX = px;
            if (px > rMaxX) rMaxX = px;
          }
        }

        const refH = (rMaxY > rMinY) ? rMaxY - rMinY + 1 : frameH;
        const refW = (rMaxX > rMinX) ? rMaxX - rMinX + 1 : frameW;

        const scaleH = (frameH * targetFillH) / refH;
        const scaleW = (frameW * targetFillW) / refW;
        const normScale = Math.min(scaleH, scaleW, 1.8);

        // Compute Idle Frame 0 anchor coordinates
        const refX = (rMinX + rMaxX) / 2;
        const refY = rMaxY;

        // Define fixed target landing coordinates on the output canvas
        const targetAnchorX = frameW / 2;
        const targetAnchorY = frameH - Math.round(frameH * 0.03);

        finalTextures = textures.map((srcCanvas) => {
          let out = srcCanvas;
          try {
            const rc = document.createElement('canvas');
            rc.width = frameW; rc.height = frameH;
            const rctx = rc.getContext('2d');
            rctx.drawImage(srcCanvas, 0, 0);
            const sd = rctx.getImageData(0, 0, frameW, frameH).data;

            let sMinX = frameW, sMaxX = 0, sMinY = frameH, sMaxY = 0;
            for (let i = 0; i < sd.length; i += 4) {
              if (sd[i + 3] > 30) {
                const px = (i / 4) % frameW;
                const py = Math.floor((i / 4) / frameW);
                if (px < sMinX) sMinX = px;
                if (px > sMaxX) sMaxX = px;
                if (py < sMinY) sMinY = py;
                if (py > sMaxY) sMaxY = py;
              }
            }

            if (sMaxX > sMinX && sMaxY > sMinY) {
              const cw = sMaxX - sMinX + 1;
              const ch = sMaxY - sMinY + 1;

              // Calculate grounded dimensions
              const dw = Math.round(cw * normScale);
              const dh = Math.round(ch * normScale);

              // Calculate destination position locking original ref point to target anchor
              const dx = Math.round(targetAnchorX + (sMinX - refX) * normScale);
              const dy = Math.round(targetAnchorY + (sMinY - refY) * normScale);

              out = document.createElement('canvas');
              out.width = frameW;
              out.height = frameH;
              const oc = out.getContext('2d');
              oc.imageSmoothingEnabled = false;
              oc.drawImage(srcCanvas, sMinX, sMinY, cw, ch, dx, dy, dw, dh);
            }
          } catch (e) {
            out = srcCanvas;
          }

          const tex = new THREE.CanvasTexture(out);
          tex.magFilter = THREE.NearestFilter;
          tex.minFilter = THREE.NearestFilter;
          tex.needsUpdate = true;
          return tex;
        });
      } catch (e) {
        console.warn('Frame anchor-grounded normalization failed, using raw frames:', e);
        finalTextures = textures.map((c) => {
          const tex = new THREE.CanvasTexture(c);
          tex.magFilter = THREE.NearestFilter;
          tex.minFilter = THREE.NearestFilter;
          tex.needsUpdate = true;
          return tex;
        });
      }

      resolve({ textures: finalTextures, frameW, frameH });
    };
    img.onerror = (e) => reject(new Error('Failed to load sprite: ' + url));
    img.src = url;
  });
}
