import { useState, useEffect } from 'react';
import SceneCanvas from './components/scene/SceneCanvas';
import AudioEngine from './components/audio/AudioEngine';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { registerServiceWorker } from './registerSW';
import { Coffee, Settings, Heart, Download } from 'lucide-react';

// Preset colors for the ceramic glaze
const MUG_PRESETS = [
  { name: 'Barbie Pink', value: '#ff69b4' },
  { name: 'Lavender Cupcake', value: '#d6a2e8' },
  { name: 'Matcha Foam', value: '#b5e2b9' },
  { name: 'Creamy Latte', value: '#e6ccb2' },
  { name: 'Cozy Espresso', value: '#3d251e' }
];

export default function App() {
  const [mugColor, setMugColor] = useState<string>('#ff69b4');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Audio state
  const { init: initAnalyzer, analyserRef } = useAudioAnalyzer();

  // PWA Installation prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(false);

  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Listen for PWA installation prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install choice outcome: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  return (
    <div className="app-container">
      
      {/* Decorative top pink light */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '350px',
          height: '150px',
          backgroundColor: 'rgba(255,105,180,0.15)',
          filter: 'blur(120px)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0
        }} 
      />

      {/* Main Container */}
      <main className="main-content">
        
        {/* Header Section */}
        <header className="header-bar glass-panel">
          <div className="header-title-section">
            <div className="header-logo">
              <Coffee size={24} />
            </div>
            <div className="header-info">
              <h1>
                Brew &amp; Beat <span className="header-tag">v2.0</span>
              </h1>
              <p className="header-subtext">
                An Interactive Sound Space for Kristen
              </p>
            </div>
          </div>
          
          {/* Action and Download Buttons */}
          <div className="header-actions">
            {showInstallBtn && (
              <button onClick={handleInstallApp} className="install-btn">
                <Download size={14} />
                Install App
              </button>
            )}
            <div className="heart-badge">
              <Heart size={10} className="heart-icon" />
              Sipped with Love
            </div>
          </div>
        </header>

        {/* Dynamic Dual-Panel Dashboard */}
        <div className="dashboard-grid">
          
          {/* Left Panel: 3D Interactive Coffee Mug Visualizer */}
          <section className="visualizer-panel glass-panel">
            
            {/* Visualizer header status */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 20, display: 'flex', gap: '8px' }}>
              <span className="audio-status-badge">
                <span className={`dot-indicator ${isPlaying ? 'active' : ''}`} />
                {isPlaying ? 'Beats Active' : 'Select a Beat'}
              </span>
            </div>

            {/* Canvas wrapper */}
            <div className="canvas-container">
              <SceneCanvas 
                mugColor={mugColor} 
                analyserRef={analyserRef} 
                isPlaying={isPlaying} 
              />
            </div>

            {/* Custom Instruction footer */}
            <div className="instruction-footer">
              <span>🖱️ Drag to rotate mug</span>
              <span>🔍 Pinch / Scroll to zoom</span>
            </div>
          </section>

          {/* Right Panel: Audio Dashboard & Customizer Settings */}
          <section className="controls-sidebar">
            
            {/* Customizer Panel */}
            <div className="sidebar-panel glass-panel">
              <div className="panel-header">
                <Settings size={18} style={{ color: '#ff69b4' }} />
                <h2>Mug Customizer</h2>
              </div>

              {/* Ceramic glaze color chooser */}
              <div className="flex flex-col gap-2">
                <label className="input-label">
                  Ceramic Glaze Color
                </label>
                <div className="color-picker-row">
                  {MUG_PRESETS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setMugColor(color.value)}
                      title={color.name}
                      style={{ backgroundColor: color.value }}
                      className={`color-btn ${mugColor === color.value ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Music controls & playlist panel */}
            <div className="sidebar-panel glass-panel" style={{ flex: 1, justifyContent: 'space-between' }}>
              <AudioEngine 
                analyserInit={initAnalyzer} 
                isPlaying={isPlaying} 
                setIsPlaying={setIsPlaying} 
              />
            </div>

          </section>

        </div>

        {/* Footer Info */}
        <footer className="app-footer">
          Brew &amp; Beat PWA &copy; 2026. Made with Barbie Pink, Lofi Coffee Beans, and R3F.
        </footer>

      </main>
    </div>
  );
}
