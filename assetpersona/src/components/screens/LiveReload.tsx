/**
 * LiveReload context — watches the Swiggy app for file changes and reloads
 * all preview iframes in real-time.
 *
 * Works by polling the app server's Last-Modified header every 2 seconds.
 * When it changes, all registered iframes are reloaded via postMessage.
 *
 * Usage:
 *   <LiveReloadProvider>
 *     ...app...
 *   </LiveReloadProvider>
 *
 * Then in any component with iframes:
 *   const { registerIframe } = useLiveReload();
 *   registerIframe(iframeRef);
 */

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  type RefObject,
} from 'react';

interface LiveReloadContextValue {
  /** Register an iframe to receive reload signals. */
  registerIframe: (ref: RefObject<HTMLIFrameElement | null>) => void;
  /** Unregister an iframe. */
  unregisterIframe: (ref: RefObject<HTMLIFrameElement | null>) => void;
  /** Force reload all iframes now. */
  reloadAll: () => void;
  /** Current state: 'watching' | 'changed' | 'reloading' */
  status: 'watching' | 'changed' | 'reloading';
}

const LiveReloadContext = createContext<LiveReloadContextValue>({
  registerIframe: () => {},
  unregisterIframe: () => {},
  reloadAll: () => {},
  status: 'watching',
});

const APP_URL = '/index.html';
const POLL_INTERVAL = 2000;

export function LiveReloadProvider({ children }: { children: React.ReactNode }) {
  const iframeRefs = useRef<Set<RefObject<HTMLIFrameElement | null>>>(new Set());
  const lastModified = useRef<string>('');
  const [status, setStatus] = useState<'watching' | 'changed' | 'reloading'>('watching');

  const reloadAll = useCallback(() => {
    setStatus('reloading');
    for (const ref of iframeRefs.current) {
      const el = ref.current;
      if (el && el.contentWindow) {
        try {
          el.contentWindow.location.reload();
        } catch {
          // Cross-origin fallback: re-set src
          el.src = el.src;
        }
      }
    }
    setTimeout(() => setStatus('watching'), 800);
  }, []);

  const registerIframe = useCallback((ref: RefObject<HTMLIFrameElement | null>) => {
    iframeRefs.current.add(ref);
  }, []);

  const unregisterIframe = useCallback((ref: RefObject<HTMLIFrameElement | null>) => {
    iframeRefs.current.delete(ref);
  }, []);

  // Poll the app server for changes
  useEffect(() => {
    let active = true;

    const check = async () => {
      if (!active) return;
      try {
        const res = await fetch(APP_URL, { method: 'HEAD', cache: 'no-store' });
        const lm = res.headers.get('Last-Modified') ?? '';
        if (lastModified.current && lm && lm !== lastModified.current) {
          setStatus('changed');
          setTimeout(() => {
            if (active) reloadAll();
          }, 300);
        }
        if (lm) lastModified.current = lm;
      } catch {
        // Server might be down briefly
      }
    };

    // Initial check
    check();
    const interval = setInterval(check, POLL_INTERVAL);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [reloadAll]);

  return (
    <LiveReloadContext.Provider value={{ registerIframe, unregisterIframe, reloadAll, status }}>
      {children}
    </LiveReloadContext.Provider>
  );
}

export function useLiveReload() {
  return useContext(LiveReloadContext);
}
