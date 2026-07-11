// Procedural Pixel Art Sprite Renderer for Super Mario Bros. 1-1
// This draws 16x16 or 16x32 sprites onto the 2D canvas context.
class SpriteRenderer {
  constructor() {
    // NES Color Palette Mapping
    this.palette = {
      '.': 'transparent',
      'r': '#e60012', // Mario red / Fire flower red
      'b': '#002baf', // Mario overalls blue
      's': '#fce0a6', // Skin tone
      'h': '#9a4b00', // Hair, shoes, Goomba brown
      'w': '#ffffff', // White (clouds, eyes, flower)
      'y': '#f8b800', // Yellow (coins, question block shine)
      'g': '#00a215', // Green (pipes, hills, Koopa shell)
      'c': '#005c00', // Dark Green (pipe shadow, hill shadow)
      'k': '#000000', // Black
      'd': '#b83400', // Dark red-brown (brick background, Goomba details)
      'l': '#f8b8f8', // Light peach (brick highlights)
      'o': '#fc9c5c', // Orange (Goomba body highlight)
      'u': '#3cbcfc', // Sky blue (for transparent overlay if needed)
      'p': '#5c94fc', // Dark sky blue (underground background or main sky)
    };

    this.sprites = {};
    this.initSprites();
  }

  // Set up the character-grid drawings for pixel-perfect sprites
  initSprites() {
    // ----------------------------------------------------
    // SMALL MARIO (16x16)
    // ----------------------------------------------------
    this.sprites['mario_small_stand'] = [
      '....rrrrr.......',
      '...rrrrrrrrr....',
      '...hhhsssh......',
      '..hshsssssh.....',
      '..hshhssshhh....',
      '..hsshhsssh.....',
      '...sssssss......',
      '....bbbrbb......',
      '...bbbbbbbb.....',
      '..bbbbbbbbbb....',
      '..ssbbysbyys....',
      '..hhbbbbbbhh....',
      '..hhhhhhhhs.....',
      '..hhhh..hhhh....',
      '.hhh......hhh...',
      '................'
    ];

    this.sprites['mario_small_walk1'] = [
      '....rrrrr.......',
      '...rrrrrrrrr....',
      '...hhhsssh......',
      '..hshsssssh.....',
      '..hshhssshhh....',
      '..hsshhsssh.....',
      '...sssssss......',
      '....bbrb........',
      '...bbbbbbb......',
      '..bbbbbbbbbb....',
      '..ssbbysb.s.....',
      '..h.bbbbb.......',
      '....hhhhhh......',
      '....hh..hh......',
      '...hhh...hh.....',
      '..hh............'
    ];

    this.sprites['mario_small_walk2'] = [
      '....rrrrr.......',
      '...rrrrrrrrr....',
      '...hhhsssh......',
      '..hshsssssh.....',
      '..hshhssshhh....',
      '..hsshhsssh.....',
      '...sssssss......',
      '.....bbrbb......',
      '....bbbbbbbb....',
      '...bbbbbbbbb....',
      '..ss.bysby.ss...',
      '..hh.bbbbb.hh...',
      '....hhhhhhh.....',
      '...hhhh.hhhh....',
      '..hhh.....hhh...',
      '................'
    ];

    this.sprites['mario_small_walk3'] = [
      '....rrrrr.......',
      '...rrrrrrrrr....',
      '...hhhsssh......',
      '..hshsssssh.....',
      '..hshhssshhh....',
      '..hsshhsssh.....',
      '...sssssss......',
      '....bbbrbb......',
      '...bbbbbbbb.....',
      '..bbbbbbbbbb....',
      '..ssbbysbyys....',
      '..hhbbbbbbhh....',
      '..hhhhhhhhs.....',
      '..hhhh..hhhh....',
      '.hhh......hhh...',
      '................'
    ];

    this.sprites['mario_small_jump'] = [
      '....rrrrr.......',
      '...rrrrrrrrr....',
      '...hhhsssh......',
      '..hshsssssh.....',
      '..hshhssshhh....',
      '..hsshhsssh.....',
      '...sssssss......',
      '....bbbrbb......',
      '...bbbbbbbb.....',
      '..bbbbbbbbbb....',
      '..ssbbysbyys....',
      '..hhbbbbbbhh....',
      '..hhhhhhhhs.....',
      '..hhhh..hhhh....',
      '.hhh......hhh...',
      '................'
    ];

    this.sprites['mario_small_slide'] = [
      '....rrrrr.......',
      '...rrrrrrrrr....',
      '...hhhsssh......',
      '..hshsssssh.....',
      '..hshhssshhh....',
      '..hsshhsssh.....',
      '...sssssss......',
      '....bbbrbb......',
      '..bbbbbbbbbb....',
      '.bbbybbybbybb...',
      '.ss.bbbbbb.ss...',
      '.hhhhh..hhhhh...',
      '..hhh....hhh....',
      '................',
      '................',
      '................'
    ];

    this.sprites['mario_small_death'] = [
      '....hhhhhh......',
      '...hhhhhhhhh....',
      '...sssssss......',
      '..sssssssssh....',
      '..sskksskksh....',
      '..sssssssssh....',
      '...sssssss......',
      '....rrrrr.......',
      '...rrrrrrrr.....',
      '..rrrrrrrrrr....',
      '..srrrrrrrrrs...',
      '..h.rrrrrrr.h...',
      '....hhhhhhh.....',
      '...hhhh.hhhh....',
      '..hhh.....hhh...',
      '................'
    ];

    // ----------------------------------------------------
    // BIG MARIO (16x32)
    // ----------------------------------------------------
    this.sprites['mario_big_stand'] = [
      '.....rrrrrr.....',
      '....rrrrrrrrr...',
      '....hhhsssh.....',
      '...hshsssssh....',
      '...hshhssshhh...',
      '...hsshhsssh....',
      '....sssssss.....',
      '.....bbrb.......',
      '....bbbrbbb.....',
      '..bbbbbbbbbbb...',
      '..ssbbybsbyys...',
      '..hhbbbbbbbhh...',
      '..hhbbbbbbbhh...',
      '..hhhhbbbbhhhh..',
      '..hhh.bbbbb.hhh.',
      '......bbbbb.....',
      '.....bbbbbbb....',
      '....bbbb.bbbb...',
      '....bbb...bbb...',
      '...hhh.....hhh..',
      '..hhhh.....hhhh.',
      '..hhhh.....hhhh.',
      '..hhh.......hhh.',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................'
    ];

    this.sprites['mario_big_walk1'] = [
      '.....rrrrrr.....',
      '....rrrrrrrrr...',
      '....hhhsssh.....',
      '...hshsssssh....',
      '...hshhssshhh...',
      '...hsshhsssh....',
      '....sssssss.....',
      '......bbrb......',
      '.....bbbrbbb....',
      '....bbbbbbbbbb..',
      '....ssbbybsbyy..',
      '....hhbbbbbbbh..',
      '....hhbbbbbbh...',
      '....hhhhbbbbh...',
      '....hhh.bbbbb...',
      '........bbbb....',
      '.......bbbbbb...',
      '......bbbb.bbb..',
      '.....bbb...bbb..',
      '....hhh.....hh..',
      '...hhhh.....hh..',
      '..hhhh......h...',
      '..hhh...........',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................'
    ];

    this.sprites['mario_big_walk2'] = [
      '.....rrrrrr.....',
      '....rrrrrrrrr...',
      '....hhhsssh.....',
      '...hshsssssh....',
      '...hshhssshhh...',
      '...hsshhsssh....',
      '....sssssss.....',
      '.....bbrb.......',
      '....bbbrbbb.....',
      '..bbbbbbbbbbb...',
      '..ssbbybsbyys...',
      '..hhbbbbbbbhh...',
      '..hhbbbbbbbhh...',
      '..hhhhbbbbhhhh..',
      '..hhh.bbbbb.hhh.',
      '......bbbbb.....',
      '.....bbbbbbb....',
      '....bbbb.bbbb...',
      '....bbb...bbb...',
      '...hhh.....hhh..',
      '..hhhh.....hhhh.',
      '..hhhh.....hhhh.',
      '..hhh.......hhh.',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................'
    ];

    this.sprites['mario_big_walk3'] = [
      '.....rrrrrr.....',
      '....rrrrrrrrr...',
      '....hhhsssh.....',
      '...hshsssssh....',
      '...hshhssshhh...',
      '...hsshhsssh....',
      '....sssssss.....',
      '.....bbrb.......',
      '....bbbrbbb.....',
      '..bbbbbbbbbbb...',
      '..ssbbybsbyys...',
      '..hhbbbbbbbhh...',
      '..hhbbbbbbbhh...',
      '..hhhhbbbbhhhh..',
      '..hhh.bbbbb.hhh.',
      '......bbbbb.....',
      '.....bbbbbbb....',
      '....bbbb.bbbb...',
      '....bbb...bbb...',
      '...hhh.....hhh..',
      '..hhhh.....hhhh.',
      '..hhhh.....hhhh.',
      '..hhh.......hhh.',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................'
    ];

    this.sprites['mario_big_jump'] = [
      '.....rrrrrr.....',
      '....rrrrrrrrr...',
      '....hhhsssh.....',
      '...hshsssssh....',
      '...hshhssshhh...',
      '...hsshhsssh....',
      '....sssssss.....',
      '.....bbrb.......',
      '....bbbrbbb.....',
      '..bbbbbbbbbbb...',
      '..ssbbybsbyys...',
      '..hhbbbbbbbhh...',
      '..hhbbbbbbbhh...',
      '..hhhhbbbbhhhh..',
      '..hhh.bbbbb.hhh.',
      '......bbbbb.....',
      '.....bbbbbbb....',
      '....bbbb.bbbb...',
      '....bbb...bbb...',
      '...hhh.....hhh..',
      '..hhhh.....hhhh.',
      '..hhhh.....hhhh.',
      '..hhh.......hhh.',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................'
    ];

    this.sprites['mario_big_slide'] = [
      '.....rrrrrr.....',
      '....rrrrrrrrr...',
      '....hhhsssh.....',
      '...hshsssssh....',
      '...hshhssshhh...',
      '...hsshhsssh....',
      '....sssssss.....',
      '.....bbrb.......',
      '....bbbrbbb.....',
      '..bbbbbbbbbbb...',
      '..ssbbybsbyys...',
      '..hhbbbbbbbhh...',
      '..hhbbbbbbbhh...',
      '..hhhhbbbbhhhh..',
      '..hhh.bbbbb.hhh.',
      '......bbbbb.....',
      '.....bbbbbbb....',
      '....bbbb.bbbb...',
      '....bbb...bbb...',
      '...hhh.....hhh..',
      '..hhhh.....hhhh.',
      '..hhhh.....hhhh.',
      '..hhh.......hhh.',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................'
    ];

    this.sprites['mario_big_duck'] = [
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '.....rrrrrr.....',
      '....rrrrrrrrr...',
      '....hhhsssh.....',
      '...hshsssssh....',
      '...hshhssshhh...',
      '...hsshhsssh....',
      '....sssssss.....',
      '.....bbrb.......',
      '....bbbrbbb.....',
      '..bbbbbbbbbbb...',
      '..ssbbybsbyys...',
      '..hhbbbbbbbhh...',
      '..hhbbbbbbbhh...',
      '..hhhhbbbbhhhh..',
      '..hhh.bbbbb.hhh.',
      '......bbbbb.....',
      '.....bbbbbbb....',
      '....bbbb.bbbb...',
      '....bbb...bbb...',
      '...hhh.....hhh..',
      '..hhhh.....hhhh.',
      '..hhhh.....hhhh.',
      '..hhh.......hhh.',
      '................'
    ];

    // ----------------------------------------------------
    // ENEMIES (16x16)
    // ----------------------------------------------------
    // Goomba
    this.sprites['goomba_walk1'] = [
      '......hhhh......',
      '....hhhhhhhh....',
      '...hhhhhhhhhh...',
      '..hhwdhhhhwdhh..',
      '.hhhwdhhhhwdhhh.',
      '.hhhhhhhhhhhhhh.',
      '.hhhhhhdhhdhhhh.',
      '..hhhhhddddhhh..',
      '...hhhhhhhhhh...',
      '....ohooohoh....',
      '...oohoooohoo...',
      '..oooohhhhhhoo..',
      '..oohhhhhhhhoo..',
      '..h.hhhhhhhh.h..',
      '..hhhh....hhhh..',
      '.hhhh......hhhh.'
    ];

    this.sprites['goomba_walk2'] = [
      '......hhhh......',
      '....hhhhhhhh....',
      '...hhhhhhhhhh...',
      '..hhwdhhhhwdhh..',
      '.hhhwdhhhhwdhhh.',
      '.hhhhhhhhhhhhhh.',
      '.hhhhhhdhhdhhhh.',
      '..hhhhhddddhhh..',
      '...hhhhhhhhhh...',
      '....ohooohoh....',
      '...oohoooohoo...',
      '..oooohhhhhhoo..',
      '..oohhhhhhhhoo..',
      '..h.hhhhhhhh.h..',
      '..hhhh....hhhh..',
      '..hhhh....hhhh..'
    ];

    this.sprites['goomba_flat'] = [
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '......hhhh......',
      '....hhhhhhhh....',
      '...hhhhhhhhhh...',
      '..hhwdhhhhwdhh..',
      '.hhhwdhhhhwdhhh.',
      '.hhhhhhhhhhhhhh.',
      '.ooooohhhhhhoo..',
      '..oohhhhhhhhoo..',
      '.hhhhh....hhhhh.'
    ];

    // Koopa Troopa
    this.sprites['koopa_walk1'] = [
      '......yyyyy.....',
      '.....yyyyyyy....',
      '....yywkyywk....',
      '....yyyyyyyy....',
      '....yysysyyy....',
      '.....sssss......',
      '....gggggggg....',
      '...gggggggggg...',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '...gg.yyyy.gg...',
      '....y.yyyy.y....',
      '....y.yy..y.....',
      '...yy.yy..yy....'
    ];

    this.sprites['koopa_walk2'] = [
      '......yyyyy.....',
      '.....yyyyyyy....',
      '....yywkyywk....',
      '....yyyyyyyy....',
      '....yysysyyy....',
      '.....sssss......',
      '....gggggggg....',
      '...gggggggggg...',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '...gg.yyyy.gg...',
      '....y.yyyy.y....',
      '.....yy..yy.....',
      '.....yy..yy.....'
    ];

    this.sprites['koopa_shell'] = [
      '................',
      '......gggg......',
      '....gggggggg....',
      '...gggggggggg...',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '...gggggggggg...',
      '....gggggggg....',
      '......gggg......',
      '................',
      '................',
      '................'
    ];

    // ----------------------------------------------------
    // ITEMS (16x16)
    // ----------------------------------------------------
    this.sprites['mushroom'] = [
      '......rrrr......',
      '....rrrrrrrr....',
      '...rrrrrrrrrr...',
      '..rrrwwrrwwrrr..',
      '.rrrwwwwrwwwwrrr.',
      '.rrrwwwwrwwwwrrr.',
      '.rrrrrrrrrrrrrr.',
      '..rrrrrrrrrrrr..',
      '....ssssssss....',
      '....ssskksss....',
      '....ssssssss....',
      '....ssssssss....',
      '....ssssssss....',
      '....ssssssss....',
      '.....ssssss.....',
      '......ssss......'
    ];

    this.sprites['star'] = [
      '.......yy.......',
      '.......yy.......',
      '......yyyy......',
      '.....yyyyyy.....',
      '.....ykyyky.....',
      '....yyyyyyyy....',
      '...yyyyyyyyyy...',
      '..yyyyyyyyyyyy..',
      '..yyyyyyyyyyyy..',
      '...yyyyyyyyyy...',
      '....yyyyyyyy....',
      '....yyyyyyyy....',
      '....yyy..yyy....',
      '...yyy....yyy...',
      '..yyy......yyy..',
      '.yy..........yy.'
    ];

    this.sprites['flower'] = [
      '......gggg......',
      '....gggggggg....',
      '...ggwwwwwwgg...',
      '..ggwwrrrrwwgg..',
      '.ggwwrryyrrwwgg.',
      '.ggwwrryyrrwwgg.',
      '..ggwwrrrrwwgg..',
      '...ggwwwwwwgg...',
      '....gggggggg....',
      '......gg......',
      '......gg......',
      '....gggggg....',
      '...gggggggg...',
      '..gggg..gggg..',
      '..gg......gg..',
      '..gg......gg..'
    ];

    // Coins
    this.sprites['coin1'] = [
      '......yyyy......',
      '....yyyyyyyy....',
      '...yyyyyyyyyy...',
      '..yyyyssssyiyy..',
      '.yyyyssssyiyiyy.',
      '.yyyyssssyiyiyy.',
      '.yyyyssssyiyiyy.',
      '.yyyyssssyiyiyy.',
      '.yyyyssssyiyiyy.',
      '.yyyyssssyiyiyy.',
      '.yyyyssssyiyiyy.',
      '.yyyyssssyiyiyy.',
      '..yyyyssssyiyy..',
      '...yyyyyyyyyy...',
      '....yyyyyyyy....',
      '......yyyy......'
    ];
    this.sprites['coin2'] = [
      '.......yy.......',
      '.....yyyyyy.....',
      '....yyyyyyyy....',
      '..yyyyssssyiyy..',
      '..yyyyssssyiyy..',
      '..yyyyssssyiyy..',
      '..yyyyssssyiyy..',
      '..yyyyssssyiyy..',
      '..yyyyssssyiyy..',
      '..yyyyssssyiyy..',
      '..yyyyssssyiyy..',
      '..yyyyssssyiyy..',
      '..yyyyssssyiyy..',
      '....yyyyyyyy....',
      '.....yyyyyy.....',
      '.......yy.......'
    ];
    this.sprites['coin3'] = [
      '........y.......',
      '......yyyy......',
      '......yyyy......',
      '....yyyyyyyy....',
      '....yyyyyyyy....',
      '....yyyyyyyy....',
      '....yyyyyyyy....',
      '....yyyyyyyy....',
      '....yyyyyyyy....',
      '....yyyyyyyy....',
      '....yyyyyyyy....',
      '....yyyyyyyy....',
      '....yyyyyyyy....',
      '......yyyy......',
      '......yyyy......',
      '........y.......'
    ];

    // ----------------------------------------------------
    // MAP TILES (16x16)
    // ----------------------------------------------------
    this.sprites['brick'] = [
      'dddddddddddddddd',
      'dldddddddddldddd',
      'kkkkkkkkkkkkkkkk',
      'ddddldddddddddld',
      'dddddddddddddddd',
      'kkkkkkkkkkkkkkkk',
      'dldddddddddldddd',
      'dddddddddddddddd',
      'kkkkkkkkkkkkkkkk',
      'ddddldddddddddld',
      'dddddddddddddddd',
      'kkkkkkkkkkkkkkkk',
      'dldddddddddldddd',
      'dddddddddddddddd',
      'kkkkkkkkkkkkkkkk',
      'dddddddddddddddd'
    ];

    this.sprites['question_empty'] = [
      'hhhhhhhhhhhhhhhh',
      'h..............h',
      'h.kkkkkkkkkkkk.h',
      'h.k..........k.h',
      'h.k.hhhhhhhh.k.h',
      'h.k.h......h.k.h',
      'h.k.h.hhhh.h.k.h',
      'h.k.h.h..h.h.k.h',
      'h.k.h.h..h.h.k.h',
      'h.k.h.hhhh.h.k.h',
      'h.k.h......h.k.h',
      'h.k.hhhhhhhh.k.h',
      'h.k..........k.h',
      'h.kkkkkkkkkkkk.h',
      'h................h',
      'hhhhhhhhhhhhhhhh'
    ];

    this.sprites['question1'] = [
      'yyyyyyyyyyyyyyyy',
      'yhhhhhhhhhhhhhhy',
      'yhkkkkkkkkkkkkhy',
      'yhk..yyyyyy..khy',
      'yhkyyhhhhhhyykhy',
      'yhkyyhh..hhyykhy',
      'yhkyyhh..hhyykhy',
      'yhk.yhhhhhy.khy',
      'yhk..yhhhy..khy',
      'yhk...yhy...khy',
      'yhk....y....khy',
      'yhkyyyyhyyyykhy',
      'yhkyyyyhyyyykhy',
      'yhkkkkkkkkkkkkhy',
      'yhhhhhhhhhhhhhhy',
      'yyyyyyyyyyyyyyyy'
    ];
    this.sprites['question2'] = [
      'yyyyy.yyyyy.yyyy',
      'yhhhhhhhhhhhhhhy',
      'yhkkkkkkkkkkkkhy',
      'yhk..yyyyyy..khy',
      'yhkyyhhhhhhyykhy',
      'yhkyyhh..hhyykhy',
      'yhkyyhh..hhyykhy',
      'yhk.yhhhhhy.khy',
      'yhk..yhhhy..khy',
      'yhk...yhy...khy',
      'yhk....y....khy',
      'yhkyyyyhyyyykhy',
      'yhkyyyyhyyyykhy',
      'yhkkkkkkkkkkkkhy',
      'yhhhhhhhhhhhhhhy',
      'yyyyy.yyyyy.yyyy'
    ];
    this.sprites['question3'] = [
      'y.y.y.y.y.y.y.y.',
      'yhhhhhhhhhhhhhhy',
      'yhkkkkkkkkkkkkhy',
      'yhk..yyyyyy..khy',
      'yhkyyhhhhhhyykhy',
      'yhkyyhh..hhyykhy',
      'yhkyyhh..hhyykhy',
      'yhk.yhhhhhy.khy',
      'yhk..yhhhy..khy',
      'yhk...yhy...khy',
      'yhk....y....khy',
      'yhkyyyyhyyyykhy',
      'yhkyyyyhyyyykhy',
      'yhkkkkkkkkkkkkhy',
      'yhhhhhhhhhhhhhhy',
      'y.y.y.y.y.y.y.y.'
    ];

    this.sprites['solid_block'] = [
      'kkkkkkkkkkkkkkkk',
      'khhhhhhhhhhhhhhk',
      'khddddddddddddhk',
      'khddddddddddddhk',
      'khddddddddddddhk',
      'khddddddddddddhk',
      'khddddddddddddhk',
      'khddddddddddddhk',
      'khddddddddddddhk',
      'khddddddddddddhk',
      'khddddddddddddhk',
      'khddddddddddddhk',
      'khddddddddddddhk',
      'khddddddddddddhk',
      'khhhhhhhhhhhhhhk',
      'kkkkkkkkkkkkkkkk'
    ];

    this.sprites['ground'] = [
      'ddddddlldddddddd',
      'ddddddlldddddddd',
      'ddllddddddddlldd',
      'ddllddddddddlldd',
      'ddddddddlldddddd',
      'ddddddddlldddddd',
      'llddddddddddlldd',
      'llddddddddddlldd',
      'ddddddlldddddddd',
      'ddddddlldddddddd',
      'ddllddddddddlldd',
      'ddllddddddddlldd',
      'ddddddddlldddddd',
      'ddddddddlldddddd',
      'llddddddddddlldd',
      'llddddddddddlldd'
    ];
  }

