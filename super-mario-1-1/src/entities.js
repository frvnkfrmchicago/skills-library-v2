// Active Game Entities for Super Mario Bros. 1-1
import { Physics } from './physics.js';
import { audio } from './audio.js';
import { graphics } from './graphics.js';

// Base Entity Class
class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.alive = true;
  }

  update(map) {
    // Basic gravity & bounds
    this.vy += 0.2; // Gravity
    if (this.vy > 6) this.vy = 6; // Terminal velocity
  }

  draw(ctx, cameraX) {
    // Implemented in subclasses
  }
}

// ----------------------------------------------------
// MARIO (PLAYER)
// ----------------------------------------------------
export class Mario extends Entity {
  constructor(x, y) {
    super(x, y, 12, 14); // Collision box slightly smaller than 16x16
    this.size = 'small'; // 'small' or 'big'
    this.facing = 'right';
    this.state = 'normal'; // 'normal', 'pipe_enter', 'pipe_exit', 'flag_slide', 'walk_to_castle', 'dead'
    
    // Physics variables
    this.accel = 0.1;
    this.decel = 0.15;
    this.maxWalkSpeed = 1.6;
    this.maxRunSpeed = 2.8;
    this.jumpForce = -4.2;
    
    // Animation timers
    this.animTimer = 0;
    this.animFrame = 0;
    
    // Invincibility flashing timer
    this.invincibilityTimer = 0;
    
    // Growing/shrinking transition state locks
    this.transformTimer = 0;
    
    // Crouching/ducking state
    this.crouching = false;
    
    // Flagpole specific
    this.flagScoreAwarded = false;
    
    // Pipe transition specifics
    this.pipeWarpTimer = 0;
    this.targetPipeX = 0;
    this.targetPipeY = 0;
    this.pipeDirection = 'down'; // 'down' or 'up'
    this.warpTarget = null; // Coordinates where to teleport
  }

  jump(keysHeld) {
    if (this.onGround && this.state === 'normal' && !this.crouching) {
      this.vy = this.jumpForce;
      this.onGround = false;
      audio.playJump();
    }
  }

  takeDamage(game) {
    if (this.invincibilityTimer > 0 || this.state !== 'normal') return;
    
    if (this.size === 'big') {
      // Shrink to small
      this.size = 'small';
      this.y += 14; // Shift down so feet remain on the ground
      this.height = 14;
      audio.playTone(220, 'sine', 0.5, audio.ctx.currentTime, 0.15, 0.01);
      this.invincibilityTimer = 120; // 2 seconds flashing
      this.transformTimer = 30; // Pause game logic briefly
    } else {
      // Die
      this.die(game);
    }
  }

  die(game) {
    this.state = 'dead';
    this.vy = -4.5; // Upwards death hop
    this.vx = 0;
    this.alive = false;
    audio.playDeath();
    
    // Transition to GameOver / Restart after 3s
    setTimeout(() => {
      game.handlePlayerDeath();
    }, 3000);
  }

  update(map, keysHeld, game) {
    if (this.state === 'dead') {
      this.vy += 0.18; // Slower death gravity
      this.y += this.vy;
      return;
    }

    // Flashing countdown
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer--;
    }

    // Growing / Shrinking pause
    if (this.transformTimer > 0) {
      this.transformTimer--;
      return;
    }

    // Pipe entry animation logic
    if (this.state === 'pipe_enter') {
      this.pipeWarpTimer--;
      if (this.pipeDirection === 'down') {
        this.y += 0.5; // Slowly slide down
      } else if (this.pipeDirection === 'right') {
        this.x += 0.5;
      }
      
      if (this.pipeWarpTimer <= 0) {
        // Teleport to target
        game.executeWarp(this.warpTarget);
      }
      return;
    }

    // Pipe exit animation logic
    if (this.state === 'pipe_exit') {
      this.pipeWarpTimer--;
      if (this.pipeDirection === 'up') {
        this.y -= 0.5; // Slowly slide up out of pipe
      }
      
      if (this.pipeWarpTimer <= 0) {
        this.state = 'normal';
      }
      return;
    }

    // Flagpole sliding state
    if (this.state === 'flag_slide') {
      this.y += 1.5; // Slide down
      this.vx = 0;
      this.vy = 0;
      
      // Bottom of flag pole is around row 11 (y = 176px)
      if (this.y >= 180) {
        this.y = 180;
        this.state = 'walk_to_castle';
        // Flip to face right, jump down off base block
        this.facing = 'right';
        this.vx = 1.0;
        this.vy = 1.0;
      }
      return;
    }

