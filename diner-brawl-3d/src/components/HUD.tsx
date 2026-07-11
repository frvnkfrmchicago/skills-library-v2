import { useEffect, useState } from 'react';
import { useGameStore } from '../store';

export function HUD() {
  const health = useGameStore((s) => s.health);
  const enemyHealth = useGameStore((s) => s.enemyHealth);
  const special = useGameStore((s) => s.special);
  const enemySpecial = useGameStore((s) => s.enemySpecial);
  
  const playerChar = useGameStore((s) => s.playerChar);
  const enemyChar = useGameStore((s) => s.enemyChar);
  const score = useGameStore((s) => s.score);

  // Round Timer
  const [timer, setTimer] = useState(99);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 99));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      position: 'absolute', 
      inset: 0, 
      pointerEvents: 'none', 
      padding: '30px', 
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* HEADER HUD: Player & Enemy Health / Special bars */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        pointerEvents: 'auto',
      }}>
        {/* PLAYER (P1) Panel */}
        <div style={{ 
          width: '400px', 
          padding: '16px 24px',
          background: 'rgba(15, 15, 25, 0.5)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: playerChar.colorCSS, letterSpacing: '-0.5px' }}>
              {playerChar.name}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#8e8e9c', fontWeight: 700 }}>P1</span>
          </div>

          {/* Health Slider */}
          <div style={{ width: '100%', height: '18px', background: 'rgba(0,0,0,0.5)', borderRadius: '9px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ 
              width: `${health}%`, height: '100%', 
              background: `linear-gradient(90deg, ${playerChar.colorCSS}bb, ${playerChar.colorCSS})`,
              transition: 'width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: `0 0 15px ${playerChar.colorCSS}88`
            }} />
          </div>
          
          {/* Special Meter Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: '#8e8e9c', fontWeight: 900 }}>SP</span>
            <div style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${special}%`, height: '100%', 
                background: special >= 25 ? '#00F5D4' : '#5e5e6c', 
                transition: 'width 0.15s ease-out',
                boxShadow: special >= 25 ? '0 0 10px #00F5D4aa' : 'none'
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: special >= 25 ? '#00F5D4' : '#8e8e9c', fontWeight: 900 }}>
              {special >= 25 ? 'READY' : `${special}%`}
            </span>
          </div>
        </div>

        {/* Center Round Timer */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(15, 15, 25, 0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          fontSize: '2rem',
          fontWeight: 900,
          color: timer <= 10 ? '#ff3366' : '#fff',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}>
          {timer}
        </div>

        {/* ENEMY (CPU) Panel */}
        <div style={{ 
          width: '400px', 
          padding: '16px 24px',
          background: 'rgba(15, 15, 25, 0.5)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexDirection: 'row-reverse' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: enemyChar.colorCSS, letterSpacing: '-0.5px' }}>
              {enemyChar.name}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#8e8e9c', fontWeight: 700 }}>CPU</span>
          </div>

          {/* Health Slider (Right-aligned fill direction) */}
          <div style={{ width: '100%', height: '18px', background: 'rgba(0,0,0,0.5)', borderRadius: '9px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ 
              width: `${enemyHealth}%`, height: '100%', 
              background: `linear-gradient(90deg, ${enemyChar.colorCSS}, ${enemyChar.colorCSS}bb)`,
              transition: 'width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: `0 0 15px ${enemyChar.colorCSS}88`
            }} />
          </div>
          
          {/* Special Meter Slider (Right-aligned) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', flexDirection: 'row-reverse' }}>
            <span style={{ fontSize: '0.7rem', color: '#8e8e9c', fontWeight: 900 }}>SP</span>
            <div style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ 
                width: `${enemySpecial}%`, height: '100%', 
                background: enemySpecial >= 25 ? '#ff5533' : '#5e5e6c', 
                transition: 'width 0.15s ease-out',
                boxShadow: enemySpecial >= 25 ? '0 0 10px rgba(255, 85, 51, 0.6)' : 'none'
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: enemySpecial >= 25 ? '#ff5533' : '#8e8e9c', fontWeight: 900 }}>
              {enemySpecial >= 25 ? 'READY' : `${enemySpecial}%`}
            </span>
          </div>
        </div>
      </div>

      {/* SCORE PANEL */}
      <div style={{ 
        position: 'absolute', 
        top: '160px', 
        right: '40px', 
        color: '#fff', 
        fontSize: '2rem', 
        fontWeight: 900, 
        textShadow: '0 4px 15px rgba(0,0,0,0.5)',
        letterSpacing: '-1px'
      }}>
        SCORE: <span style={{ color: '#00F5D4' }}>{score.toString().padStart(6, '0')}</span>
      </div>
      
      {/* INSTRUCTIONS PANEL */}
      <div style={{ 
        position: 'absolute', 
        bottom: '30px', 
        left: '30px', 
        color: '#8B8A97', 
        fontSize: '0.9rem',
        background: 'rgba(15, 15, 25, 0.65)', 
        backdropFilter: 'blur(20px) saturate(180%)',
        padding: '20px 24px', 
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#fff', letterSpacing: '1px', marginBottom: '10px' }}>CONTROLS GUIDE</div>
        <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: '#fff' }}>A / D:</strong> Move Left / Right</p>
        <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: '#fff' }}>W / Space:</strong> Jump</p>
        <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: '#fff' }}>S:</strong> Auto-Block (when facing away)</p>
        <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: '#fff' }}>J:</strong> Punch Strike</p>
        <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: '#fff' }}>K:</strong> Kick Strike</p>
        <p style={{ margin: 0 }}><strong style={{ color: '#00F5D4' }}>U:</strong> Fireball Superpower <span style={{ fontSize: '0.8rem', color: '#8e8e9c' }}>(Cost: 25% SP)</span></p>
      </div>
    </div>
  );
}
