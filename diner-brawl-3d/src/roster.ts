export interface CharacterSpec {
  id: string;
  name: string;
  subtitle: string;
  sprite: string;
  cols: number;
  rows: number;
  colorCSS: string;
  stats: { speed: number; power: number; defense: number };
  specials: { name: string; cost: number; type: string; damage: number }[];
}

export const ROSTER: CharacterSpec[] = [
  {
    id: 'leo',
    name: 'LEO',
    subtitle: 'Urban Brawler',
    sprite: '/sprites/leo.png',
    cols: 4,
    rows: 4,
    colorCSS: '#00ffaa',
    stats: { speed: 8, power: 8, defense: 6 },
    specials: [
      { name: 'Street Fire', cost: 25, type: 'fireball', damage: 20 }
    ]
  },
  {
    id: 'blaze',
    name: 'BLAZE',
    subtitle: 'Street King',
    sprite: '/sprites/fighter1.png',
    cols: 4,
    rows: 4,
    colorCSS: '#3388ff',
    stats: { speed: 8, power: 7, defense: 5 },
    specials: [
      { name: 'Soul Blast', cost: 25, type: 'fireball', damage: 20 }
    ]
  },
  {
    id: 'venom',
    name: 'VENOM',
    subtitle: 'Street Legend',
    sprite: '/sprites/fighter2.png',
    cols: 4,
    rows: 4,
    colorCSS: '#ff6622',
    stats: { speed: 6, power: 9, defense: 7 },
    specials: [
      { name: 'Fire Fist', cost: 25, type: 'fireball', damage: 22 }
    ]
  },
  {
    id: 'shadow',
    name: 'SHADOW',
    subtitle: 'Phantom Blade',
    sprite: '/sprites/fighter3.png',
    cols: 4,
    rows: 4,
    colorCSS: '#aa44ff',
    stats: { speed: 10, power: 6, defense: 4 },
    specials: [
      { name: 'Shadow Shuriken', cost: 20, type: 'fireball', damage: 18 }
    ]
  },
  {
    id: 'titan',
    name: 'TITAN',
    subtitle: 'The Juggernaut',
    sprite: '/sprites/fighter4.png',
    cols: 4,
    rows: 4,
    colorCSS: '#ffaa00',
    stats: { speed: 4, power: 10, defense: 9 },
    specials: [
      { name: 'Gold Rush', cost: 25, type: 'fireball', damage: 24 }
    ]
  },
  {
    id: 'ryu',
    name: 'RYU',
    subtitle: 'Crimson Fist',
    sprite: '/sprites/ryu.png',
    cols: 4,
    rows: 4,
    colorCSS: '#ff4444',
    stats: { speed: 7, power: 8, defense: 7 },
    specials: [
      { name: 'Hadou Burst', cost: 25, type: 'fireball', damage: 22 }
    ]
  },
  {
    id: 'yuki',
    name: 'YUKI',
    subtitle: 'Phantom Kunoichi',
    sprite: '/sprites/kunoichi.png',
    cols: 4,
    rows: 4,
    colorCSS: '#8844cc',
    stats: { speed: 10, power: 6, defense: 5 },
    specials: [
      { name: 'Shadow Shuriken', cost: 20, type: 'fireball', damage: 18 }
    ]
  },
  {
    id: 'ace',
    name: 'ACE',
    subtitle: 'The Champion',
    sprite: '/sprites/boxer.png',
    cols: 4,
    rows: 4,
    colorCSS: '#cc2222',
    stats: { speed: 5, power: 10, defense: 8 },
    specials: [
      { name: 'Power Jab', cost: 25, type: 'fireball', damage: 24 }
    ]
  },
  {
    id: 'valeria',
    name: 'VALERIA',
    subtitle: 'MMA Queen',
    sprite: '/sprites/valeria.png',
    cols: 4,
    rows: 4,
    colorCSS: '#ddaa22',
    stats: { speed: 9, power: 7, defense: 6 },
    specials: [
      { name: 'Gold Strike', cost: 25, type: 'fireball', damage: 20 }
    ]
  }
];
