import { useState, useEffect } from 'react';
import { Image, Film, Music, FileText, RefreshCw } from 'lucide-react';
import { colors, typeScale, fontWeight, borderRadius, spacing } from '@/lib/design-tokens';
import { Card } from '@/lib/ui/Card';
import { Badge } from '@/lib/ui/Badge';
import { Button } from '@/lib/ui/Button';
import { getAppSettings } from '@/lib/asset-resolver';

/**
 * In-App Assets panel — shows images, videos, audio, and content
 * from the connected app's asset directories.
 *
 * The App Scanner skill reads each app's manifest to discover asset folders.
 */

type AssetKind = 'image' | 'video' | 'audio' | 'content';

interface AssetFile {
  relPath: string;
  name: string;
  ext: string;
  kind: AssetKind;
}

interface AssetCategory {
  id: string;
  label: string;
  baseRelDir: string;
  files: AssetFile[];
}

interface Props {
  accent: string;
  txtMuted: string;
  txtHeadline: string;
  hairline: string;
}

function iconForKind(kind: AssetKind): typeof Image {
  switch (kind) {
    case 'image':
      return Image;
    case 'video':
      return Film;
    case 'audio':
      return Music;
    case 'content':
    default:
      return FileText;
  }
}

export function AssetsPanel({ accent, txtMuted, txtHeadline, hairline }: Props) {
  const settings = getAppSettings();
  const activeAppId = settings.activeAppId;
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AssetCategory[]>([]);

  const toggleCat = (key: string) => {
    setExpandedCats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalAssets = categories.reduce((sum, c) => sum + c.files.length, 0);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/app-scanner/assets?appId=${encodeURIComponent(activeAppId)}`);
      const json = (await res.json()) as { success: boolean; data?: { assets?: AssetCategory[] }; error?: { message?: string } };
      if (!json.success) throw new Error(json.error?.message ?? 'Failed to load assets');
      setCategories(json.data?.assets ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAppId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl, padding: spacing.lg, height: '100%', overflowY: 'auto' }}>
      <div>
        <h3 style={{ fontSize: typeScale.xl, fontWeight: fontWeight.bold, color: txtHeadline, marginBottom: spacing.sm }}>In-App Assets</h3>
        <p style={{ fontSize: typeScale.base, color: txtMuted, margin: 0, lineHeight: 1.6 }}>
          Images, videos, audio, and content files detected for the active app.
        </p>
        <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.md }}>
          <Badge label={`${totalAssets} files`} color={accent} />
          <Badge label={`${categories.length} categories`} color={colors.text.muted} />
          <div style={{ marginLeft: 'auto' }}>
            <Button size="sm" variant="secondary" onClick={loadAssets}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: spacing.lg, borderRadius: borderRadius.xl, border: `1px solid ${hairline}`, background: 'rgba(0,0,0,0.25)' }}>
          <p style={{ margin: 0, fontSize: typeScale.base, color: txtHeadline, fontWeight: fontWeight.semibold }}>Assets not available</p>
          <p style={{ margin: `${spacing.xs} 0 0 0`, fontSize: typeScale.sm, color: txtMuted, lineHeight: 1.5 }}>{error}</p>
          <p style={{ margin: `${spacing.sm} 0 0 0`, fontSize: typeScale.sm, color: txtMuted, lineHeight: 1.5 }}>
            Tip: register the app in Apps/Platforms (so it has an app path), then refresh.
          </p>
        </div>
      )}

      {categories.map((cat, idx) => {
        const key = `${cat.id}-${idx}`;
        const expanded = expandedCats[key] ?? true;
        const dominantKind: AssetKind = cat.files.find((f) => f.kind !== 'content')?.kind ?? 'content';
        const Icon = iconForKind(dominantKind);

        return (
          <Card key={key} padding="md">
            <button
              onClick={() => toggleCat(key)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: borderRadius.md,
                  background: dominantKind === 'image' ? '#FC801922' : dominantKind === 'video' ? '#4ADE8022' : dominantKind === 'audio' ? '#7C9CFF22' : '#FF6B6B22',
                  color: dominantKind === 'image' ? '#FC8019' : dominantKind === 'video' ? '#4ADE80' : dominantKind === 'audio' ? '#7C9CFF' : '#FF6B6B',
                }}>
                  <Icon size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: typeScale.base, fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>{cat.label}</p>
                  <p style={{ fontSize: typeScale.xs, color: txtMuted, margin: 0 }}>{cat.files.length} files</p>
                </div>
              </div>
              <span style={{ fontSize: typeScale.lg, color: txtMuted }}>{expanded ? '\u25B4' : '\u25BE'}</span>
            </button>

            {expanded && (
              <div style={{ marginTop: spacing.md }}>
                <div style={{ padding: `${spacing.xs} ${spacing.sm}`, borderRadius: borderRadius.md, background: 'rgba(0,0,0,0.2)', marginBottom: spacing.md }}>
                  <code style={{ fontSize: typeScale.xs, color: txtMuted, wordBreak: 'break-all' }}>{cat.baseRelDir}</code>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: spacing.sm }}>
                  {cat.files.map((file) => (
                    <div
                      key={file.relPath}
                      style={{
                        display: 'flex', alignItems: 'center', gap: spacing.sm,
                        padding: `${spacing.sm} ${spacing.md}`, borderRadius: borderRadius.md,
                        background: 'rgba(0,0,0,0.15)', cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.15)'; }}
                      onClick={() => {
                        navigator.clipboard.writeText(file.relPath);
                      }}
                      title={`Click to copy relative path: ${file.relPath}`}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
                      {file.kind === 'image' ? (
                        <img
                          src={`/api/app-scanner/file?appId=${encodeURIComponent(activeAppId)}&relPath=${encodeURIComponent(file.relPath)}`}
                          alt={file.name}
                          style={{ width: 28, height: 28, borderRadius: borderRadius.sm, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                      ) : null}
                      <span style={{ fontSize: typeScale.sm, color: txtHeadline, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
