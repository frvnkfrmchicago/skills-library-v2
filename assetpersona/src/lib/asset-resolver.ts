/**
 * App Scanner — adaptable platform functionality detector.
 *
 * ARCHITECTURE NOTE:
 * This version is clone-specific (tracks cloned apps).
 * The clone tracking feature can be removed by:
 *   1. Removing the `cloneId` fields from FeatureEntry in types.ts
 *   2. Removing the CloneRegistry panel from CommandCenterView
 *   3. Removing `clones` from the store and state
 * After removal, this becomes a generic App Scanner suitable for
 * the App Scanner Librarian skill to deploy for any connected app.
 */

export interface AppProfile {
  id: string;
  name: string;
  /** Short description of what this app does */
  description: string;
  /** URL where the running app is served (e.g. http://localhost:5174) */
  appUrl: string;
  /** Absolute path to the app's root directory on disk */
  appPath: string;
  framework: 'vite-react' | 'expo-router' | 'nextjs' | 'unknown';
  totalScreens: number;
  totalFlows: number;
  totalComponents: number;
  totalGames: number;
  totalAnimations: number;
  groups: Array<{
    id: string;
    label: string;
    color: string;
    screenCount: number;
  }>;
  tokens?: {
    fonts?: string[];
    colors?: string[];
    spacing?: string;
  };
  hasMobileView: boolean;
  hasDesktopView: boolean;
  defaultDevice: 'mobile' | 'tablet' | 'desktop';
  /** Whether the app is currently running and reachable */
  isRunning: boolean;
}

export interface AppSetting {
  activeAppId: string;
  appUrl: string;
  autoLaunch: boolean;
}

const SETTINGS_KEY = 'assetpersona_app_scanner_settings';

export function getAppSettings(): AppSetting {
  const defaultUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  if (typeof window === 'undefined') return { activeAppId: 'assetpersona', appUrl: defaultUrl, autoLaunch: true };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as AppSetting;
  } catch { /* ignore */ }
  return { activeAppId: 'assetpersona', appUrl: defaultUrl, autoLaunch: true };
}

export function saveAppSettings(settings: AppSetting): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Build an AppProfile from a screen manifest JSON object. */
export function buildAppProfile(manifest: {
  project?: string;
  description?: string;
  framework?: string;
  totalScreens?: number;
  totalLinks?: number;
  totalComponents?: number;
  totalGames?: number;
  totalAnimations?: number;
  groups?: Array<{
    id: string;
    label: string;
    color?: string;
    screens?: unknown[];
    icon?: string;
    flowOrder?: number;
  }>;
}, appUrl = '', appPath = ''): AppProfile {
  const groups = (manifest.groups ?? []).map((g) => ({
    id: g.id,
    label: g.label,
    color: g.color ?? '#33fecc',
    screenCount: Array.isArray(g.screens) ? g.screens.length : 0,
  }));

  const fw = manifest.framework ?? 'vite-react';
  const isExpo = fw.includes('expo');
  const isVite = fw.includes('vite');

  return {
    id: manifest.project ?? 'assetpersona',
    name: manifest.project ?? 'Asset Persona',
    description: manifest.description ?? '',
    appUrl,
    appPath,
    framework: isExpo ? 'expo-router' : isVite ? 'vite-react' : 'vite-react',
    totalScreens: manifest.totalScreens ?? 0,
    totalFlows: manifest.totalLinks ?? 0,
    totalComponents: manifest.totalComponents ?? 0,
    totalGames: manifest.totalGames ?? 0,
    totalAnimations: manifest.totalAnimations ?? 0,
    groups,
    hasMobileView: true,
    hasDesktopView: true,
    defaultDevice: 'desktop',
    isRunning: true,
  };
}

export function getConnectedApps(): AppProfile[] {
  return CONNECTED_APPS;
}

export function registerApp(manifest: Parameters<typeof buildAppProfile>[0], appUrl = '', appPath = ''): AppProfile {
  const profile = buildAppProfile(manifest, appUrl, appPath);
  const existing = CONNECTED_APPS.findIndex((a) => a.id === profile.id);
  if (existing >= 0) CONNECTED_APPS[existing] = profile;
  else CONNECTED_APPS.push(profile);
  return profile;
}

/** Check if an app is running by pinging its URL. */
export async function checkAppRunning(appUrl: string): Promise<boolean> {
  if (!appUrl) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(appUrl, { mode: 'no-cors', signal: controller.signal });
    clearTimeout(timeout);
    return true; // no-cors doesn't give status but no error = running
  } catch {
    return false;
  }
}

let CONNECTED_APPS: AppProfile[] = [];

CONNECTED_APPS.push({
  id: 'assetpersona',
  name: 'Asset Persona',
  description: 'Premium personal brand & vibe coding curriculum workspace with live course, showcase gallery, timed exams, and community forums.',
  appUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  appPath: '/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona',
  framework: 'vite-react',
  totalScreens: 33,
  totalFlows: 20,
  totalComponents: 15,
  totalGames: 1,
  totalAnimations: 10,
  groups: [
    { id: 'marketing', label: 'Marketing', color: '#33fecc', screenCount: 7 },
    { id: 'auth', label: 'Auth & Setup', color: '#33fecc', screenCount: 3 },
    { id: 'community', label: 'Community', color: '#33fecc', screenCount: 15 },
    { id: 'admin', label: 'Admin', color: '#33fecc', screenCount: 8 },
  ],
  hasMobileView: true,
  hasDesktopView: true,
  defaultDevice: 'desktop',
  isRunning: true,
});
