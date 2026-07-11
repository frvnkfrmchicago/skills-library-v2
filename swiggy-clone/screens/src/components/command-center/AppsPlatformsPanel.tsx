import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Play, Square, FolderOpen, RefreshCw } from 'lucide-react';
import { colors, typeScale, fontWeight, borderRadius, spacing } from '@/lib/design-tokens';
import { Card } from '@/lib/ui/Card';
import { Badge } from '@/lib/ui/Badge';
import { Button } from '@/lib/ui/Button';
import { StatusDot } from '@/lib/ui/StatusDot';
import { getConnectedApps, checkAppRunning, getAppSettings, saveAppSettings } from '@/lib/asset-resolver';
import type { AppProfile, AppSetting } from '@/lib/asset-resolver';

interface Props {
  accent: string; txtMuted: string; txtHeadline: string; hairline: string;
  /** Called when user wants to open an app in the screens preview */
  onOpenApp?: (appUrl: string, appId: string) => void;
}

export function AppsPlatformsPanel({ accent, txtMuted, txtHeadline, hairline, onOpenApp }: Props) {
  const [apps, setApps] = useState<AppProfile[]>(getConnectedApps());
  const [settings, setSettings] = useState<AppSetting>(getAppSettings());
  const [checking, setChecking] = useState<Record<string, boolean>>({});

  const checkStatus = useCallback(async (app: AppProfile) => {
    setChecking((prev) => ({ ...prev, [app.id]: true }));
    const running = await checkAppRunning(app.appUrl);
    setApps((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, isRunning: running } : a)),
    );
    setChecking((prev) => ({ ...prev, [app.id]: false }));
  }, []);

  // On mount, check all apps
  useEffect(() => {
    getConnectedApps().forEach((app) => checkStatus(app));
  }, [checkStatus]);

  const setActive = (app: AppProfile) => {
    const next: AppSetting = { ...settings, activeAppId: app.id, appUrl: app.appUrl };
    setSettings(next);
    saveAppSettings(next);
    onOpenApp?.(app.appUrl, app.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl, padding: spacing.lg, height: '100%', overflowY: 'auto' }}>
      <div>
        <h3 style={{ fontSize: typeScale.xl, fontWeight: fontWeight.bold, color: txtHeadline, marginBottom: spacing.sm }}>Apps / Platforms</h3>
        <p style={{ fontSize: typeScale.base, color: txtMuted, margin: 0, lineHeight: 1.6 }}>
          Connected apps and platforms detected by the App Scanner. View app details,
          check running status, and launch apps directly.
        </p>
      </div>

      {apps.map((app) => (
        <Card key={app.id} padding="lg">
          {/* Header with running status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <h4 style={{ fontSize: typeScale.xl, fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>{app.name}</h4>
                <StatusDot
                  color={app.isRunning ? colors.semantic.success : colors.text.muted}
                  label={app.isRunning ? 'Running' : 'Offline'}
                />
              </div>
              {app.description && (
                <p style={{ fontSize: typeScale.base, color: txtMuted, margin: `${spacing.xs} 0 0 0`, lineHeight: 1.5 }}>{app.description}</p>
              )}
              <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.xs }}>
                <Badge label={app.framework} color={accent} />
                <Badge label={`Default: ${app.defaultDevice}`} color={colors.text.muted} />
                {settings.activeAppId === app.id && (
                  <Badge label="Active" color={colors.semantic.success} />
                )}
              </div>
            </div>
            {/* Run App button — prominent, always visible */}
            <Button
              label={app.isRunning ? 'Run App' : 'Launch'}
              variant="primary"
              size="md"
              onClick={() => {
                setActive(app);
                window.open(app.appUrl, '_blank');
              }}
              icon={Play}
            />
          </div>

          {/* App URL & Path */}
          <div style={{ marginBottom: spacing.lg, padding: spacing.md, borderRadius: borderRadius.lg, background: 'rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
              <span style={{ fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: '0.06em', color: txtMuted, minWidth: 48 }}>URL</span>
              <code style={{ fontSize: typeScale.sm, color: accent }}>{app.appUrl}</code>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <span style={{ fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: '0.06em', color: txtMuted, minWidth: 48 }}>Path</span>
              <code style={{ fontSize: typeScale.sm, color: txtMuted }}>{app.appPath}</code>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.lg, flexWrap: 'wrap' }}>
            <Button
              label={checking[app.id] ? 'Checking...' : 'Refresh Status'}
              variant="secondary"
              size="sm"
              onClick={() => checkStatus(app)}
              icon={RefreshCw}
            />
            {app.isRunning && (
              <Button
                label="Open in Screens"
                variant="secondary"
                size="sm"
                onClick={() => setActive(app)}
                icon={ExternalLink}
              />
            )}
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: spacing.md, marginBottom: spacing.lg }}>
            {[
              { label: 'Screens', value: app.totalScreens },
              { label: 'Flows', value: app.totalFlows },
              { label: 'Components', value: app.totalComponents },
              { label: 'Games', value: app.totalGames },
              { label: 'Animations', value: app.totalAnimations },
            ].map((stat) => (
              <div key={stat.label} style={{ padding: spacing.md, borderRadius: borderRadius.lg, background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                <p style={{ fontSize: typeScale['2xl'], fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>{stat.value}</p>
                <p style={{ fontSize: typeScale.xs, color: txtMuted, margin: `${spacing.xs} 0 0 0`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Sections */}
          <div style={{ marginBottom: spacing.md }}>
            <p style={{ fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: '0.06em', color: txtMuted, marginBottom: spacing.sm }}>Sections</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
              {app.groups.map((g) => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: `${spacing.xs} ${spacing.sm}`, borderRadius: borderRadius.md, background: `${g.color}15`, border: `1px solid ${g.color}33` }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: g.color, flexShrink: 0 }} />
                  <span style={{ fontSize: typeScale.sm, fontWeight: fontWeight.semibold, color: txtHeadline }}>{g.label}</span>
                  <span style={{ fontSize: typeScale.xs, color: txtMuted }}>{g.screenCount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Adapted Tokens */}
          {app.tokens && (
            <div style={{ marginBottom: spacing.md }}>
              <p style={{ fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: '0.06em', color: txtMuted, marginBottom: spacing.sm }}>Adapted Tokens</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
                {app.tokens.fonts && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <span style={{ fontSize: typeScale.sm, fontWeight: fontWeight.semibold, color: txtMuted, minWidth: 80 }}>Fonts</span>
                    <span style={{ fontSize: typeScale.sm, color: txtHeadline }}>{app.tokens.fonts.join(', ')}</span>
                  </div>
                )}
                {app.tokens.spacing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <span style={{ fontSize: typeScale.sm, fontWeight: fontWeight.semibold, color: txtMuted, minWidth: 80 }}>Spacing</span>
                    <span style={{ fontSize: typeScale.sm, color: txtHeadline }}>{app.tokens.spacing}</span>
                  </div>
                )}
                {app.tokens.colors && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <span style={{ fontSize: typeScale.sm, fontWeight: fontWeight.semibold, color: txtMuted, minWidth: 80 }}>Colors</span>
                    <div style={{ display: 'flex', gap: spacing.xs }}>
                      {app.tokens.colors.map((c) => (
                        <span key={c} style={{ width: 20, height: 20, borderRadius: borderRadius.sm, backgroundColor: c, border: '1px solid rgba(255,255,255,0.1)' }} title={c} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Device Support */}
          <div>
            <p style={{ fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: '0.06em', color: txtMuted, marginBottom: spacing.sm }}>Device Support</p>
            <div style={{ display: 'flex', gap: spacing.md }}>
              <span style={{ fontSize: typeScale.sm, color: app.hasMobileView ? colors.semantic.success : txtMuted }}>{app.hasMobileView ? 'Mobile' : 'No Mobile'}</span>
              <span style={{ fontSize: typeScale.sm, color: app.hasDesktopView ? colors.semantic.success : txtMuted }}>{app.hasDesktopView ? 'Desktop' : 'No Desktop'}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
