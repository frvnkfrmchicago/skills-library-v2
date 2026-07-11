export class InputManager {
  constructor() {
    this.keys = {};
    this.justPressed = {};
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) this.justPressed[e.code] = true;
      this.keys[e.code] = true;
      e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  isDown(code) { return !!this.keys[code]; }

  wasJustPressed(code) {
    if (this.justPressed[code]) {
      this.justPressed[code] = false;
      return true;
    }
    return false;
  }

  /**
   * Player 1 controls — all on left side of keyboard:
   *   A/D        = Move left/right
   *   W          = Jump
   *   S          = Block
   *   J          = Punch
   *   K          = Kick
   *   L          = Grab/Throw
   *   U          = Fireball       (25 SP)
   *   I          = Uppercut       (40 SP)
   *   O          = Ground Slam    (50 SP)
   *   Shift      = Dash
   */
  getP1() {
    return {
      left: this.isDown('KeyA'),
      right: this.isDown('KeyD'),
      jump: this.wasJustPressed('KeyW'),
      block: this.isDown('KeyS'),
      punch: this.wasJustPressed('KeyJ'),
      kick: this.wasJustPressed('KeyK'),
      grab: this.wasJustPressed('KeyL'),
      fireball: this.wasJustPressed('KeyU'),
      uppercut: this.wasJustPressed('KeyI'),
      groundSlam: this.wasJustPressed('KeyO'),
      dash: this.wasJustPressed('ShiftLeft') || this.wasJustPressed('ShiftRight'),
      charge: this.isDown('Space'),
    };
  }
}

export function applyInput(fighter, input, opponent, scene) {
  if (!fighter || !opponent) return;

  const speed = fighter.moveSpeed || 0.08;

  if (fighter.state !== 'hit' && !fighter.isGrabbed) {
    if (input.left) fighter.x -= speed;
    if (input.right) fighter.x += speed;

    if ((input.left || input.right) && fighter.state === 'idle') {
      fighter.setFrame('walk');
    } else if (!input.left && !input.right && fighter.state === 'idle') {
      fighter.setFrame('idle');
    }
  }

  if (input.jump) fighter.jump();
  fighter.block(input.block);
  if (input.punch) fighter.punch();
  if (input.kick) fighter.kick();
  if (input.grab) fighter.grab(opponent);
  if (input.dash) fighter.dash();
  if (input.fireball) fighter.fireball(scene);
  if (input.uppercut) fighter.uppercut();
  if (input.groundSlam) fighter.groundSlam(scene);
  fighter.charge(!!input.charge);
}
