// Map Layout Representation for Super Mario Bros. World 1-1
export class GameMap {
  constructor() {
    this.tileSize = 16;
    this.cols = 224; // World width in tiles
    this.rows = 15;  // World height in tiles
    
    this.skyColor = '#5c94fc'; // Classic NES sky blue
    this.undergroundColor = '#000000'; // Black
    
    this.currentArea = 'overworld'; // 'overworld' or 'underground'
    
    // Grid representations
    this.grid = [];
    this.undergroundGrid = [];
    
    // Map objects for query blocks and items
    // Format: {col_row: { type: 'question', content: 'mushroom', hit: false }}
    this.blockDetails = {};
    
    this.scenery = [];
    
    this.initMap();
  }

  initMap() {
    // 1. Initialize grid with empty spaces
    this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
    this.undergroundGrid = Array(this.rows).fill(null).map(() => Array(30).fill(null));
    
    // 2. Build Overworld Ground
    // World 1-1 has 3 bottomless pits: cols 69-70, 86-87, and 153-154.
    for (let c = 0; c < this.cols; c++) {
      if ((c >= 69 && c <= 70) || (c >= 86 && c <= 87) || (c >= 153 && c <= 154)) {
        continue; // Bottomless pits!
      }
      this.grid[13][c] = 'ground';
      this.grid[14][c] = 'ground';
    }

    // 3. Build Pipes
    // Format: [col, height, leadsToUnderground?]
    const pipes = [
      [28, 2, false],
      [38, 3, false],
      [46, 4, false],
      [57, 4, true],   // Crouch down to warp underground!
      [163, 2, false],
      [179, 2, false]
    ];
    pipes.forEach(([col, height, warp]) => {
      this.grid[13 - height][col] = 'pipe_top_left';
      this.grid[13 - height][col + 1] = 'pipe_top_right';
      
      // Save warp property on the top-left tile of Pipe 4
      if (warp) {
        this.blockDetails[`${col}_${13 - height}`] = { warp: true };
      }
      
      for (let h = 1; h < height; h++) {
        this.grid[13 - height + h][col] = 'pipe_body_left';
        this.grid[13 - height + h][col + 1] = 'pipe_body_right';
      }
    });

    // 4. Build Question Blocks and Bricks
    // [col, row, type, content]
    const blockList = [
      // First structure
      [16, 9, 'question', 'coin'],
      [20, 9, 'brick', 'none'],
      [21, 9, 'question', 'mushroom'],
      [22, 9, 'brick', 'none'],
      [22, 5, 'question', 'coin'],
      [23, 9, 'question', 'coin'],
      [24, 9, 'brick', 'none'],

      // Long block run over pits
      [77, 9, 'brick', 'none'],
      [78, 9, 'question', 'coin'],
      [79, 9, 'brick', 'none'],
      [80, 5, 'brick', 'none'],
      [81, 5, 'brick', 'none'],
      [82, 5, 'brick', 'none'],
      [83, 5, 'brick', 'none'],
      [84, 5, 'brick', 'none'],
      [85, 5, 'brick', 'none'],
      [86, 5, 'brick', 'none'],
      [87, 5, 'brick', 'none'],
      
      [91, 5, 'brick', 'none'],
      [92, 5, 'brick', 'none'],
      [93, 5, 'question', 'coin'],
      [94, 9, 'brick', 'none'],
      [94, 5, 'brick', 'none'], // Hidden block on NES, let's make it standard brick
      [109, 5, 'question', 'mushroom'],
      [118, 9, 'brick', 'none'],
      [121, 5, 'brick', 'none'],
      [122, 5, 'brick', 'none'],
      [123, 5, 'brick', 'none'],
      [128, 5, 'brick', 'none'],
      [129, 5, 'question', 'coin'],
      [130, 5, 'question', 'coin'],
      [131, 5, 'brick', 'none'],
      [129, 9, 'brick', 'none'],
      [130, 9, 'brick', 'none']
    ];

    blockList.forEach(([col, row, type, content]) => {
      this.grid[row][col] = type;
      this.blockDetails[`${col}_${row}`] = {
        type: type,
        content: content,
        hit: false,
        yOffset: 0 // Used for block bounce animation
      };
    });

    // 5. Build Stair Pyramids
    // Stair 1 (facing right)
    this.buildStairs(134, 4, true);
    // Stair 2 (facing left)
    this.buildStairs(140, 4, false);
    
    // Stair 3 & 4 (pit dividers)
    this.buildStairs(148, 4, true, true);
    this.buildStairs(155, 4, false, true);

    // Final Stair 5 (flagpole pyramid)
    this.buildStairs(181, 8, true);
    // Extra base block at bottom right of flagpole pyramid
    this.grid[12][189] = 'solid';

    // Flagpole base block
    this.grid[12][198] = 'solid';

    // 6. Build Background Scenery (clouds, hills, bushes)
    this.scenery = [
      { type: 'hill_large', col: 0, row: 11, w: 80, h: 32 },
      { type: 'hill_small', col: 16, row: 12, w: 48, h: 16 },
      { type: 'bush', col: 11, row: 12, w: 32, h: 16 },
      { type: 'cloud', col: 8, row: 3, w: 48, h: 24 },
      { type: 'cloud', col: 19, row: 2, w: 48, h: 24 },

      { type: 'hill_large', col: 48, row: 11, w: 80, h: 32 },
      { type: 'hill_small', col: 64, row: 12, w: 48, h: 16 },
      { type: 'bush', col: 59, row: 12, w: 32, h: 16 },
      { type: 'cloud', col: 56, row: 3, w: 48, h: 24 },

      { type: 'hill_large', col: 96, row: 11, w: 80, h: 32 },
      { type: 'hill_small', col: 112, row: 12, w: 48, h: 16 },
      { type: 'bush', col: 107, row: 12, w: 32, h: 16 },
      { type: 'cloud', col: 104, row: 3, w: 48, h: 24 },
      
      { type: 'hill_large', col: 144, row: 11, w: 80, h: 32 },
      { type: 'hill_small', col: 160, row: 12, w: 48, h: 16 },
      { type: 'bush', col: 155, row: 12, w: 32, h: 16 },
      { type: 'cloud', col: 152, row: 3, w: 48, h: 24 },

      { type: 'castle', col: 202, row: 8, w: 80, h: 80 } // The end castle!
    ];

    // ----------------------------------------------------
    // 7. Initialize Underground Bonus Area
    // ----------------------------------------------------
    // Build solid walls around the 30x15 space
    for (let c = 0; c < 30; c++) {
      this.undergroundGrid[13][c] = 'solid'; // ground
      this.undergroundGrid[14][c] = 'solid';
      this.undergroundGrid[0][c] = 'solid';  // ceiling
      if (c === 0 || c === 29) {
        for (let r = 0; r < 15; r++) {
          this.undergroundGrid[r][c] = 'solid'; // walls
        }
      }
    }

    // Warp-out pipe (leading back to overworld col 163)
    this.undergroundGrid[11][24] = 'pipe_top_left';
    this.undergroundGrid[11][25] = 'pipe_top_right';
    this.undergroundGrid[12][24] = 'pipe_body_left';
    this.undergroundGrid[12][25] = 'pipe_body_right';
    this.blockDetails[`24_11_underground`] = { warpOut: true };

    // Solid blocks supporting coins
    for (let c = 8; c <= 17; c++) {
      this.undergroundGrid[9][c] = 'solid';
    }

    // Place underground coins
    for (let c = 9; c <= 16; c++) {
      for (let r = 5; r <= 7; r++) {
        this.undergroundGrid[r][c] = 'coin_static';
      }
    }
  }

