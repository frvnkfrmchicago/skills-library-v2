// Main Game Controller for Super Mario Bros. 1-1
import { GameMap } from './map.js';
import { Mario, Goomba, KoopaTroopa, PowerUp, Particle } from './entities.js';
import { Physics } from './physics.js';
import { graphics } from './graphics.js';
import { audio } from './audio.js';

class GameController {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Core game state
    this.state = 'MENU'; // 'MENU', 'PLAYING', 'LEVEL_CLEAR', 'GAME_OVER'
    this.score = 0;
    this.coins = 0;
    this.time = 400;
    this.timeTickTimer = 0;
    this.world = '1-1';
    
    this.cameraX = 0;
    this.map = null;
    this.mario = null;
    
    // Entity lists
    this.enemies = [];
    this.powerups = [];
    this.particles = [];
    
    // Inputs
    this.keysHeld = {};
    this.canvas.keysHeld = this.keysHeld; // share reference for animation checks
    
    // UI Panels
    this.startOverlay = document.getElementById('start-overlay');
    this.gameOverOverlay = document.getElementById('game-over-overlay');
    this.levelClearOverlay = document.getElementById('level-clear-overlay');
    this.pauseOverlay = document.getElementById('pause-overlay');
    
    this.paused = false;
    this.levelCleanedUp = false;
    