  // Draw sprite from string mapping onto target canvas context
  draw(ctx, spriteName, x, y, flipHorizontally = false, scaleX = 1, scaleY = 1) {
    const sprite = this.sprites[spriteName];
    if (!sprite) {
      // Fallback rect if sprite is missing
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(x, y, 16, 16);
      return;
    }

    const rows = sprite.length;
    const cols = sprite[0].length;

    ctx.save();
    ctx.translate(x, y);
    if (flipHorizontally) {
      ctx.scale(-1, 1);
      ctx.translate(-cols * scaleX, 0);
    }
    ctx.scale(scaleX, scaleY);

    for (let r = 0; r < rows; r++) {
      let runLength = 0;
      let prevColor = null;
      
      for (let c = 0; c < cols; c++) {
        const char = sprite[r][c];
        const color = this.palette[char] || 'transparent';
        
        if (color === prevColor) {
          runLength++;
        } else {
          if (prevColor && prevColor !== 'transparent') {
            ctx.fillStyle = prevColor;
            ctx.fillRect(c - runLength, r, runLength, 1.05); // Minor overlap to prevent subpixel seam gaps
          }
          prevColor = color;
          runLength = 1;
        }
      }
      
      if (prevColor && prevColor !== 'transparent') {
        ctx.fillStyle = prevColor;
        ctx.fillRect(cols - runLength, r, runLength, 1.05);
      }
    }

    ctx.restore();
  }