  // Pyramid stair building helper
  buildStairs(startCol, height, faceRight, hasFlatTop = false) {
    for (let h = 1; h <= height; h++) {
      const colWidth = height - h + 1;
      const colStart = faceRight ? startCol + h - 1 : startCol + (height - h);
      
      // Draw a vertical row of solid tiles
      for (let c = colStart; c < colStart + (hasFlatTop ? 1 : colWidth); c++) {
        for (let r = 13 - h; r < 13; r++) {
          this.grid[r][c] = 'solid';
        }
      }
    }
  }

  // Get tile info by tile grid coordinates
  getTile(col, row) {
    if (col < 0 || row < 0 || row >= this.rows) return null;
    
    if (this.currentArea === 'underground') {
      if (col >= 30) return null;
      return this.undergroundGrid[row][col];
    }
    
    if (col >= this.cols) return null;
    return this.grid[row][col];
  }

  // Set tile info by tile grid coordinates
  setTile(col, row, type) {
    if (col < 0 || row < 0 || row >= this.rows) return;
    
    if (this.currentArea === 'underground') {
      if (col < 30) this.undergroundGrid[row][col] = type;
    } else {
      if (col < this.cols) this.grid[row][col] = type;
    }
  }

  // Helper used by physics collision check to query neighboring solids
  getSurroundingSolidTiles(px, py, width, height) {
    const startCol = Math.floor(px / this.tileSize) - 1;
    const endCol = Math.floor((px + width) / this.tileSize) + 1;
    const startRow = Math.floor(py / this.tileSize) - 1;
    const endRow = Math.floor((py + height) / this.tileSize) + 1;
    
    const solidTiles = [];
    
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.getTile(c, r);
        if (tile && tile !== 'coin_static') {
          // It's solid! ground, pipe, solid, bricks, questions
          solidTiles.push({
            x: c * this.tileSize,
            y: r * this.tileSize,
            width: this.tileSize,
            height: this.tileSize,
            col: c,
            row: r,
            type: tile
          });
        }
      }
    }
    
    return solidTiles;
  }
}
export default GameMap;
