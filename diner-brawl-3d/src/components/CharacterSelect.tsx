import { useState } from 'react';
import { useGameStore } from '../store';
import { ROSTER, type CharacterSpec } from '../roster';

export function CharacterSelect() {
  const setPlayerChar = useGameStore((s) => s.setPlayerChar);
  const setEnemyChar = useGameStore((s) => s.setEnemyChar);
  const setScene = useGameStore((s) => s.setScene);
  const resetGame = useGameStore((s) => s.reset);

  const [selectedP1, setSelectedP1] = useState<CharacterSpec>(ROSTER[0]); // Leo
  const [selectedP2, setSelectedP2] = useState<CharacterSpec>(ROSTER[2]); // Venom

  const handleStartFight = () => {
    setPlayerChar(selectedP1);
    setEnemyChar(selectedP2);
    resetGame();
    setScene('PLAYING');
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #181824 0%, #0c0c0e 100%)',
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
      color: '#fff',
      padding: '40px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Background Grid Effects */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Main Glassmorphic Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '40px',
        width: '100%',
        maxWidth: '1200px',
        height: '90vh',
        padding: '40px',
        background: 'rgba(15, 15, 25, 0.65)',
        backdropFilter: 'blur(30px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '32px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        zIndex: 10,
        boxSizing: 'border-box',
      }}>
        {/* Left Side: Bento Character Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              margin: '0 0 10px 0',
              letterSpacing: '-1px',
              background: 'linear-gradient(135deg, #fff 0%, #a5a5b5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              SELECT YOUR FIGHTER
            </h1>
            <p style={{ color: '#8e8e9c', margin: '0 0 30px 0', fontSize: '1rem' }}>
              Choose a champion to enter the Diner Arena.
            </p>

            {/* Bento Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              maxHeight: '52vh',
              overflowY: 'auto',
              paddingRight: '8px',
            }}>
              {ROSTER.map((char) => {
                const isSelectedP1 = selectedP1.id === char.id;
                const isSelectedP2 = selectedP2.id === char.id;

                return (
                  <div
                    key={char.id}
                    onClick={() => setSelectedP1(char)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedP2(char);
                    }}
                    style={{
                      position: 'relative',
                      padding: '20px',
                      background: isSelectedP1 
                        ? `linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)`
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isSelectedP1 
                        ? `1.5px solid ${char.colorCSS}`
                        : isSelectedP2 
                        ? '1.5px solid #ff5533'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      boxShadow: isSelectedP1 
                        ? `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 15px ${char.colorCSS}33`
                        : 'none',
                    }}
                  >
                    {/* Visual indicators for selected roles */}
                    {isSelectedP1 && (
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: char.colorCSS, color: '#000',
                        fontSize: '0.75rem', fontWeight: 900,
                        padding: '2px 8px', borderRadius: '20px',
                        boxShadow: `0 0 10px ${char.colorCSS}`
                      }}>P1</div>
                    )}
                    {isSelectedP2 && (
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: '#ff5533', color: '#fff',
                        fontSize: '0.75rem', fontWeight: 900,
                        padding: '2px 8px', borderRadius: '20px',
                        boxShadow: `0 0 10px #ff5533`
                      }}>CPU</div>
                    )}

                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>{char.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#8e8e9c' }}>{char.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ color: '#5e5e6c', fontSize: '0.85rem', marginTop: '20px' }}>
            💡 <strong style={{ color: '#8e8e9c' }}>Tip:</strong> Left-click cards to select <span style={{ color: '#00F5D4' }}>P1</span>, right-click to select <span style={{ color: '#ff5533' }}>CPU Opponent</span>.
          </div>
        </div>

        {/* Right Side: Detailed Selection & Stats Visualizer */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
          padding: '30px',
          boxSizing: 'border-box',
        }}>
          {/* Fighter Preview Detail */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
              <div style={{
                width: '70px', height: '70px',
                borderRadius: '16px',
                background: `radial-gradient(circle, ${selectedP1.colorCSS}33 0%, transparent 70%)`,
                border: `1px solid ${selectedP1.colorCSS}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px ${selectedP1.colorCSS}11`
              }}>
                <span style={{ fontSize: '2rem' }}>🥊</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: selectedP1.colorCSS, fontWeight: 900, letterSpacing: '2px' }}>CHAMPION SELECTED</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px' }}>{selectedP1.name}</h2>
              </div>
            </div>

            <blockquote style={{ margin: '0 0 30px 0', paddingLeft: '16px', borderLeft: `3px solid ${selectedP1.colorCSS}`, color: '#a5a5b5', fontSize: '1rem', fontStyle: 'italic' }}>
              "{selectedP1.subtitle}"
            </blockquote>

            {/* Fighter Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#8e8e9c', letterSpacing: '1px' }}>CHARACTER PERFORMANCE</div>

              {/* Speed Metric */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>
                  <span>AGILITY / SPEED</span>
                  <span style={{ color: selectedP1.colorCSS }}>{selectedP1.stats.speed} / 10</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${selectedP1.stats.speed * 10}%`, height: '100%',
                    background: `linear-gradient(90deg, ${selectedP1.colorCSS}bb, ${selectedP1.colorCSS})`,
                    boxShadow: `0 0 10px ${selectedP1.colorCSS}55`,
                    transition: 'width 0.3s ease-out'
                  }} />
                </div>
              </div>

              {/* Power Metric */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>
                  <span>STRIKE POWER</span>
                  <span style={{ color: selectedP1.colorCSS }}>{selectedP1.stats.power} / 10</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${selectedP1.stats.power * 10}%`, height: '100%',
                    background: `linear-gradient(90deg, ${selectedP1.colorCSS}bb, ${selectedP1.colorCSS})`,
                    boxShadow: `0 0 10px ${selectedP1.colorCSS}55`,
                    transition: 'width 0.3s ease-out'
                  }} />
                </div>
              </div>

              {/* Defense Metric */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>
                  <span>ARMOR / DEFENSE</span>
                  <span style={{ color: selectedP1.colorCSS }}>{selectedP1.stats.defense} / 10</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${selectedP1.stats.defense * 10}%`, height: '100%',
                    background: `linear-gradient(90deg, ${selectedP1.colorCSS}bb, ${selectedP1.colorCSS})`,
                    boxShadow: `0 0 10px ${selectedP1.colorCSS}55`,
                    transition: 'width 0.3s ease-out'
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleStartFight}
            style={{
              width: '100%',
              padding: '20px',
              background: `linear-gradient(135deg, ${selectedP1.colorCSS} 0%, ${selectedP1.colorCSS}dd 100%)`,
              color: '#000',
              border: 'none',
              borderRadius: '16px',
              fontSize: '1.25rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: `0 12px 32px ${selectedP1.colorCSS}33, 0 0 20px ${selectedP1.colorCSS}aa`,
              transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
              letterSpacing: '1px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 16px 40px ${selectedP1.colorCSS}44, 0 0 30px ${selectedP1.colorCSS}cc`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 12px 32px ${selectedP1.colorCSS}33, 0 0 20px ${selectedP1.colorCSS}aa`;
            }}
          >
            CONFIRM BRAWL
          </button>
        </div>
      </div>
    </div>
  );
}
