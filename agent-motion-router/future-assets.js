/* future-assets.js */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize gesture vector canvas grid
  setupGestureCanvas();

  // Initialize simulated speech capture meter
  setupSpeechMeter();

  // Initialize dynamic sticker overlay injections
  setupStickerInjections();
});

/**
 * Renders a geometric grid on a canvas that warps and deforms based on mouse movements.
 * Mimics 3D hover overlays highly requested in 2026.
 */
function setupGestureCanvas() {
  const canvas = document.getElementById('gesture-grid-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = canvas.offsetWidth;
  let height = canvas.height = canvas.offsetHeight;

  let mouse = { x: width / 2, y: height / 2, active: false };

  // Handle cursor tracking
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Re-fit canvas on size adjustments
  window.addEventListener('resize', () => {
    if (canvas.offsetWidth > 0) {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
  });

  // Grid constants
  const cols = 20;
  const rows = 8;
  const colSpacing = width / (cols - 1);
  const rowSpacing = height / (rows - 1);

  function drawGrid() {
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(252, 128, 25, 0.2)';
    ctx.lineWidth = 1;

    // Draw mesh lines
    for (let r = 0; r < rows; r++) {
      ctx.beginPath();
      for (let c = 0; c < cols; c++) {
        // Calculate standard node coords
        let px = c * colSpacing;
        let py = r * rowSpacing;

        // Apply cursor gravity warp
        if (mouse.active) {
          const dx = px - mouse.x;
          const dy = py - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 80;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            px += (dx / dist) * force * 15;
            py += (dy / dist) * force * 15;
          }
        }

        if (c === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }

    // Vertical mesh lines
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        let px = c * colSpacing;
        let py = r * rowSpacing;

        if (mouse.active) {
          const dx = px - mouse.x;
          const dy = py - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 80;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            px += (dx / dist) * force * 15;
            py += (dy / dist) * force * 15;
          }
        }

        if (r === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }

    // Interactive circular pointer highlights
    if (mouse.active) {
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(225, 28, 84, 0.4)';
      ctx.fill();
    }

    requestAnimationFrame(drawGrid);
  }

  // Launch loop
  drawGrid();
}

/**
 * Speech microphone simulation decibel meter fluctuations.
 */
function setupSpeechMeter() {
  const micBtn = document.getElementById('interactive-mic-btn');
  const micText = document.querySelector('.mic-status-text');
  const bars = document.querySelectorAll('.audio-bar');

  if (!micBtn) return;

  let animInterval = null;

  micBtn.addEventListener('click', () => {
    const isActive = micBtn.classList.toggle('active');

    if (isActive) {
      if (micText) micText.textContent = "Listening... Speak now";
      
      // Animate wave bars with randomized fluctuations
      animInterval = setInterval(() => {
        bars.forEach(bar => {
          const randomHeight = Math.floor(Math.random() * 22) + 4;
          bar.style.height = `${randomHeight}px`;
        });
      }, 100);

      // Simulation timeout after 4 seconds
      setTimeout(() => {
        if (micBtn.classList.contains('active')) {
          micBtn.classList.remove('active');
          clearInterval(animInterval);
          if (micText) micText.textContent = "Click to speak";
          bars.forEach(bar => bar.style.height = '4px');
        }
      }, 4000);

    } else {
      if (micText) micText.textContent = "Click to speak";
      clearInterval(animInterval);
      bars.forEach(bar => bar.style.height = '4px');
    }
  });
}

/**
 * Manages placing and scaling vector stickers inside the sandbox workspace.
 */
function setupStickerInjections() {
  const stickerNodes = document.querySelectorAll('.sticker-node');
  const viewport = document.getElementById('sticker-viewport');

  if (!viewport) return;

  stickerNodes.forEach(node => {
    node.addEventListener('click', () => {
      // Toggle selections
      stickerNodes.forEach(el => el.classList.remove('active'));
      node.classList.add('active');

      // Clear previous injected sticker
      viewport.innerHTML = '';

      // Clone target SVG from button
      const svg = node.querySelector('svg').cloneNode(true);
      
      const stickerItem = document.createElement('div');
      stickerItem.className = 'injected-sticker-item';
      stickerItem.appendChild(svg);

      // Position randomly within viewport boundaries
      const rect = viewport.getBoundingClientRect();
      const margin = 20;
      const x = Math.random() * (rect.width - 80) + margin;
      const y = Math.random() * (rect.height - 80) + margin;

      stickerItem.style.left = `${x}px`;
      stickerItem.style.top = `${y}px`;
      stickerItem.style.transform = `scale(0)`;

      viewport.appendChild(stickerItem);

      // Trigger pop transition
      setTimeout(() => {
        stickerItem.style.transform = `scale(1.2) rotate(${Math.floor(Math.random() * 30) - 15}deg)`;
      }, 50);

      setTimeout(() => {
        stickerItem.style.transform = `scale(1) rotate(${Math.floor(Math.random() * 20) - 10}deg)`;
      }, 200);
    });
  });
}