    // Autopilot walk to castle
    if (this.state === 'walk_to_castle') {
      this.vy += 0.2; // Gravity
      this.vx = 0.8; // Move right
      
      // Resolve basic map collisions so we walk on the ground
      Physics.resolveMapCollisions(this, map);
      
      // Keep running animation active
      this.animTimer += 1;
      
      // Check if we reached the castle door (around column 205-206)
      const castleDoorX = 205 * 16 + 8;
      if (this.x >= castleDoorX) {
        this.vx = 0;
        // Fade out
        game.triggerLevelClear();
      }
      return;
    }

    // ----------------------------------------------------
    // Normal Controls & Physics
    // ----------------------------------------------------
    // Gravity
    this.vy += 0.22;
    // Jump height modulation (hold jump key to rise higher)
    if (this.vy < 0 && (keysHeld['Space'] || keysHeld['KeyW'] || keysHeld['ArrowUp'])) {
      this.vy -= 0.08; // Counter gravity slightly
    }
    if (this.vy > 5) this.vy = 5; // Terminal velocity limit

    // Crouch logic (Big Mario only)
    this.crouching = false;
    if (this.onGround && this.size === 'big' && (keysHeld['KeyS'] || keysHeld['ArrowDown'])) {
      this.crouching = true;
      this.height = 20; // Collision box shrinks when crouching
    } else if (this.size === 'big') {
      this.height = 28;
    }

    // Move Input
    const isRunning = keysHeld['ShiftLeft'] || keysHeld['KeyJ'];
    const maxSpeed = isRunning ? this.maxRunSpeed : this.maxWalkSpeed;
    
    let moveDir = 0;
    if (keysHeld['KeyA'] || keysHeld['ArrowLeft']) moveDir = -1;
    if (keysHeld['KeyD'] || keysHeld['ArrowRight']) moveDir = 1;

    // Apply movement speeds, sliding deceleration
    if (moveDir !== 0 && !this.crouching) {
      this.facing = moveDir > 0 ? 'right' : 'left';
      if (moveDir > 0) {
        if (this.vx < 0) this.vx += this.decel * 1.5; // Sliding stop when turning
        this.vx += this.accel;
        if (this.vx > maxSpeed) this.vx = maxSpeed;
      } else {
        if (this.vx > 0) this.vx -= this.decel * 1.5;
        this.vx -= this.accel;
        if (this.vx < -maxSpeed) this.vx = -maxSpeed;
      }
    } else {
      // Apply friction/drag
      if (this.vx > 0) {
        this.vx -= this.decel;
        if (this.vx < 0) this.vx = 0;
      } else if (this.vx < 0) {
        this.vx += this.decel;
        if (this.vx > 0) this.vx = 0;
      }
    }

