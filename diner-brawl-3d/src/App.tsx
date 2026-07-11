import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { GameScene } from './components/GameScene';
import { HUD } from './components/HUD';
import { CharacterSelect } from './components/CharacterSelect';
import { useGameStore } from './store';

const KEYBOARD_MAP = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'punch', keys: ['KeyJ'] },
  { name: 'kick', keys: ['KeyK'] },
  { name: 'special', keys: ['KeyU'] },
];

function App() {
  const scene = useGameStore((s) => s.scene);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#111', overflow: 'hidden' }}>
      <KeyboardControls map={KEYBOARD_MAP}>
        <Canvas
          shadows
          camera={{ position: [0, 3, 8], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          frameloop="always"
        >
          {scene === 'PLAYING' && <GameScene />}
        </Canvas>
        
        {scene === 'PLAYING' && <HUD />}
      </KeyboardControls>

      {scene === 'SELECT' && <CharacterSelect />}
      
      {scene === 'GAME_OVER' && (
        <div style={{ 
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', 
          justifyContent: 'center', background: 'rgba(5, 5, 8, 0.9)', 
          color: 'white', flexDirection: 'column', zIndex: 100,
          fontFamily: '"Space Grotesk", system-ui, sans-serif'
        }}>
          <h1 style={{ fontSize: '6rem', color: '#ff3366', margin: 0, fontWeight: 900, letterSpacing: '-3px' }}>K.O.</h1>
          <p style={{ fontSize: '1.5rem', color: '#8e8e9c', margin: '10px 0 30px 0' }}>Opponent knocked you down!</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onClick={() => useGameStore.getState().reset()} 
              style={{ 
                padding: '1.2rem 2.5rem', fontSize: '1.25rem', background: '#ff3366', color: '#fff', 
                border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold',
                boxShadow: '0 8px 24px rgba(255, 51, 102, 0.3)'
              }}
            >
              REMATCH
            </button>
            <button 
              onClick={() => useGameStore.getState().setScene('SELECT')} 
              style={{ 
                padding: '1.2rem 2.5rem', fontSize: '1.25rem', background: 'rgba(255,255,255,0.05)', color: '#fff', 
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              CHARACTER SELECT
            </button>
          </div>
        </div>
      )}

      {scene === 'VICTORY' && (
        <div style={{ 
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', 
          justifyContent: 'center', background: 'rgba(5, 5, 8, 0.9)', 
          color: 'white', flexDirection: 'column', zIndex: 100,
          fontFamily: '"Space Grotesk", system-ui, sans-serif'
        }}>
          <h1 style={{ fontSize: '6rem', color: '#00F5D4', margin: 0, fontWeight: 900, letterSpacing: '-3px' }}>VICTORY</h1>
          <p style={{ fontSize: '1.5rem', color: '#8e8e9c', margin: '10px 0 30px 0' }}>You dominated the diner brawl!</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onClick={() => useGameStore.getState().reset()} 
              style={{ 
                padding: '1.2rem 2.5rem', fontSize: '1.25rem', background: '#00F5D4', color: '#000', 
                border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold',
                boxShadow: '0 8px 24px rgba(0, 245, 212, 0.3)'
              }}
            >
              PLAY AGAIN
            </button>
            <button 
              onClick={() => useGameStore.getState().setScene('SELECT')} 
              style={{ 
                padding: '1.2rem 2.5rem', fontSize: '1.25rem', background: 'rgba(255,255,255,0.05)', color: '#fff', 
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              CHARACTER SELECT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
