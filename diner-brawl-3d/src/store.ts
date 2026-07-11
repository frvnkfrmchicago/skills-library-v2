import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { type CharacterSpec, ROSTER } from './roster';

export interface FireballState {
  id: string;
  x: number;
  y: number;
  vx: number;
  owner: 'player' | 'enemy';
}

interface GameState {
  // Characters
  playerChar: CharacterSpec;
  enemyChar: CharacterSpec;

  // Hot path state
  playerPosition: [number, number, number];
  enemyPosition: [number, number, number];

  // Stats
  health: number;
  enemyHealth: number;
  special: number;
  enemySpecial: number;
  score: number;
  
  // Game state
  scene: 'SELECT' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';
  
  // Buffers & feedback
  cameraShake: number;
  hitStopActive: boolean;

  // Projectiles
  fireballs: FireballState[];

  // Actions
  setPlayerChar: (char: CharacterSpec) => void;
  setEnemyChar: (char: CharacterSpec) => void;
  setPlayerPosition: (pos: [number, number, number]) => void;
  setEnemyPosition: (pos: [number, number, number]) => void;
  takeDamage: (target: 'player' | 'enemy', amount: number) => void;
  addSpecial: (target: 'player' | 'enemy', amount: number) => void;
  addScore: (amount: number) => void;
  spawnFireball: (owner: 'player' | 'enemy', x: number, y: number, dir: number) => void;
  removeFireball: (id: string) => void;
  triggerCameraShake: (intensity: number) => void;
  setHitStop: (active: boolean) => void;
  setScene: (scene: GameState['scene']) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    playerChar: ROSTER[0], // Leo by default
    enemyChar: ROSTER[2],  // Venom by default

    playerPosition: [-3, 1, 0],
    enemyPosition: [3, 1, 0],

    health: 100,
    enemyHealth: 100,
    special: 0,
    enemySpecial: 0,
    score: 0,
    scene: 'SELECT', // Prompt character select first!

    cameraShake: 0,
    hitStopActive: false,
    fireballs: [],

    setPlayerChar: (char) => set({ playerChar: char }),
    setEnemyChar: (char) => set({ enemyChar: char }),

    setPlayerPosition: (pos) => set({ playerPosition: pos }),
    setEnemyPosition: (pos) => set({ enemyPosition: pos }),

    takeDamage: (target, amount) => {
      if (target === 'player') {
        const health = Math.max(0, get().health - amount);
        set({ health });
        if (health <= 0) set({ scene: 'GAME_OVER' });
      } else {
        const enemyHealth = Math.max(0, get().enemyHealth - amount);
        set({ enemyHealth });
        if (enemyHealth <= 0) set({ scene: 'VICTORY' });
      }
    },

    addSpecial: (target, amount) => {
      if (target === 'player') {
        set({ special: Math.min(100, get().special + amount) });
      } else {
        set({ enemySpecial: Math.min(100, get().enemySpecial + amount) });
      }
    },

    addScore: (amount) => set({ score: get().score + amount }),

    spawnFireball: (owner, x, y, dir) => {
      const id = Math.random().toString(36).substring(2, 9);
      const vx = dir * 12; // Speed multiplier
      const newFireball: FireballState = { id, x, y, vx, owner };
      set({ fireballs: [...get().fireballs, newFireball] });
    },

    removeFireball: (id) => {
      set({ fireballs: get().fireballs.filter((f) => f.id !== id) });
    },

    triggerCameraShake: (intensity) => {
      set({ cameraShake: intensity });
    },

    setHitStop: (active) => set({ hitStopActive: active }),

    setScene: (scene) => set({ scene }),

    reset: () => set({
      health: 100,
      enemyHealth: 100,
      special: 0,
      enemySpecial: 0,
      score: 0,
      playerPosition: [-3, 1, 0],
      enemyPosition: [3, 1, 0],
      cameraShake: 0,
      hitStopActive: false,
      fireballs: [],
      scene: 'PLAYING',
    }),
  }))
);