  // Draw procedural scenery elements that don't need pixel matrix representation
  // (clouds, large hills, bushes, castle)
  drawScenery(ctx, type, x, y, width, height) {
    ctx.save();
    ctx.translate(x, y);

    if (type === 'hill_large') {
      // A large green hill with black outline, green dots
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.quadraticCurveTo(width / 2, -height * 0.1, width, height);
      ctx.closePath();
      
      ctx.fillStyle = '#00a215'; // Green
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw hill shadow lines / spots
      ctx.fillStyle = '#005c00'; // Dark green
      ctx.fillRect(width * 0.45, height * 0.3, 2, 2);
      ctx.fillRect(width * 0.3, height * 0.5, 2, 2);
      ctx.fillRect(width * 0.6, height * 0.6, 2, 2);
      ctx.fillRect(width * 0.5, height * 0.8, 2, 2);
      ctx.fillRect(width * 0.2, height * 0.8, 2, 2);
      ctx.fillRect(width * 0.8, height * 0.8, 2, 2);
    } 
    else if (type === 'hill_small') {
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.quadraticCurveTo(width / 2, height * 0.2, width, height);
      ctx.closePath();
      ctx.fillStyle = '#00a215';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    else if (type === 'cloud') {
      // Classic NES happy puff cloud
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.arc(24, 8, 8, 0, Math.PI * 2);
      ctx.arc(36, 12, 10, 0, Math.PI * 2);
      ctx.rect(12, 6, 24, 12);
      ctx.closePath();
      ctx.fill();

      // Cloud details (eyes / shadows)
      ctx.strokeStyle = '#3cbcfc'; // Sky color outlines internally
      ctx.lineWidth = 1;
      ctx.stroke();

      // Black eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(20, 10, 1, 3);
      ctx.fillRect(27, 10, 1, 3);
    }
    else if (type === 'bush') {
      // Puffy green bushes
      ctx.fillStyle = '#00a215';
      ctx.beginPath();
      ctx.arc(8, 12, 6, 0, Math.PI * 2);
      ctx.arc(16, 8, 8, 0, Math.PI * 2);
      ctx.arc(24, 12, 6, 0, Math.PI * 2);
      ctx.rect(8, 8, 16, 8);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    else if (type === 'castle') {
      // Brick castle at the end of World 1-1
      // Base
      ctx.fillStyle = '#b83400'; // Brick red
      ctx.fillRect(0, 20, 80, 60);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 20, 80, 60);

      // Crenellations
      ctx.fillRect(4, 12, 10, 8);
      ctx.strokeRect(4, 12, 10, 8);
      ctx.fillRect(24, 12, 10, 8);
      ctx.strokeRect(24, 12, 10, 8);
      ctx.fillRect(44, 12, 10, 8);
      ctx.strokeRect(44, 12, 10, 8);
      ctx.fillRect(64, 12, 10, 8);
      ctx.strokeRect(64, 12, 10, 8);

      // Tower
      ctx.fillRect(20, 0, 40, 20);
      ctx.strokeRect(20, 0, 40, 20);
      ctx.fillRect(24, -8, 8, 8);
      ctx.strokeRect(24, -8, 8, 8);
      ctx.fillRect(48, -8, 8, 8);
      ctx.strokeRect(48, -8, 8, 8);

      // Gate
      ctx.fillStyle = '#000000';
      ctx.fillRect(32, 52, 16, 28);
      // Arched gate top
      ctx.beginPath();
      ctx.arc(40, 52, 8, Math.PI, 0);
      ctx.fill();

      // Draw small flagpole on tower
      ctx.strokeStyle = '#fce0a6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, -8);
      ctx.lineTo(40, -28);
      ctx.stroke();

      ctx.fillStyle = '#00a215'; // Green flag
      ctx.beginPath();
      ctx.moveTo(40, -28);
      ctx.lineTo(26, -23);
      ctx.lineTo(40, -18);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw shiny pipes (green pipe cylinder outlines, shading)
  drawPipe(ctx, x, y, width, height, isTopOnly = false) {
    ctx.save();
    ctx.translate(x, y);

    // Pipe outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    // Drawing the pipe head (upper lip)
    const lipHeight = 15;
    ctx.fillStyle = '#00a215'; // Main green
    ctx.fillRect(-2, 0, width + 4, lipHeight);
    ctx.strokeRect(-2, 0, width + 4, lipHeight);

    // Lip highlight
    ctx.fillStyle = '#94eb00'; // Light green highlight
    ctx.fillRect(0, 1, 4, lipHeight - 2);
    ctx.fillRect(4, 1, 8, lipHeight - 2);
    
    // Lip shadow
    ctx.fillStyle = '#005c00'; // Dark green shadow
    ctx.fillRect(width - 8, 1, 8, lipHeight - 2);
    ctx.fillRect(width - 12, 1, 4, lipHeight - 2);

    if (!isTopOnly) {
      // Pipe body
      ctx.fillStyle = '#00a215';
      ctx.fillRect(0, lipHeight, width, height - lipHeight);
      
      // Left and right stroke outlines of pipe body
      ctx.beginPath();
      ctx.moveTo(0, lipHeight);
      ctx.lineTo(0, height);
      ctx.moveTo(width, lipHeight);
      ctx.lineTo(width, height);
      ctx.stroke();

      // Body highlight
      ctx.fillStyle = '#94eb00';
      ctx.fillRect(2, lipHeight, 4, height - lipHeight);
      ctx.fillRect(6, lipHeight, 6, height - lipHeight);

      // Body shadow
      ctx.fillStyle = '#005c00';
      ctx.fillRect(width - 10, lipHeight, 10, height - lipHeight);
      ctx.fillRect(width - 14, lipHeight, 4, height - lipHeight);
    }

    ctx.restore();
  }
}

export const graphics = new SpriteRenderer();
