import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

export class Fighter {
  /**
   * @param {object} opts
   * @param {object} opts.config - from roster.js
   * @param {object} opts.spriteData - { textures, frameW, frameH, model, clips, is3D }
   * @param {number} opts.x - starting X position
   * @param {number} opts.facing - 1 (right) or -1 (left)
   */
  constructor({ config, spriteData, x, facing }) {
    this.config = config;
    this.name = config.name;
    this.color = config.color;
    this.facing = facing;
    this.x = x;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;

    // Stats affect gameplay
    this.moveSpeed = 0.04 + config.stats.speed * 0.006;
    this.damageMult = 0.7 + config.stats.power * 0.06;
    this.defenseMult = 1.0 - config.stats.defense * 0.04;

    this.health = 100;
    this.maxHealth = 100;
    this.special = 0;
    this.maxSpecial = 100;
    this.state = 'idle';
    this.stateTimer = 0;
    this.isGrounded = true;
    this.isBlocking = false;
    this.attackHitbox = null;
    this.hitCooldown = 0;
    this.comboCount = 0;
    this.lastHitTime = 0;
    this.isGrabbed = false;
    this.grabTarget = null;
    this.dashCooldown = 0;
    this.wins = 0;
    this._wasHit = false;
    this._hitDamage = 0;
    this.isCharging = false;
    this.projectiles = [];

    this.is3D = !!spriteData.is3D;
    this.charHeight = 3.0; // world units tall

    if (this.is3D) {
      // 3D Skeletal Mesh Initialization
      this.model = SkeletonUtils.clone(spriteData.model);
      this.mixer = new THREE.AnimationMixer(this.model);
      this.clips = spriteData.clips;
      this.currentAction = null;

      // Group as standard container mesh
      this.mesh = new THREE.Group();
      this.mesh.add(this.model);
      this.mesh.position.set(x, 0.02, 0);
      this.mesh.rotation.y = this.facing > 0 ? Math.PI / 2 : -Math.PI / 2;

      // Dummy material to satisfy state opacity fades elsewhere
      this.material = new THREE.MeshBasicMaterial({ visible: false, transparent: true });

      // Automatically launch idle animation
      this.play3DAnimation('idle');
    } else {
      // 2D Sprite Plane Initialization
      this.textures = spriteData.textures;
      this.frameMap = config.frames;

      const aspect = spriteData.frameW / spriteData.frameH;
      const charWidth = this.charHeight * aspect;

      this.material = new THREE.MeshBasicMaterial({
        map: this.textures[this.frameMap.idle],
        transparent: true,
        alphaTest: 0.05,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const geo = new THREE.PlaneGeometry(charWidth, this.charHeight);
      this.mesh = new THREE.Mesh(geo, this.material);
      this.mesh.position.set(x, this.charHeight / 2, 0);
      this.mesh.renderOrder = 10;
    }

    // Shadow
    const shadowWidth = this.is3D ? 1.5 : (this.charHeight * (spriteData.frameW / spriteData.frameH) * 0.7);
    const shadowGeo = new THREE.PlaneGeometry(shadowWidth, 0.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, transparent: true, opacity: 0.3,
    });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.set(x, 0.02, 0.2);
  }

  addToScene(scene) {
    scene.add(this.mesh);
    scene.add(this.shadow);
  }

  removeFromScene(scene) {
    scene.remove(this.mesh);
    scene.remove(this.shadow);
    this.projectiles.forEach(p => p.removeFromScene());
    this.projectiles = [];
  }

  setFrame(state) {
    if (this.is3D) {
      this.play3DAnimation(state);
      return;
    }
    if (this._animControlled) return;
    const idx = this.frameMap[state];
    const frameIdx = idx !== undefined ? idx : this.frameMap.idle;
    if (frameIdx < this.textures.length) {
      this.material.map = this.textures[frameIdx];
      this.material.needsUpdate = true;
    }
  }

  setState(s, duration = 0) {
    if (this.state === 'hit' && this.stateTimer > 0 && s !== 'idle') return;
    if (this.isGrabbed && s !== 'hit' && s !== 'idle') return;
    this.state = s;
    this.stateTimer = duration;
  }

  // ── 3D Skeletal Animation Core Loop ──
  play3DAnimation(stateName) {
    if (!this.is3D || !this.mixer) return;

    const clipName = this._getClipName(stateName);
    const clip = this.clips[clipName] || this.clips['idle'];
    if (!clip) return;

    const action = this.mixer.clipAction(clip);

    if (this.currentAction === action) {
      return;
    }

    if (['punch', 'kick', 'hit', 'hurt', 'fireball', 'special'].includes(stateName)) {
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
    } else {
      action.setLoop(THREE.LoopRepeat);
    }

    action.reset();
    action.play();

    if (this.currentAction) {
      this.currentAction.crossFadeTo(action, 0.15, true);
    }

    this.currentAction = action;
  }

  _getClipName(stateName) {
    const map = {
      idle: 'idle',
      walk: 'walk',
      punch: 'punch',
      kick: 'kick',
      block: 'block',
      hit: 'hurt',
      hurt: 'hurt',
      fireball: 'special',
      special: 'special',
      victory: 'victory'
    };
    const mapped = map[stateName] || stateName;
    const keys = Object.keys(this.clips);
    const match = keys.find(k => k.toLowerCase() === mapped.toLowerCase());
    return match || mapped;
  }

  // ── Attacks ──
  punch() {
    if (this._busy()) return;
    this.setState('punch', 16);
    const dmg = Math.round(8 * this.damageMult);
    this.attackHitbox = { ox: this.facing * 1.0, w: 1.3, dmg, kb: 0.12 };
  }

  kick() {
    if (this._busy()) return;
    this.setState('kick', 22);
    const dmg = Math.round(13 * this.damageMult);
    this.attackHitbox = { ox: this.facing * 1.2, w: 1.5, dmg, kb: 0.22 };
  }

  grab(opponent) {
    if (this._busy()) return;
    const d = Math.abs(this.x - opponent.x);
    if (d < 1.8 && !opponent.isBlocking && !opponent.isGrabbed) {
      this.setState('grab', 30);
      opponent.isGrabbed = true;
      opponent.grabTarget = this;
      setTimeout(() => {
        if (opponent.isGrabbed) {
          const dmg = Math.round(18 * this.damageMult);
          opponent.takeDamage(dmg, this.facing * 0.4);
          opponent.vy = 0.18;
          opponent.isGrounded = false;
          opponent.isGrabbed = false;
          opponent.grabTarget = null;
          this.special = Math.min(this.maxSpecial, this.special + 15);
        }
      }, 400);
    }
  }

  dash() {
    if (this.dashCooldown > 0 || !this.isGrounded) return;
    this.vx = this.facing * 0.5;
    this.dashCooldown = 30;
    this.setState('walk', 8);
  }

  charge(active) {
    this.isCharging = active && !this._busy() && this.isGrounded;
    if (this.isCharging) {
      this.special = Math.min(this.maxSpecial, this.special + 2);
    }
  }

  // ── Supers ──
  fireball(scene) {
    const spec = this.config.specials.find(s => s.type === 'fireball');
    if (!spec || this.special < spec.cost || this._busy()) return;
    this.special -= spec.cost;
    this.setState('fireball', 20);
    setTimeout(() => {
      const p = new Projectile({
        x: this.x + this.facing * 1.5, y: this.charHeight / 2,
        vx: this.facing * 0.22, dmg: Math.round(spec.damage * this.damageMult),
        color: this.color, owner: this,
      });
      p.addToScene(scene);
      this.projectiles.push(p);
    }, 180);
  }

  uppercut() {
    const spec = this.config.specials.find(s => s.type === 'uppercut');
    if (!spec || this.special < spec.cost || this._busy()) return;
    this.special -= spec.cost;
    this.setState('special', 25);
    this.vy = 0.24;
    this.isGrounded = false;
    const dmg = Math.round(spec.damage * this.damageMult);
    this.attackHitbox = { ox: this.facing * 0.8, w: 1.6, dmg, kb: 0.3 };
  }

  groundSlam(scene) {
    const spec = this.config.specials.find(s => s.type === 'groundSlam');
    if (!spec || this.special < spec.cost || this._busy()) return;
    this.special -= spec.cost;
    this.setState('special', 30);
    setTimeout(() => {
      const w = new Shockwave({
        x: this.x, scene, color: this.color,
        dmg: Math.round(spec.damage * this.damageMult),
      });
      this.projectiles.push(w);
    }, 280);
  }

  block(active) {
    if (this._busy()) return;
    this.isBlocking = active;
    if (active) this.setState('block');
    else if (this.state === 'block') this.setState('idle');
  }

  jump() {
    if (!this.isGrounded) return;
    this.vy = 0.26;
    this.isGrounded = false;
  }

  takeDamage(dmg, kb) {
    if (this.isBlocking) {
      dmg = Math.floor(dmg * 0.12 * this.defenseMult);
      kb *= 0.25;
    } else {
      dmg = Math.floor(dmg * this.defenseMult);
    }
    this.health = Math.max(0, this.health - dmg);
    this.setState('hit', 14);
    this.vx = kb;
    this.hitCooldown = 18;
    this._wasHit = true;
    this._hitDamage = dmg;
    this.isGrabbed = false;
    this.grabTarget = null;
  }

  _busy() {
    return ['punch', 'kick', 'hit', 'grab', 'fireball', 'special'].includes(this.state) && this.stateTimer > 0;
  }

  update(opponent) {
    if (this.stateTimer > 0) {
      this.stateTimer--;
      if (this.stateTimer <= 0) {
        this.attackHitbox = null;
        if (this.state !== 'block') this.setState('idle');
      }
    }
    if (this.hitCooldown > 0) this.hitCooldown--;
    if (this.dashCooldown > 0) this.dashCooldown--;

    if (this.isGrabbed && this.grabTarget) {
      this.x += (this.grabTarget.x + this.grabTarget.facing * 0.8 - this.x) * 0.3;
    }

    // Melee hit detection
    if (this.attackHitbox && this.stateTimer > 6 && opponent.hitCooldown <= 0) {
      const hx = this.x + this.attackHitbox.ox;
      if (Math.abs(hx - opponent.x) < this.attackHitbox.w) {
        opponent.takeDamage(this.attackHitbox.dmg, this.facing * this.attackHitbox.kb);
        this.attackHitbox = null;
        this.special = Math.min(this.maxSpecial, this.special + 8);
        const now = Date.now();
        this.comboCount = (now - this.lastHitTime < 600) ? this.comboCount + 1 : 1;
        this.lastHitTime = now;
      }
    }

    // Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      this.projectiles[i].update(opponent);
      if (this.projectiles[i].dead) {
        this.projectiles[i].removeFromScene();
        this.projectiles.splice(i, 1);
      }
    }

    // Gravity
    if (!this.isGrounded) {
      this.vy -= 0.013;
      this.y += this.vy;
      if (this.y <= 0) { this.y = 0; this.vy = 0; this.isGrounded = true; }
    }

    // Velocity + friction
    this.x += this.vx;
    this.vx *= 0.86;

    if (opponent) this.facing = opponent.x > this.x ? 1 : -1;
    this.x = Math.max(-8, Math.min(8, this.x));

    // Mesh position and rotation (grounding & orientation)
    if (this.is3D) {
      this.mesh.position.x = this.x;
      this.mesh.position.y = this.y * 4 + 0.02; // grounded accurately
      this.mesh.rotation.y = this.facing > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      this.mesh.position.x = this.x;
      this.mesh.position.y = this.charHeight / 2 + this.y * 4;
      this.mesh.scale.x = this.facing > 0 ? 1 : -1;
    }

    // Blinking opacity logic (with deep 3D child mesh material updates)
    const targetOpacity = this.state === 'hit'
      ? (Math.sin(Date.now() * 0.03) > 0 ? 1.0 : 0.3)
      : (this.isCharging ? (0.7 + Math.sin(Date.now() * 0.015) * 0.3) : 1.0);

    this.material.opacity = targetOpacity;

    if (this.is3D) {
      this.model.traverse(child => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(mat => {
            mat.transparent = true;
            mat.opacity = targetOpacity;
          });
        }
      });
    }

    // Shadow
    this.shadow.position.x = this.x;
    this.shadow.scale.set(1 - this.y * 0.4, 1, 1);
    this.shadow.material.opacity = 0.3 - this.y * 0.1;
  }

  get healthPercent() { return this.health / this.maxHealth; }
  get specialPercent() { return this.special / this.maxSpecial; }

  reset(x) {
    this.x = x; this.y = 0; this.vx = 0; this.vy = 0;
    this.health = this.maxHealth; this.special = 0;
    this.state = 'idle'; this.stateTimer = 0;
    this.isGrounded = true; this.isBlocking = false;
    this.attackHitbox = null; this.hitCooldown = 0;
    this.comboCount = 0; this.isGrabbed = false;
    this.grabTarget = null; this.dashCooldown = 0;
    
    if (this.is3D) {
      if (this.currentAction) {
        this.currentAction.stop();
        this.currentAction = null;
      }
      this.play3DAnimation('idle');
    } else {
      this.setFrame('idle');
    }

    this.projectiles.forEach(p => p.removeFromScene());
    this.projectiles = [];
  }
}

