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

const SETTINGS_KEY = 'swiggy_app_scanner_settings';

export function getAppSettings(): AppSetting {
  if (typeof window === 'undefined') return { activeAppId: 'swiggy-clone', appUrl: 'http://localhost:5174', autoLaunch: true };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as AppSetting;
  } catch { /* ignore */ }
  return { activeAppId: 'swiggy-clone', appUrl: 'http://localhost:5174', autoLaunch: true };
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
    color: g.color ?? '#FC8019',
    screenCount: Array.isArray(g.screens) ? g.screens.length : 0,
  }));

  const fw = manifest.framework ?? 'unknown';
  const isExpo = fw.includes('expo');
  const isVite = fw.includes('vite');

  return {
    id: manifest.project ?? 'unknown',
    name: manifest.project ?? 'Unknown App',
    description: manifest.description ?? '',
    appUrl,
    appPath,
    framework: isExpo ? 'expo-router' : isVite ? 'vite-react' : 'unknown',
    totalScreens: manifest.totalScreens ?? 0,
    totalFlows: manifest.totalLinks ?? 0,
    totalComponents: manifest.totalComponents ?? 0,
    totalGames: manifest.totalGames ?? 0,
    totalAnimations: manifest.totalAnimations ?? 0,
    groups,
    hasMobileView: isExpo,
    hasDesktopView: isVite,
    defaultDevice: isExpo ? 'mobile' : 'desktop',
    isRunning: false,
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
    const res = await fetch(appUrl, { mode: 'no-cors', signal: controller.signal });
    clearTimeout(timeout);
    return true; // no-cors doesn't give status but no error = running
  } catch {
    return false;
  }
}

let CONNECTED_APPS: AppProfile[] = [];

CONNECTED_APPS.push({
  id: 'swiggy-clone',
  name: 'Swiggy Clone',
  description: 'Food delivery app clone built with Vite + React. Features auth flow, restaurant browsing, cart management, and checkout.',
  appUrl: 'http://localhost:5174',
  appPath: '/Users/franklawrencejr./Downloads/skills-library-v2 2/swiggy-clone',
  framework: 'vite-react',
  totalScreens: 8,
  totalFlows: 9,
  totalComponents: 14,
  totalGames: 0,
  totalAnimations: 0,
  groups: [
    { id: 'auth', label: 'Auth & Setup', color: '#FC8019', screenCount: 3 },
    { id: 'browse', label: 'Discover', color: '#FFB366', screenCount: 2 },
    { id: 'order', label: 'Order Flow', color: '#E57010', screenCount: 3 },
  ],
  hasMobileView: false,
  hasDesktopView: true,
  defaultDevice: 'desktop',
  isRunning: false,
});

CONNECTED_APPS.push({
  id: 'socialstakes',
  name: 'SocialStakes',
  description: 'Social gaming platform built with Expo Router. Features 24 games, 80 animations, real-time chat, matching, and audience participation.',
  appUrl: 'http://localhost:8081',
  appPath: '/Users/franklawrencejr./socialstakes',
  framework: 'expo-router',
  totalScreens: 179,
  totalFlows: 39,
  totalComponents: 69,
  totalGames: 24,
  totalAnimations: 80,
  groups: [
    { id: 'discover', label: 'Discover', color: '#FF6B6B', screenCount: 22 },
    { id: 'match', label: 'Match', color: '#FF8FA6', screenCount: 18 },
    { id: 'chat', label: 'Chat', color: '#7c9cff', screenCount: 15 },
    { id: 'games', label: 'Games', color: '#4fd6c0', screenCount: 48 },
    { id: 'profile', label: 'Profile', color: '#d68bff', screenCount: 20 },
    { id: 'lonely', label: 'Lonely', color: '#f5c451', screenCount: 12 },
    { id: 'onboarding', label: 'Onboarding', color: '#bfe05a', screenCount: 14 },
    { id: 'settings', label: 'Settings', color: '#aeb6cc', screenCount: 8 },
  ],
  hasMobileView: true,
  hasDesktopView: false,
  defaultDevice: 'mobile',
  isRunning: false,
  tokens: {
    fonts: ['Inter-Bold', 'DMSans-Bold', 'Inter', 'DMMono'],
    colors: ['#07070F', '#FC8019', '#FFB366', '#4ADE80', '#FF4444'],
    spacing: '4px base grid (xs=4, sm=8, md=16, lg=24, xl=32)',
  },
});
