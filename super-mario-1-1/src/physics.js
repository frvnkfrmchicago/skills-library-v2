// Physics and AABB Collision Resolution for Super Mario Bros. 1-1
export class Physics {
  // Check if two rectangles overlap
  static collides(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  // Gets overlapping bounding box stats
  static getOverlap(r1, r2) {
    const overlapX = Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x);
    const overlapY = Math.min(r1.y + r1.height, r2.y + r2.height) - Math.max(r1.y, r2.y);
    return { x: overlapX, y: overlapY };
  }

  // Main entity collision resolution against static map tiles
  // Resolves X axis, then Y axis independently to prevent corner clipping bugs
  static resolveMapCollisions(entity, map, onBlockHitCallback = null) {
    entity.onGround = false;

    // ----------------------------------------------------
    // 1. Horizontal Phase
    // ----------------------------------------------------
    entity.x += entity.vx;
    
    // Bounds check
    if (entity.x < 0) {
      entity.x = 0;
      entity.vx = 0;
    }

    let colliders = map.getSurroundingSolidTiles(entity.x, entity.y, entity.width, entity.height);
    for (const tile of colliders) {
      if (this.collides(entity, tile)) {
        const overlap = this.getOverlap(entity, tile);
        if (overlap.x > 0) {
          // Push out along X
          if (entity.vx > 0) {
            entity.x -= overlap.x;
            entity.vx = 0;
            entity.collidedWall = 'right';
          } else if (entity.vx < 0) {
            entity.x += overlap.x;
            entity.vx = 0;
            entity.collidedWall = 'left';
          }
        }
      }
    }

    // ----------------------------------------------------
    // 2. Vertical Phase
    // ----------------------------------------------------
    entity.y += entity.vy;
    
    colliders = map.getSurroundingSolidTiles(entity.x, entity.y, entity.width, entity.height);
    for (const tile of colliders) {
      if (this.collides(entity, tile)) {
        const overlap = this.getOverlap(entity, tile);
        if (overlap.y > 0) {
          // Push out along Y
          if (entity.vy > 0) {
            // Landing on top of a tile
            entity.y -= overlap.y;
            entity.vy = 0;
            entity.onGround = true;
          } else if (entity.vy < 0) {
            // Hitting bottom of a tile
            entity.y += overlap.y;
            entity.vy = 0;
            if (onBlockHitCallback) {
              onBlockHitCallback(tile);
            }
          }
        }
      }
    }
  }

  // Simple Entity-to-Entity collision check
  static checkEntityCollision(ent1, ent2) {
    if (this.collides(ent1, ent2)) {
      // Return intersection directions
      const overlap = this.getOverlap(ent1, ent2);
      if (overlap.x < overlap.y) {
        // Horizontal overlap is smaller
        return ent1.x + ent1.width / 2 < ent2.x + ent2.width / 2 ? 'right' : 'left';
      } else {
        // Vertical overlap is smaller
        return ent1.y + ent1.height / 2 < ent2.y + ent2.height / 2 ? 'bottom' : 'top';
      }
    }
    return null;
  }
}
export default Physics;
