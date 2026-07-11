import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './interactive.css';
// LandingV2.css is imported by LandingV2.tsx itself, which is now lazy-loaded.
// Importing it here forced it onto every route (admin, community, etc.).
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
