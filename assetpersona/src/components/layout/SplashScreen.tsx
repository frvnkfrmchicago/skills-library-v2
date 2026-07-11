import { useEffect, useState } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  isSuspenseFallback?: boolean;
  onTransitionEnd?: () => void;
}

export default function SplashScreen({
  isSuspenseFallback = false,
  onTransitionEnd
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);

  useEffect(() => {
    // Progress animation simulation for first load
    if (!isSuspenseFallback) {
      const duration = 1200; // ms
      const intervalTime = 20;
      const step = 100 / (duration / intervalTime);

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            // Trigger exit fade-out
            setTimeout(() => {
              setShouldFadeOut(true);
              if (onTransitionEnd) {
                setTimeout(onTransitionEnd, 400); // match CSS fade-out duration
              }
            }, 100);
            return 100;
          }
          return Math.min(prev + step, 100);
        });
      }, intervalTime);

      return () => clearInterval(timer);
    }
  }, [isSuspenseFallback, onTransitionEnd]);

  // SVG parameters for the progress circle
  const radius = 30;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`splash-container ${shouldFadeOut ? 'splash-container--fade-out' : ''} ${
        isSuspenseFallback ? 'splash-container--fallback' : ''
      }`}
      aria-busy="true"
      aria-label="Loading Asset Persona"
    >
      {/* Dynamic ambient orb meshes */}
      <div className="splash-ambient" aria-hidden="true">
        <span className="splash-orb splash-orb--cyan" />
        <span className="splash-orb splash-orb--pink" />
        <span className="splash-orb splash-orb--violet" />
      </div>

      <div className="splash-content">
        {/* Glowing Logo Shell */}
        <div className="splash-logo-wrapper">
          <img
            src="/images/about/logo-pink.webp"
            alt="Asset Persona Logo"
            className="splash-logo"
            width={240}
            height={60}
          />
        </div>

        {/* Custom Progress Indicators */}
        {isSuspenseFallback ? (
          // In Suspense mode, render an infinite spinning loader
          <div className="suspense-loader" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="16"
                className="loader-bg-circle"
                strokeWidth={2}
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                className="loader-fill-circle"
                strokeWidth={2}
              />
            </svg>
            <span className="loader-caption">Loading...</span>
          </div>
        ) : (
          // In First Load mode, render a clean numeric progress ring
          <div className="progress-loader" aria-hidden="true">
            <div className="progress-svg-wrapper">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="progress-bg-circle"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="progress-fill-circle"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="progress-text">{Math.round(progress)}%</div>
            </div>
            <div className="progress-status">Rolling you in...</div>
          </div>
        )}
      </div>
    </div>
  );
}