// ── Projectile ──
class Projectile {
  constructor({ x, y, vx, dmg, color, owner }) {
    this.x = x; this.y = y; this.vx = vx;
    this.dmg = dmg; this.owner = owner;
    this.dead = false; this.life = 120; this.scene = null;
    const geo = new THREE.SphereGeometry(0.3, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(x, y, 0.5);
    const glowGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
    this.glow = new THREE.Mesh(glowGeo, glowMat);
    this.mesh.add(this.glow);
    this.light = new THREE.PointLight(color, 2, 5);
    this.mesh.add(this.light);
  }
  addToScene(s) { this.scene = s; s.add(this.mesh); }
  removeFromScene() {
    if (this.scene) { this.scene.remove(this.mesh); this.mesh.geometry.dispose(); this.mesh.material.dispose(); }
  }
  update(opp) {
    this.x += this.vx; this.mesh.position.x = this.x;
    this.mesh.rotation.z += 0.15;
    this.glow.scale.setScalar(1 + Math.sin(Date.now() * 0.02) * 0.2);
    this.life--;
    const dx = Math.abs(this.x - opp.x);
    const dy = Math.abs(this.y - (opp.charHeight / 2 + opp.y * 4));
    if (dx < 1.2 && dy < 1.5 && opp.hitCooldown <= 0) {
      opp.takeDamage(this.dmg, this.vx > 0 ? 0.3 : -0.3);
      this.owner.special = Math.min(this.owner.maxSpecial, this.owner.special + 10);
      this.dead = true;
    }
    if (Math.abs(this.x) > 12 || this.life <= 0) this.dead = true;
  }
}

// ── Shockwave ──
class Shockwave {
  constructor({ x, scene, color, dmg }) {
    this.x = x; this.dmg = dmg; this.scene = scene;
    this.dead = false; this.radius = 0.5; this.maxR = 5; this.hasHit = false;
    const geo = new THREE.RingGeometry(0.3, 0.5, 32);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.x = -Math.PI / 2; this.mesh.position.set(x, 0.1, 0);
    scene.add(this.mesh);
    this.light = new THREE.PointLight(color, 3, 8);
    this.light.position.set(x, 0.5, 0); scene.add(this.light);
  }
  removeFromScene() {
    this.scene.remove(this.mesh); this.scene.remove(this.light);
    this.mesh.geometry.dispose(); this.mesh.material.dispose();
  }
  update(opp) {
    this.radius += 0.15; this.mesh.scale.setScalar(this.radius * 2);
    this.mesh.material.opacity = 1 - this.radius / this.maxR;
    this.light.intensity = 3 * (1 - this.radius / this.maxR);
    if (!this.hasHit && Math.abs(this.x - opp.x) < this.radius && opp.hitCooldown <= 0 && opp.isGrounded) {
      opp.takeDamage(this.dmg, (opp.x - this.x) > 0 ? 0.35 : -0.35);
      opp.vy = 0.2; opp.isGrounded = false; this.hasHit = true;
    }
    if (this.radius >= this.maxR) this.dead = true;
  }
}