    this.init();
  }

  init() {
    // Setup key listeners
    window.addEventListener('keydown', (e) => {
      this.keysHeld[e.code] = true;
      
      // Prevent browser scrolling with arrows/space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (this.state === 'MENU' && (e.code === 'Enter' || e.code === 'Space')) {
        this.startGame();
      } 
      else if ((this.state === 'GAME_OVER' || this.state === 'LEVEL_CLEAR') && e.code === 'Enter') {
        this.resetToMenu();
      }
      else if (this.state === 'PLAYING' && e.code === 'KeyP') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld[e.code] = false;
    });

    // Mobile buttons support
    this.setupMobileControls();

    // Volume controller setup
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    
    muteBtn.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      muteBtn.textContent = isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO';
      muteBtn.classList.toggle('active', isMuted);
    });
    
    volumeSlider.addEventListener('input', (e) => {
      audio.setVolume(e.target.value / 100);
    });

    // Mobile layout toggle
    const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
    const mobileControls = document.getElementById('mobile-controls');
    mobileToggleBtn.addEventListener('click', () => {
      mobileControls.classList.toggle('visible');
    });

    // Tap/Click to start on overlay
    this.startOverlay.addEventListener('click', () => {
      if (this.state === 'MENU') {
        this.startGame();
      }
    });

    // Start rendering loop
    requestAnimationFrame((t) => this.loop(t));
  }

  setupMobileControls() {
    const bindButton = (id, keyCode) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      
      const press = (e) => {
        e.preventDefault();
        this.keysHeld[keyCode] = true;
      };
      
      const release = (e) => {
        e.preventDefault();
        this.keysHeld[keyCode] = false;
      };
      
      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend', release, { passive: false });
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);
      btn.addEventListener('mouseleave', release);
    };

    bindButton('btn-left', 'ArrowLeft');
    bindButton('btn-right', 'ArrowRight');
    bindButton('btn-up', 'ArrowUp');
    bindButton('btn-down', 'ArrowDown');
    bindButton('btn-a', 'Space');
    bindButton('btn-b', 'ShiftLeft');
  }

  startGame() {
    this.state = 'PLAYING';
    this.startOverlay.classList.remove('active');
    this.gameOverOverlay.classList.remove('active');
    this.levelClearOverlay.classList.remove('active');
    
    // Load world elements
    this.score = 0;
    this.coins = 0;
    this.time = 400;
    this.timeTickTimer = 0;
    this.cameraX = 0;
    this.levelCleanedUp = false;
    
    this.map = new GameMap();
    this.mario = new Mario(32, 180); // Start position
    
    this.enemies = [];
    this.powerups = [];
    this.particles = [];
    
    this.spawnEntities();
    
    audio.startBgm();
  }

  resetToMenu() {
    this.state = 'MENU';
    this.startOverlay.classList.add('active');
    this.gameOverOverlay.classList.remove('active');
    this.levelClearOverlay.classList.remove('active');
    audio.stopBgm();
    
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  togglePause() {
    this.paused = !this.paused;
    this.pauseOverlay.classList.toggle('active', this.paused);
    if (this.paused) {
      audio.stopBgm();
      audio.playTone(400, 'sine', 0.1, audio.ctx.currentTime, 0.1, 0.05);
    } else {
      audio.startBgm();
    }
  }

  spawnEntities() {
    // NES World 1-1 Goomba & Koopa coordinates
    // Col multiplied by 16 represents X coordinates
    const goombas = [
      22, 35, 51, 53, 80, 82, 97, 99, 114, 116, 124, 126, 128, 130
    ];
    goombas.forEach(col => {
      // Spawn slightly above ground (row 12, y = 192px)
      this.enemies.push(new Goomba(col * 16, 180));
    });

    const koopas = [
      107, 139
    ];
    koopas.forEach(col => {
      this.enemies.push(new KoopaTroopa(col * 16, 170));
    });
  }

  // Handle crouch warp in pipes
  executeWarp(target) {
    if (target.area === 'underground') {
      this.map.currentArea = 'underground';
      this.mario.state = 'pipe_exit';
      this.mario.pipeWarpTimer = 40;
      this.mario.pipeDirection = 'up';
      this.mario.x = target.x;
      this.mario.y = target.y + 16;
      this.cameraX = 0; // Lock camera underground
      
      // Stop overworld theme, play underground sound or silence
      audio.stopBgm();
      audio.playTone(150, 'triangle', 0.5, audio.ctx.currentTime, 0.2, 0.01);
    } 
    else if (target.area === 'overworld') {
      this.map.currentArea = 'overworld';
      this.mario.state = 'pipe_exit';
      this.mario.pipeWarpTimer = 40;
      this.mario.pipeDirection = 'up';
      this.mario.x = target.x;
      this.mario.y = target.y - 16;
      // Scroll camera to pipe 5 column
      this.cameraX = Math.max(0, this.mario.x - 100);
      audio.startBgm();
    }
  }

  // Mario hits block from below
  handleBlockHit(tile) {
    const details = this.map.blockDetails[`${tile.col}_${tile.row}`];
    if (!details || details.hit) {
      // Ordinary block bounce
      if (tile.type === 'brick') {
        if (this.mario.size === 'big') {
          // Break Brick!
          this.map.setTile(tile.col, tile.row, null);
          audio.playBreak();
          this.score += 50;
          
          // Spawn brick particles
          const px = tile.col * 16 + 8;
          const py = tile.row * 16 + 8;
          this.particles.push(new Particle(px, py, 'brick_shard', { vx: -1.5, vy: -3 }));
          this.particles.push(new Particle(px, py, 'brick_shard', { vx: 1.5, vy: -3 }));
          this.particles.push(new Particle(px, py, 'brick_shard', { vx: -1.0, vy: -1.5 }));
          this.particles.push(new Particle(px, py, 'brick_shard', { vx: 1.0, vy: -1.5 }));
          
          // Defeat enemies standing on top of brick
          this.defeatEnemiesOnTile(tile.col, tile.row);
        } else {
          // Bounce brick only
          audio.playTone(100, 'triangle', 0.1, audio.ctx.currentTime, 0.2, 0.02);
          this.triggerBlockBounce(tile.col, tile.row, details);
        }
      }
      return;
    }

    // Question block or Brick with items
    details.hit = true;
    details.yOffset = -5; // Start bounce offset
    
    // Change tile visual
    if (tile.type === 'question') {
      this.map.setTile(tile.col, tile.row, 'question_empty');
    }
    
    // Defeat enemies standing on top
    this.defeatEnemiesOnTile(tile.col, tile.row);

    // Spawn item contents
    if (details.content === 'coin') {
      audio.playCoin();
      this.coins++;
      this.score += 200;
      
      // Floating coin particle
      const cx = tile.col * 16;
      const cy = tile.row * 16 - 16;
      this.particles.push(new Particle(cx, cy, 'coin_spin', { vy: -4, timer: 30 }));
      this.particles.push(new Particle(cx + 4, cy - 8, 'score_float', { text: '200', vy: -0.5, timer: 40 }));
    } 
    else if (details.content === 'mushroom') {
      // Spawn sliding mushroom
      const mx = tile.col * 16;
      const my = tile.row * 16;
      this.powerups.push(new PowerUp(mx, my, 'mushroom'));
    }
  }

  defeatEnemiesOnTile(col, row) {
    const tileTopY = row * 16;
    const tileLeftX = col * 16;
    
    this.enemies.forEach(enemy => {
      // Check if enemy is standing on the tile (feet at tile top, horizontal overlaps)
      const feetY = enemy.y + enemy.height;
      const horizontalOverlap = enemy.x < tileLeftX + 16 && enemy.x + enemy.width > tileLeftX;
      
      if (horizontalOverlap && Math.abs(feetY - tileTopY) <= 3) {
        // Defeat them from below!
        enemy.alive = false;
        enemy.vy = -3.5; // Fly upwards
        this.score += 100;
        this.particles.push(new Particle(enemy.x, enemy.y, 'score_float', { text: '100', vy: -0.5, timer: 45 }));
        audio.playStomp();
      }
    });
  }

  triggerBlockBounce(col, row, details) {
    if (!details) {
      this.map.blockDetails[`${col}_${row}`] = { yOffset: -3 };
    } else {
      details.yOffset = -3;
    }
  }

  // Handle flagpole reach
  handleFlagpoleReach() {
    this.mario.state = 'flag_slide';
    this.mario.vx = 0;
    this.mario.vy = 0;
    
    if (!this.mario.flagScoreAwarded) {
      this.mario.flagScoreAwarded = true;
      audio.playFlagpole();
      
      // Calculate score based on Mario's height on the flagpole
      // High flags give up to 5000 points!
      const poleBaseY = 12 * 16;
      const reachRatio = Math.max(0, Math.min(1, (poleBaseY - this.mario.y) / (10 * 16)));
      const scoreGain = Math.round(reachRatio * 4 + 1) * 1000;
      
      this.score += scoreGain;
      this.particles.push(new Particle(this.mario.x + 8, this.mario.y, 'score_float', { text: scoreGain.toString(), vy: -0.6, timer: 50 }));
    }
  }

  // Warp pipe exit (climbing out of the pipe)
  checkUndergroundWarpOut() {
    const centerTileX = Math.floor((this.mario.x + this.mario.width / 2) / 16);
    const topTileY = Math.floor(this.mario.y / 16);
    const block = this.map.blockDetails[`${centerTileX}_${topTileY}_underground`];
    
    if (block && block.warpOut) {
      // Teleport back to overworld col 163 (at pipe 5)
      this.mario.state = 'pipe_enter';
      this.mario.pipeWarpTimer = 60;
      this.mario.pipeDirection = 'right'; // Slide into warp-out pipe sideways
      this.mario.vx = 0;
      this.mario.vy = 0;
      this.mario.warpTarget = { area: 'overworld', x: 163 * 16 + 8, y: 11 * 16 };
      audio.playTone(180, 'sine', 0.6, audio.ctx.currentTime, 0.15, 0.05);
    }
  }

  triggerLevelClear() {
    this.state = 'LEVEL_CLEAR';
    this.levelClearOverlay.classList.add('active');
    audio.stopBgm();
    
    // Add remaining time bonus to score
    const timeBonus = this.time * 10;
    this.score += timeBonus;
    
    document.getElementById('time-bonus-val').textContent = timeBonus.toString();
    document.getElementById('total-score-val').textContent = this.score.toString().padStart(6, '0');
  }

  handlePlayerDeath() {
    this.state = 'GAME_OVER';
    this.gameOverOverlay.classList.add('active');
  }

  // ----------------------------------------------------
  // Primary Loop Step
  // ----------------------------------------------------
  loop(time) {
    this.update();
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  update() {
    if (this.paused || this.state !== 'PLAYING') return;

    // Tick Game Timer
    this.timeTickTimer++;
    if (this.timeTickTimer >= 24) { // Roughly 2.5 ticks per second (0.4s)
      this.timeTickTimer = 0;
      if (this.time > 0) {
        this.time--;
        if (this.time === 0) {
          this.mario.die(this); // Out of time!
        }
      }
    }

    // Crouch jump or special keys
    if (this.keysHeld['KeyW'] || this.keysHeld['Space'] || this.keysHeld['ArrowUp']) {
      this.mario.jump(this.keysHeld);
    }

    // Update Player (Mario)
    this.mario.update(this.map, this.keysHeld, this);

    // Camera scrolling (Monotonically scroll right, never left)
    if (this.map.currentArea === 'overworld') {
      const targetCamX = this.mario.x - 110;
      if (targetCamX > this.cameraX) {
        this.cameraX = targetCamX;
      }
      
      // Restrict Mario from walking off-screen left
      if (this.mario.x < this.cameraX) {
        this.mario.x = this.cameraX;
        if (this.mario.vx < 0) this.mario.vx = 0;
      }

      // Check Flagpole Collision (flagpole is at x=198 * 16)
      const flagpoleX = 198 * 16 + 8;
      if (this.mario.state === 'normal' && this.mario.x >= flagpoleX - 6 && this.mario.x <= flagpoleX + 6) {
        this.handleFlagpoleReach();
      }
    } else {
      // Underground is static single screen, lock camera
      this.cameraX = 0;
      
      // Check warp out (standing on warp out pipe)
      if (this.mario.onGround && (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight'])) {
        this.checkUndergroundWarpOut();
      }
    }

    // Check bottomless pit death
    if (this.mario.y > 240 + 16 && this.mario.alive) {
      this.mario.die(this);
    }

    // Update PowerUps
    this.powerups.forEach(pw => pw.update(this.map));
    this.powerups = this.powerups.filter(pw => pw.alive);

    // Update Enemies
    this.enemies.forEach(enemy => {
      enemy.update(this.map);
      
      // If enemy fell in pit, clean them up
      if (enemy.y > 240 + 32) {
        enemy.alive = false;
      }
    });
    // Filter out squished or dead ones (but keep Koopa shell moving off screen)
    this.enemies = this.enemies.filter(enemy => enemy.alive || enemy.squishTimer > 0 || !enemy.alive && enemy.y < 240);

    // Update Particles
    this.particles.forEach(p => p.update());
    this.particles = this.particles.filter(p => p.alive);

    // ----------------------------------------------------
    // Collision Resolutions (Player vs Enemies / Items)
    // ----------------------------------------------------
    // Mario vs PowerUp
    this.powerups.forEach(pw => {
      if (Physics.checkEntityCollision(this.mario, pw)) {
        pw.alive = false;
        audio.playPowerupCollect();
        this.score += 1000;
        this.particles.push(new Particle(pw.x + 4, pw.y, 'score_float', { text: '1000', vy: -0.6, timer: 40 }));
        
        // Grow Mario
        if (this.mario.size === 'small') {
          this.mario.size = 'big';
          this.mario.y -= 14; // Shift up to avoid clipping ground
          this.mario.height = 28;
          this.mario.transformTimer = 25; // Locked frame transition freeze
        }
      }
    });

    // Mario vs Static coins (Underground area)
    if (this.map.currentArea === 'underground') {
      const startCol = Math.floor(this.mario.x / 16);
      const endCol = Math.floor((this.mario.x + this.mario.width) / 16);
      const startRow = Math.floor(this.mario.y / 16);
      const endRow = Math.floor((this.mario.y + this.mario.height) / 16);
      
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          if (this.map.getTile(c, r) === 'coin_static') {
            // Collect it!
            this.map.setTile(c, r, null);
            audio.playCoin();
            this.coins++;
            this.score += 200;
            this.particles.push(new Particle(c * 16, r * 16, 'score_float', { text: '200', vy: -0.5, timer: 30 }));
          }
        }
      }
    }

    // Mario vs Enemies
    this.enemies.forEach(enemy => {
      if (!enemy.alive && enemy.squishTimer <= 0) return; // ignore dead falling ones
      
      const side = Physics.checkEntityCollision(this.mario, enemy);
      if (side) {
        // Stomp condition: Mario's feet are higher than the enemy's bottom level when they collide
        const isStomp = (this.mario.y + this.mario.height) < (enemy.y + enemy.height - 3);
        
        if (enemy.type === 'goomba') {
          if (isStomp) {
            enemy.squish();
            this.mario.vy = -3.5; // bounce up
            this.score += 100;
            this.particles.push(new Particle(enemy.x, enemy.y - 8, 'score_float', { text: '100', vy: -0.5, timer: 30 }));
          } else {
            // Mario hurt!
            this.mario.takeDamage(this);
          }
        } 
        else if (enemy.type === 'koopa') {
          if (isStomp) {
            enemy.hitByPlayer(this.mario);
            this.score += 100;
            this.particles.push(new Particle(enemy.x, enemy.y - 8, 'score_float', { text: '100', vy: -0.5, timer: 30 }));
          } else {
            if (enemy.state === 'shell') {
              // Kick it!
              enemy.hitByPlayer(this.mario);
            } else {
              // Hurt!
              this.mario.takeDamage(this);
            }
          }
        }
      }
    });

    // Kicked Koopa shell vs Goombas
    this.enemies.forEach(koopa => {
      if (koopa.type === 'koopa' && koopa.state === 'shell_kicked') {
        this.enemies.forEach(goomba => {
          if (goomba.type === 'goomba' && goomba.alive) {
            if (Physics.collides(koopa, goomba)) {
              // Defeat goomba!
              goomba.alive = false;
              goomba.vy = -3.5; // fly up
              this.score += 200;
              this.particles.push(new Particle(goomba.x, goomba.y - 8, 'score_float', { text: '200', vy: -0.5, timer: 30 }));
              audio.playStomp();
            }
          }
        });
      }
    });
  }

  // ----------------------------------------------------
  // Renderer Step
  // ----------------------------------------------------
  render() {
    this.ctx.fillStyle = this.map ? (this.map.currentArea === 'underground' ? this.map.undergroundColor : this.map.skyColor) : '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'MENU') {
      // Title screen text HUD
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '8px "Press Start 2P"';
      this.ctx.fillText('MARIO', 30, 20);
      this.ctx.fillText('000000', 30, 30);
      
      this.ctx.fillText('COINS', 100, 20);
      this.ctx.fillText('x00', 100, 30);
      
      this.ctx.fillText('WORLD', 160, 20);
      this.ctx.fillText('1-1', 168, 30);
      return;
    }

    // Draw Background Scenery (hills, clouds, castle)
    if (this.map.currentArea === 'overworld') {
      this.map.scenery.forEach(item => {
        const drawX = item.col * 16;
        const drawY = item.row * 16;
        
        // Draw parallax background only if on screen
        if (drawX + item.w > this.cameraX && drawX < this.cameraX + 256) {
          graphics.drawScenery(this.ctx, item.type, drawX - this.cameraX, drawY, item.w, item.h);
        }
      });

      // Draw flagpole rope/ball
      const flagX = 198 * 16 + 8 - this.cameraX;
      // Draw green ball on top
      this.ctx.fillStyle = '#00a215';
      this.ctx.beginPath();
      this.ctx.arc(flagX, 3 * 16 - 4, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw black pole
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(flagX, 3 * 16);
      this.ctx.lineTo(flagX, 12 * 16);
      this.ctx.stroke();

      // Flag visual moving down with Mario flagpole slide
      const flagY = (this.mario.state === 'flag_slide') ? Math.min(11 * 16, this.mario.y) : 3 * 16;
      graphics.draw(this.ctx, 'star', flagX - 16, flagY, false, 0.8, 0.8); // Green star-like flag outline
    }

    // Draw Tiles (Floor, Bricks, Question Blocks, Pipes)
    const startCol = Math.floor(this.cameraX / 16);
    const endCol = Math.floor((this.cameraX + 256) / 16) + 1;
    
    for (let r = 0; r < this.map.rows; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.map.getTile(c, r);
        if (tile) {
          const tx = c * 16 - this.cameraX;
          const ty = r * 16;
          
          const details = this.map.blockDetails[`${c}_${r}`];
          const bounceOffset = (details) ? details.yOffset : 0;
          
          // Animate question blocks flashing
          let tileSkin = tile;
          if (tile === 'question') {
            const flashFrame = Math.floor(Date.now() / 150) % 3;
            tileSkin = `question${flashFrame + 1}`;
          }

          if (tileSkin.startsWith('pipe_')) {
            // Standard vector shiny pipes
            if (tileSkin === 'pipe_top_left') {
              graphics.drawPipe(this.ctx, tx, ty, 32, 240, true);
            }
          } 
          else if (tileSkin !== 'pipe_top_right' && tileSkin !== 'pipe_body_left' && tileSkin !== 'pipe_body_right') {
            // Standard blocks
            graphics.draw(this.ctx, tileSkin, tx, ty + bounceOffset);
          }
          
          // Dampen block bounce offset slowly
          if (details && details.yOffset < 0) {
            details.yOffset += 0.5;
          }
        }
      }
    }

    // Draw Power-ups
    this.powerups.forEach(pw => pw.draw(this.ctx, this.cameraX));

    // Draw Enemies
    this.enemies.forEach(enemy => enemy.draw(this.ctx, this.cameraX));

    // Draw Player (Mario)
    this.mario.draw(this.ctx, this.cameraX);

    // Draw Particles
    this.particles.forEach(p => p.draw(this.ctx, this.cameraX));

    // Render HUD Text
    this.renderHUD();
  }

  renderHUD() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '8px "Press Start 2P"';
    
    // Line 1 Labels
    this.ctx.fillText('MARIO', 16, 16);
    this.ctx.fillText('COINS', 84, 16);
    this.ctx.fillText('WORLD', 148, 16);
    this.ctx.fillText('TIME', 208, 16);
    
    // Line 2 Values
    this.ctx.fillText(this.score.toString().padStart(6, '0'), 16, 26);
    this.ctx.fillText(`x${this.coins.toString().padStart(2, '0')}`, 84, 26);
    this.ctx.fillText(this.world, 156, 26);
    this.ctx.fillText(this.time.toString().padStart(3, '0'), 208, 26);
  }
}

// Boot game when window finishes loading
window.addEventListener('load', () => {
  window.game = new GameController();
});