    // Animation Tick
    if (this.vx !== 0 && this.onGround) {
      const animSpeed = isRunning ? 4 : 7;
      this.animTimer++;
      if (this.animTimer >= animSpeed) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 3;
      }
    } else {
      this.animFrame = 0;
    }

    // Save vertical velocity before resolving map collisions
    this.oldVy = this.vy;

    // Execute map collisions
    Physics.resolveMapCollisions(this, map, (tile) => {
      // Bottom block hit handler
      game.handleBlockHit(tile);
    });

    // Check down warp pipe transition
    if (this.onGround && this.crouching && (keysHeld['KeyS'] || keysHeld['ArrowDown'])) {
      // Mario must stand center-ish over the pipe
      const centerTileX = Math.floor((this.x + this.width / 2) / 16);
      const topTileY = Math.floor((this.y + this.height + 2) / 16);
      const warpBlock = map.blockDetails[`${centerTileX}_${topTileY}`] || map.blockDetails[`${centerTileX - 1}_${topTileY}`];
      
      if (warpBlock && warpBlock.warp) {
        // Warp pipe found!
        this.state = 'pipe_enter';
        this.pipeWarpTimer = 60; // 1 second sliding animation
        this.pipeDirection = 'down';
        this.vx = 0;
        this.vy = 0;
        this.x = centerTileX * 16 + 2; // Center Mario over the pipe width
        this.warpTarget = { area: 'underground', x: 2 * 16, y: 1 * 16 };
        audio.playTone(180, 'sine', 0.6, audio.ctx.currentTime, 0.15, 0.05);
      }
    }
  }

  draw(ctx, cameraX) {
    // If flashing, don't draw on alternate frames
    if (this.invincibilityTimer > 0 && Math.floor(this.invincibilityTimer / 4) % 2 === 0) {
      return;
    }

    const drawX = Math.floor(this.x - cameraX);
    const drawY = Math.floor(this.y);
    const isFlipped = this.facing === 'left';
    
    // Choose sprite frame
    let spriteName = 'mario_small_stand';
    
    if (this.size === 'small') {
      if (!this.onGround) {
        spriteName = 'mario_small_jump';
      } else if (this.vx !== 0) {
        // Check for sliding brakes frame
        const braking = (this.vx > 0 && (ctx.canvas.keysHeld?.['KeyA'] || ctx.canvas.keysHeld?.['ArrowLeft'])) || 
                        (this.vx < 0 && (ctx.canvas.keysHeld?.['KeyD'] || ctx.canvas.keysHeld?.['ArrowRight']));
        if (braking) {
          spriteName = 'mario_small_slide';
        } else {
          spriteName = `mario_small_walk${this.animFrame + 1}`;
        }
      } else {
        spriteName = 'mario_small_stand';
      }
      
      if (this.state === 'dead') {
        spriteName = 'mario_small_death';
      }
      
      // Draw small 16x16
      graphics.draw(ctx, spriteName, drawX, drawY - 2, isFlipped);
    } else {
      // Big Mario
      if (this.crouching) {
        spriteName = 'mario_big_duck';
      } else if (!this.onGround) {
        spriteName = 'mario_big_jump';
      } else if (this.vx !== 0) {
        const braking = (this.vx > 0 && (ctx.canvas.keysHeld?.['KeyA'] || ctx.canvas.keysHeld?.['ArrowLeft'])) || 
                        (this.vx < 0 && (ctx.canvas.keysHeld?.['KeyD'] || ctx.canvas.keysHeld?.['ArrowRight']));
        if (braking) {
          spriteName = 'mario_big_slide';
        } else {
          spriteName = `mario_big_walk${this.animFrame + 1}`;
        }
      } else {
        spriteName = 'mario_big_stand';
      }
      
      // Draw big 16x32 (aligned to bottom)
      // Standing height is 28 (draw at drawY - 4), crouching height is 20 (draw at drawY - 12)
      const yOffset = this.crouching ? -12 : -4;
      graphics.draw(ctx, spriteName, drawX, drawY + yOffset, isFlipped);
    }
  }
}

// ----------------------------------------------------
// GOOMBA ENEMY
// ----------------------------------------------------
export class Goomba extends Entity {
  constructor(x, y) {
    super(x, y, 14, 14);
    this.vx = -0.4;
    this.type = 'goomba';
    
    this.animTimer = 0;
    this.animFrame = 0;
    
    this.squishTimer = 0;
  }

  squish() {
    this.alive = false;
    this.squishTimer = 30; // Show flat goomba for 0.5 seconds
    this.vx = 0;
    this.vy = 0;
    audio.playStomp();
  }

  update(map) {
    super.update(map);

    if (this.squishTimer > 0) {
      this.squishTimer--;
      if (this.squishTimer <= 0) {
        this.alive = false;
      }
      return;
    }

    // Patrol move
    Physics.resolveMapCollisions(this, map);
    
    // Reverse patrol direction if hitting wall
    if (this.collidedWall === 'left') {
      this.vx = 0.4;
      this.collidedWall = null;
    } else if (this.collidedWall === 'right') {
      this.vx = -0.4;
      this.collidedWall = null;
    }

    // Alternate walking legs
    this.animTimer++;
    if (this.animTimer >= 12) {
      this.animTimer = 0;
      this.animFrame = 1 - this.animFrame;
    }
  }

  draw(ctx, cameraX) {
    const drawX = Math.floor(this.x - cameraX);
    const drawY = Math.floor(this.y);
    
    if (this.squishTimer > 0) {
      graphics.draw(ctx, 'goomba_flat', drawX, drawY - 2);
    } else {
      const spriteName = `goomba_walk${this.animFrame + 1}`;
      graphics.draw(ctx, spriteName, drawX, drawY - 2);
    }
  }
}

// ----------------------------------------------------
// KOOPA TROOPA ENEMY
// ----------------------------------------------------
export class KoopaTroopa extends Entity {
  constructor(x, y) {
    super(x, y, 14, 14); // Same collision box as Goomba to match 16x16 sprite size
    this.vx = -0.3;
    this.type = 'koopa';
    
    this.state = 'patrol'; // 'patrol', 'shell', 'shell_kicked'
    this.animTimer = 0;
    this.animFrame = 0;
  }

