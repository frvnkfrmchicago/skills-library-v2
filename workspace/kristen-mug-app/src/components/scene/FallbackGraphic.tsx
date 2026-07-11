export default function FallbackGraphic() {
  return (
    <div className="fallback-container">
      {/* Dynamic Background */}
      <div className="fallback-bg" />
      
      {/* 2D Coffee Cup Graphic */}
      <div className="fallback-content animate-float">
        <svg 
          width="160" 
          height="160" 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 0 25px rgba(255,105,180,0.5))' }}
        >
          {/* Steam lines */}
          <path d="M35 15 C37 10, 33 5, 35 0" stroke="#ffc0cb" strokeWidth="2" strokeLinecap="round" className="steam-particle" style={{ animationDelay: '0.2s' }} />
          <path d="M50 18 C53 12, 47 6, 50 1" stroke="#ff69b4" strokeWidth="2.5" strokeLinecap="round" className="steam-particle" style={{ animationDelay: '0.8s' }} />
          <path d="M65 15 C67 9, 63 4, 65 0" stroke="#ffc0cb" strokeWidth="2" strokeLinecap="round" className="steam-particle" style={{ animationDelay: '0.5s' }} />
          
          {/* Mug body - clean glaze */}
          <path d="M25 30 L75 30 C75 30, 72 75, 50 75 C28 75, 25 30, 25 30 Z" fill="#ff69b4" />
          
          {/* Mug handle shaped like a 'K' */}
          <path 
            d="M 72 35 H 78 V 65 H 72 Z M 77 47 L 89 35 H 96 L 81 50 Z M 77 50 L 89 65 H 96 L 81 50 Z" 
            fill="#ff69b4" 
          />
        </svg>

        <p className="fallback-text">
          Coffee &amp; Music are dancing
        </p>
      </div>
    </div>
  );
}
