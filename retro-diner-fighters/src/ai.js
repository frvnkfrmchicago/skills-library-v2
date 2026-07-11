/**
 * AI Controller — makes P2 fight back intelligently.
 * Reads game state and returns an input object like a human player would.
 */
export class AIController {
  constructor(difficulty = 0.35) {
    this.difficulty = difficulty;
    this.actionCooldown = 0;
    this.thinkTimer = 0;
    this.currentAction = 'idle';
    this.retreatTimer = 0;
  }

  getInput(fighter, opponent) {
    const input = {
      left: false, right: false, jump: false, block: false,
      punch: false, kick: false, grab: false,
      fireball: false, uppercut: false, groundSlam: false, dash: false,
    };

    if (!fighter || !opponent) return input;

    const dist = Math.abs(fighter.x - opponent.x);
    const facingRight = opponent.x > fighter.x;
    const opponentAttacking = ['punch', 'kick', 'special', 'fireball'].includes(opponent.state);
    const lowHealth = fighter.healthPercent < 0.3;
    const hasSpecial = fighter.special >= 25;

    // Cooldown between actions so AI doesn't spam
    if (this.actionCooldown > 0) {
      this.actionCooldown--;
      return input;
    }

    // Think interval — slower so player has time
    this.thinkTimer++;
    const thinkRate = Math.floor(20 - this.difficulty * 8); // 12-20 frames between decisions
    if (this.thinkTimer < thinkRate) return input;
    this.thinkTimer = 0;

    const rand = Math.random();

    // ── BLOCKING — react to incoming attacks ──
    if (opponentAttacking && dist < 2.5 && rand < this.difficulty * 0.6) {
      input.block = true;
      this.actionCooldown = 20;
      return input;
    }

    // ── CLOSE RANGE (< 2.0) — melee attacks ──
    if (dist < 2.0) {
      if (rand < 0.25) {
        input.punch = true;
        this.actionCooldown = 30;
      } else if (rand < 0.45) {
        input.kick = true;
        this.actionCooldown = 35;
      } else if (rand < 0.55 && dist < 1.5) {
        input.grab = true;
        this.actionCooldown = 50;
      } else if (rand < 0.65 && hasSpecial && fighter.special >= 40) {
        input.uppercut = true;
        this.actionCooldown = 45;
      } else if (rand < 0.88) {
        // Retreat
        input.left = !facingRight;
        input.right = facingRight;
        this.actionCooldown = 10;
      } else {
        input.block = true;
        this.actionCooldown = 15;
      }
      return input;
    }

    // ── MID RANGE (2.0 - 5.0) — approach or use projectiles ──
    if (dist < 5.0) {
      if (rand < 0.35) {
        // Approach
        input.left = !facingRight;
        input.right = facingRight;
        this.actionCooldown = 6;
      } else if (rand < 0.55 && hasSpecial) {
        input.fireball = true;
        this.actionCooldown = 25;
      } else if (rand < 0.7) {
        input.dash = true;
        this.actionCooldown = 12;
      } else if (rand < 0.8 && hasSpecial && fighter.special >= 50 && lowHealth) {
        input.groundSlam = true;
        this.actionCooldown = 35;
      } else {
        // Approach
        input.left = !facingRight;
        input.right = facingRight;
        this.actionCooldown = 8;
      }
      return input;
    }

    // ── FAR RANGE (> 5.0) — close the gap ──
    if (rand < 0.6) {
      input.left = !facingRight;
      input.right = facingRight;
      this.actionCooldown = 4;
    } else if (rand < 0.8 && hasSpecial) {
      input.fireball = true;
      this.actionCooldown = 25;
    } else {
      input.dash = true;
      this.actionCooldown = 10;
    }

    return input;
  }
}