  hitByPlayer(player) {
    if (this.state === 'patrol') {
      // Turn into static shell
      this.state = 'shell';
      this.vx = 0;
      audio.playStomp();
      // Reposition player upwards for a bounce
      player.vy = -3.2;
    } 
    else if (this.state === 'shell') {
      // Kick it!
      this.state = 'shell_kicked';
      const playerCenter = player.x + player.width / 2;
      const koopaCenter = this.x + this.width / 2;
      this.vx = playerCenter < koopaCenter ? 3.5 : -3.5;
      audio.playStomp();
      player.vy = -2.0; // Small bounce
    }
    else if (this.state === 'shell_kicked') {
      // Stop it!
      this.state = 'shell';
      this.vx = 0;
      audio.playStomp();
      player.vy = -3.2;
    }
  }

  update(map) {
    super.update(map);

    Physics.resolveMapCollisions(this, map);
    
    // Reverse patrol direction if hitting wall
    if (this.collidedWall === 'left') {
      this.vx = Math.abs(this.vx);
      this.collidedWall = null;
    } else if (this.collidedWall === 'right') {
      this.vx = -Math.abs(this.vx);
      this.collidedWall = null;
    }

    if (this.state === 'patrol') {
      this.animTimer++;
      if (this.animTimer >= 12) {
        this.animTimer = 0;
        this.animFrame = 1 - this.animFrame;
      }
    }
  }

  draw(ctx, cameraX) {
    const drawX = Math.floor(this.x - cameraX);
    const drawY = Math.floor(this.y);
    
    if (this.state === 'patrol') {
      const spriteName = `koopa_walk${this.animFrame + 1}`;
      graphics.draw(ctx, spriteName, drawX, drawY - 2, this.vx > 0);
    } else {
      // Shell
      graphics.draw(ctx, 'koopa_shell', drawX, drawY - 2);
    }
  }
}

// ----------------------------------------------------
// POWER-UP ITEMS (MUSHROOM)
// ----------------------------------------------------
export class PowerUp extends Entity {
  constructor(x, y, type) {
    super(x, y, 14, 14);
    this.type = type; // 'mushroom'
    
    this.state = 'spawning'; // 'spawning', 'active'
    this.spawnTimer = 30;    // Slowly rises for 0.5s
    this.targetY = y - 16;
    
    this.vx = 0;
    this.vy = 0;
    
    audio.playPowerupReveal();
  }

  update(map) {
    if (this.state === 'spawning') {
      this.y -= 0.5; // Slowly rise
      this.spawnTimer--;
      if (this.spawnTimer <= 0) {
        this.state = 'active';
        this.vx = 0.8; // Slide rightwards
      }
      return;
    }

    // Normal slide physics
    super.update(map);
    Physics.resolveMapCollisions(this, map);
    
    // Turn around at walls
    if (this.collidedWall === 'left') {
      this.vx = 0.8;
      this.collidedWall = null;
    } else if (this.collidedWall === 'right') {
      this.vx = -0.8;
      this.collidedWall = null;
    }
  }

  draw(ctx, cameraX) {
    const drawX = Math.floor(this.x - cameraX);
    const drawY = Math.floor(this.y);
    
    // Draw at drawY - 2 so 16x16 sprite aligns perfectly with 14px physics box bottom
    graphics.draw(ctx, 'mushroom', drawX, drawY - 2);
  }
}

// ----------------------------------------------------
// PARTICLES & SPECIAL EFFECTS
// ----------------------------------------------------
export class Particle {
  constructor(x, y, type, options = {}) {
    this.x = x;
    this.y = y;
    this.type = type; // 'brick_shard', 'coin_spin', 'score_float'
    this.alive = true;
    
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    
    this.text = options.text || '';
    this.timer = options.timer || 30; // frames to live
    
    // For coin spins
    this.animFrame = 0;
  }

  update() {
    this.timer--;
    if (this.timer <= 0) {
      this.alive = false;
    }

    if (this.type === 'brick_shard') {
      this.vy += 0.22; // gravity on shard
      this.x += this.vx;
      this.y += this.vy;
    } 
    else if (this.type === 'coin_spin') {
      this.vy += 0.25; // gravity on coin
      this.x += this.vx;
      this.y += this.vy;
      
      this.animFrame = Math.floor(this.timer / 4) % 3;
    }
    else if (this.type === 'score_float') {
      this.y += this.vy; // Float straight up
    }
  }

  draw(ctx, cameraX) {
    const drawX = Math.floor(this.x - cameraX);
    const drawY = Math.floor(this.y);
    
    if (this.type === 'brick_shard') {
      ctx.fillStyle = '#b83400';
      ctx.fillRect(drawX, drawY, 4, 4);
    } 
    else if (this.type === 'coin_spin') {
      graphics.draw(ctx, `coin${this.animFrame + 1}`, drawX, drawY);
    }
    else if (this.type === 'score_float') {
      ctx.font = '6px "Press Start 2P"';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(this.text, drawX, drawY);
    }
  }
}
