/* ============================================================================
 * ScreenDetail.tsx — the heart of the /screens tool
 * ----------------------------------------------------------------------------
 * Lane F of WAVE-SCREENS-PRO-2026-05-25 (Batch 2 · consumes Lane B + Lane D).
 *
 * The owner's complaint was that the rail was a column of stacked "fat-ass
 * boxes" he had to scroll. This file now ORCHESTRATES an engaging, flip-through
 * rail (the panels themselves live in ./../../components/screens/ScreenDetailPanels):
 *
 *   • The HEADER, the Phone/Desktop device tabs, and the live FitPreview are
 *     kept EXACTLY as they were (owner: keep — he likes the device toggle).
 *   • An always-visible "What this page communicates" PURPOSE block sits at the
 *     top of the rail (Lane B `screen.purpose` → graceful fallback).
 *   • A <SegmentedControl> filter — States · Buttons · Links · Notes — shows
 *     ONE panel at a time, so the rail flips instead of scrolling (mirrors the
 *     Phone/Desktop toggle the owner already likes). A mint dirty-dot lights on
 *     the Notes segment when a note exists (Lane D `useScreenNoteFlag`).
 *   • States  → a slider/stepper driving the existing `&state=` iframe param.
 *   • Buttons → a wired/stub chip grid inside a Framer `layout` accordion.
 *   • Links   → "Where you can go" as a tidy grid (jump-to-screen kept).
 *   • Notes   → the Lane D <ScreenNotes> component.
 *   • APIs    → an optional block when endpoints are derivable from targets.
 *
 * Section IDENTITY color comes from Lane E (`colors.section` / the per-group
 * map) when present, GUARDED with `?.` because Lane E lands concurrently; mint
 * stays the single interactive-state accent (anti-pill mandate). All chrome is
 * glass; every blur/alpha/shadow/duration is a Contract-2 token. Motion runs on
 * the frozen `--gh-dur-*`/`--gh-ease-*` tokens and collapses under
 * `prefers-reduced-motion`.
 *
 * Skill: component-building/SKILL.md (Expandable-Card accordion :132-147,
 * reduced-motion :187-195). Librarian: interactive-animation-librarian.md
 * ("Animation should react, not just play"). Pattern (2026): Storybook docs
 * "when to use / Don't use this for" —
 * https://www.supernova.io/blog/top-storybook-documentation-examples-and-the-lessons-you-can-learn
 * ========================================================================== */

import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ExternalLink,
  Eye,
  Layout as LayoutIcon,
  ListChecks,
  Monitor,
  MousePointerClick,
  NotebookPen,
  RotateCcw,
  Smartphone,
  X,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import CanvasPreview from './CanvasPreview';
import * as tokens from '@/lib/design-tokens';
import { colors, withOpacity } from '@/lib/design-tokens';
import manifestData from './screen-manifest.json';
import type { ScreenCapability } from '@/lib/manifest-types';
import { SegmentedControl, type SegmentedOption } from '@/lib/ui/SegmentedControl';
import { useScreenNoteFlag } from './ScreenNotes';
import {
  AnimationsPanel,
  ApisPanel,
  ButtonsPanel,
  CapabilitiesPanel,
  LinksPanel,
  NotesPanel,
  PurposePanel,
  StatesPanel,
  TrackedTopStrip,
  countAnimations,
  deriveApis,
  stateTint,
  type AnimationEntry,
} from './ScreenDetailPanels';

/* ─── Contract 1 — enriched manifest shapes (published here for Lane C/F) ─── */

/** An outbound navigation edge detected from the source (link/router/dynamic/…). */
export interface ScreenLink {
  target: string;
  label: string;
  via: string;
}

/** One interactive element on a screen + whether it is wired up. */
export interface ScreenButton {
  label: string;
  /** Plain-language verdict of what the control does (e.g. "Navigates"). */
  action: string;
  /** Destination path when the action navigates, else null. */
  target: string | null;
  /** True when the handler does real work; false for stubs / no-ops. */
  functional: boolean;
}

/** A previewable state of the screen. `id` is the 5-value canon. */
export interface ScreenState {
  id: 'populated' | 'loading' | 'error' | 'empty' | 'interactive' | string;
  label: string;
  summary: string;
}

/**
 * Enriched screen record (Contract 1). Legacy `string[]` shapes from the
 * hand-authored manifest groups are tolerated by the normalizers below, so a
 * mixed manifest never crashes the panel.
 */
export interface ScreenDef {
  path: string;
  label: string;
  /** Parent-context dedupe label; unique across the manifest. */
  displayLabel?: string;
  /** Lane B (Contract 1): one-sentence "what this page communicates". */
  purpose?: string;
  linksTo?: ScreenLink[] | string[];
  buttons?: ScreenButton[];
  states?: ScreenState[] | string[];
  hasLoading?: boolean;
  hasError?: boolean;
  /** Lane B (locked contract): auto-scanned motion inventory for this screen. */
  animations?: AnimationEntry[];
}

/** Re-export the Lane B motion-entry shape so consumers can type against it
 * from the same module they import `ScreenDef` from. */
export type { AnimationEntry };

export interface GroupDef {
  id: string;
  label: string;
  color: string;
  icon: string;
  flowOrder: number;
  screens: ScreenDef[];
}

/* ─── Contract 3 — the props page.tsx mounts against (unchanged) ─── */

export interface ScreenDetailProps {
  screen: ScreenDef;
  group: GroupDef;
  device: 'mobile' | 'desktop' | 'tablet';
  onDeviceChange: (d: 'mobile' | 'desktop' | 'tablet') => void;
  /** Current state id ('populated' is the default). */
  previewState: string;
  onStateChange: (id: string) => void;
  onSelectLink: (path: string) => void;
  reloadKey: number;
  onReload: () => void;
  onClose: () => void;
  accent: string;
}

/* ─── Lavender type ramp (one family; mint reserved for active + dots). One
 * source of record (lib/design-tokens) — zero raw hex here. ─── */
const TXT_HEADLINE = colors.text.headline;
const TXT_SECONDARY = colors.text.secondary;
const TXT_MUTED = colors.text.muted;
const HAIRLINE = withOpacity(colors.text.primary, 0.08);

/* ─── Manifest-wide lookups (read-only; Contract 1).
 * displayLabel for link/button target labels, AND purpose keyed by path. The
 * purpose map is the resilient bridge for Lane B's contract: the manifest
 * carries `purpose` on every screen, but the screen object handed to this panel
 * is normalized upstream (page.tsx `normalizeScreen`, owned by Lane E) and may
 * not forward the field. We therefore consume `screen.purpose` first, then fall
 * back to this manifest map by path — so the contract renders regardless of the
 * upstream normalizer. The Lane B `animations[]` contract gets the SAME bridge:
 * the manifest carries it on every screen, but the upstream normalizer may strip
 * it, so we consume `screen.animations` first and fall back to this map by path.
 * ─── */
const DISPLAY_LABEL_BY_PATH: Record<string, string> = {};
const PURPOSE_BY_PATH: Record<string, string> = {};
const CAPABILITIES_BY_PATH: Record<string, ScreenCapability[]> = {};
const ANIMATIONS_BY_PATH: Record<string, AnimationEntry[]> = {};
type ManifestScreenLite = {
  path: string;
  label?: string;
  displayLabel?: string;
  purpose?: string;
  capabilities?: ScreenCapability[];
  animations?: AnimationEntry[];
};
(() => {
  for (const g of (manifestData as { groups: { screens: ManifestScreenLite[] }[] }).groups) {
    for (const s of g.screens) {
      if (s.displayLabel) DISPLAY_LABEL_BY_PATH[s.path] = s.displayLabel;
      else if (s.label) DISPLAY_LABEL_BY_PATH[s.path] = s.label;
      if (s.purpose) PURPOSE_BY_PATH[s.path] = s.purpose;
      if (Array.isArray(s.capabilities) && s.capabilities.length > 0) {
        CAPABILITIES_BY_PATH[s.path] = s.capabilities;
      }
      if (Array.isArray(s.animations) && s.animations.length > 0) {
        ANIMATIONS_BY_PATH[s.path] = s.animations as AnimationEntry[];
      }
    }
  }
})();

/* ─── Lane E (read-only, GUARDED): section identity hue keyed by group id.
 * `colors.section` is a hue palette; the per-group assignment is exported as
 * `SECTION_COLOR_BY_GROUP` from the same token module. We resolve the screen's
 * group to a hue, falling back to the group's own `color`, then mint — every
 * lookup is `?.`-guarded so this never throws even if Lane E's map lags the
 * manifest. Mint stays the single interactive-state accent. ─── */
const SECTION_HUE_BY_GROUP = (tokens as { SECTION_COLOR_BY_GROUP?: Record<string, string> })
  .SECTION_COLOR_BY_GROUP;

function sectionAccentFor(group: GroupDef, fallback: string): string {
  return SECTION_HUE_BY_GROUP?.[group.id] ?? group.color ?? fallback;
}

/* ─── Normalizers — tolerate the legacy `string[]` manifest groups ─── */

function normalizeStates(states: ScreenDef['states']): ScreenState[] {
  if (!states || states.length === 0) {
    // Contract 1 guarantees ≥1 state; this is the defensive floor only.
    return [{ id: 'populated', label: 'Default', summary: 'Default view with content loaded' }];
  }
  if (typeof states[0] === 'string') {
    // Hand-authored group: a list of descriptive strings → fold into populated.
    const summary = (states as string[]).join(' · ');
    return [{ id: 'populated', label: 'Default', summary: summary || 'Default view' }];
  }
  return states as ScreenState[];
}

function normalizeLinks(linksTo: ScreenDef['linksTo']): ScreenLink[] {
  if (!linksTo || linksTo.length === 0) return [];
  if (typeof linksTo[0] === 'string') {
    return (linksTo as string[]).map((target) => ({ target, label: target, via: 'link' }));
  }
  return linksTo as ScreenLink[];
}

/** Preview URL: gallery on :5173, app on :8080 — absolute URL to the prototype. */
function previewSrc(path: string, stateId: string): string {
  const params = new URLSearchParams({ screen: path });
  if (stateId && stateId !== 'populated') {
    params.set('state', stateId);
  }
  return `/index.html?${params.toString()}`;
}

/* The detail rail's flip-through filter values. */
type PanelId = 'states' | 'buttons' | 'links' | 'capabilities' | 'animations' | 'notes';

/* ─── Icon for the group chrome (decorative; defaults are fine) ─── */
function GroupGlyph({ className }: { className?: string }) {
  return <LayoutIcon className={className} />;
}

/* ============================================================================
 * Component
 * ========================================================================== */

export function ScreenDetail({
  screen,
  group,
  device,
  onDeviceChange,
  previewState,
  onStateChange,
  onSelectLink,
  reloadKey,
  onReload,
  onClose,
  accent,
}: ScreenDetailProps) {
  const states = useMemo(() => normalizeStates(screen.states), [screen.states]);
  const links = useMemo(() => normalizeLinks(screen.linksTo), [screen.linksTo]);
  const buttons = useMemo<ScreenButton[]>(() => {
    const list = (screen.buttons ?? []).slice();
    // Functional first, then by label — answers "what's functional" at a glance.
    list.sort((a, b) => {
      if (a.functional !== b.functional) return a.functional ? -1 : 1;
      return a.label.localeCompare(b.label);
    });
    return list;
  }, [screen.buttons]);
  const apis = useMemo(() => deriveApis(buttons, links), [buttons, links]);

  // Lane B contract: consume `screen.animations` first, fall back to the
  // manifest-by-path bridge when the upstream normalizer strips the field
  // (exact pattern as PURPOSE_BY_PATH above). Auto-tracked — never hand-authored.
  const animations = useMemo<AnimationEntry[]>(
    () => screen.animations ?? ANIMATIONS_BY_PATH[screen.path] ?? [],
    [screen.animations, screen.path],
  );
  const capabilities = useMemo<ScreenCapability[]>(
    () => CAPABILITIES_BY_PATH[screen.path] ?? [],
    [screen.path],
  );
  const capabilityCount = capabilities.filter((c) => c.functional).length;
  const animationCount = useMemo(() => countAnimations(animations), [animations]);

  const title = screen.displayLabel ?? screen.label;
  // Guard: if the incoming state id isn't catalogued, fall back to populated.
  const activeStateId = states.some((s) => s.id === previewState) ? previewState : 'populated';
  const activeState = states.find((s) => s.id === activeStateId) ?? states[0];
  const functionalCount = buttons.filter((b) => b.functional).length;

  // Section identity hue (Lane E, guarded) for the header chip + purpose rail;
  // mint (`accent`) remains the interactive-state accent everywhere else.
  const sectionAccent = sectionAccentFor(group, accent);
  const accentSoft = withOpacity(sectionAccent, 0.14);
  const accentLine = withOpacity(sectionAccent, 0.28);

  // Lane D dirty-dot for the Notes segment.
  const noteDirty = useScreenNoteFlag(screen.path);

  // The flip-through filter. Default to States so the slider greets the user.
  const [panel, setPanel] = useState<PanelId>('states');

  const labelForPath = (path: string) => DISPLAY_LABEL_BY_PATH[path] ?? path;

  const filterOptions: SegmentedOption<PanelId>[] = [
    { value: 'states', label: 'States', icon: <Eye className="h-3.5 w-3.5" /> },
    { value: 'buttons', label: 'Buttons', icon: <MousePointerClick className="h-3.5 w-3.5" /> },
    { value: 'links', label: 'Links', icon: <ArrowRight className="h-3.5 w-3.5" /> },
    {
      value: 'capabilities',
      label: 'Caps',
      icon: (
        <span className="relative inline-flex items-center">
          <ListChecks className="h-3.5 w-3.5" />
          {capabilities.length > 0 && (
            <span
              className="ml-0.5 font-mono text-[10px] font-bold tabular-nums leading-none"
              style={{ color: panel === 'capabilities' ? colors.brandGreen : sectionAccent }}
              aria-hidden
            >
              {capabilityCount}
            </span>
          )}
        </span>
      ),
      ariaLabel:
        capabilities.length > 0
          ? `Capabilities (${capabilityCount} wired)`
          : 'Capabilities (none recorded)',
    },
    {
      value: 'animations',
      label: 'Motion',
      icon: (
        <span className="relative inline-flex items-center">
          <Zap className="h-3.5 w-3.5" />
          {animationCount > 0 && (
            <span
              className="ml-0.5 font-mono text-[10px] font-bold tabular-nums leading-none"
              style={{ color: panel === 'animations' ? colors.brandGreen : sectionAccent }}
              aria-hidden
            >
              {animationCount}
            </span>
          )}
        </span>
      ),
      ariaLabel:
        animationCount > 0
          ? `Animations (${animationCount} tracked)`
          : 'Animations (none on this screen)',
    },
    {
      value: 'notes',
      label: 'Notes',
      icon: (
        <span className="relative inline-flex">
          <NotebookPen className="h-3.5 w-3.5" />
          {noteDirty && (
            <span
              className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: colors.brandGreen,
                boxShadow: `0 0 6px ${withOpacity(colors.brandGreen, 0.7)}`,
              }}
              aria-hidden
            />
          )}
        </span>
      ),
      ariaLabel: noteDirty ? 'Notes (has a saved note)' : 'Notes',
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* ═══ Header — glass bar floating over the mesh (UNCHANGED) ═══ */}
      <div
        className="gh-glass-raised shrink-0 px-4 py-2.5"
        style={{ borderRadius: 0, ['--gh-rise-delay' as string]: '0ms' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: accentSoft,
              color: sectionAccent,
              border: `1px solid ${accentLine}`,
            }}
          >
            <GroupGlyph className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              className="truncate text-[17px] font-bold leading-tight tracking-tight"
              style={{ color: TXT_HEADLINE }}
              title={title}
            >
              {title}
            </h2>
            <p
              className="truncate text-[11px] font-medium leading-tight"
              style={{ color: TXT_MUTED }}
            >
              {group.label}
            </p>
          </div>

          {/* Device segmented control — anti-pill, glass-inset track (UNCHANGED) */}
          <div
            className="gh-glass-inset flex gap-0.5 p-0.5"
            role="group"
            aria-label="Preview device"
          >
            <DeviceTab
              active={device === 'mobile'}
              label="Phone"
              accent={accent}
              onClick={() => onDeviceChange('mobile')}
              icon={<Smartphone className="h-3.5 w-3.5" />}
            />
            <DeviceTab
              active={device === 'desktop'}
              label="Desktop"
              accent={accent}
              onClick={() => onDeviceChange('desktop')}
              icon={<Monitor className="h-3.5 w-3.5" />}
            />
          </div>

          <IconButton label="Reload preview" onClick={onReload}>
            <RotateCcw className="h-4 w-4" />
          </IconButton>
          <IconLink label="Open in a new tab" href={previewSrc(screen.path, activeStateId)}>
            <ExternalLink className="h-4 w-4" />
          </IconLink>
          <IconButton label="Close preview" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        {/* Path + live-state badge (UNCHANGED) */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className="gh-glass-inset px-2 py-0.5 font-mono text-[11px]"
            style={{ color: TXT_SECONDARY }}
          >
            {screen.path}
          </span>
          {activeStateId !== 'populated' && (
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
              style={{
                color: stateTint(activeStateId),
                backgroundColor: withOpacity(stateTint(activeStateId), 0.14),
                border: `1px solid ${withOpacity(stateTint(activeStateId), 0.3)}`,
              }}
            >
              {activeState.label} state
            </span>
          )}
        </div>
      </div>

      {/* ═══ Body — preview + flip-through info rail ═══ */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Figma-style canvas preview — zoom/pan with dot grid background */}
        <div className="min-h-0 flex-1 p-3">
          <CanvasPreview
            src={previewSrc(screen.path, activeStateId)}
            device={device}
            iframeKey={reloadKey}
          />
        </div>

        {/* Info rail — beside the preview (desktop) / stacked below (mobile).
            No longer a scroll column of fat boxes: a fixed purpose block + a
            segmented filter that flips a SINGLE panel into view. */}
        <div
          className="flex max-h-[44vh] w-full shrink-0 flex-col gap-3 overflow-y-auto border-t p-3 md:max-h-none md:w-[23rem] md:border-l md:border-t-0"
          style={{ borderColor: HAIRLINE }}
        >
          {/* Always-on purpose block (Lane B). Consume the field off the screen
              object first; fall back to the manifest-by-path map when the
              upstream normalizer didn't forward it. */}
          <PurposePanel
            purpose={screen.purpose ?? PURPOSE_BY_PATH[screen.path]}
            accent={sectionAccent}
          />

          {/* Fixed TOP strip — the two AUTO-tracked things together: an
              animations summary (count + auto-scanned trigger chips) and a notes
              affordance (dirty-dot). Tapping either jumps the filter below to its
              full inventory. Sits above the filter so "tracked" reads at the top. */}
          <TrackedTopStrip
            animations={animations}
            path={screen.path}
            accent={sectionAccent}
            active={panel === 'animations' ? 'animations' : panel === 'notes' ? 'notes' : 'other'}
            onOpenAnimations={() => setPanel('animations')}
            onOpenNotes={() => setPanel('notes')}
          />

          {/* Flip-through filter — mirrors the Phone/Desktop toggle the owner likes */}
          <SegmentedControl<PanelId>
            options={filterOptions}
            value={panel}
            onChange={setPanel}
            fullWidth
            ariaLabel="Detail section"
          />

          {/* One panel at a time — flips instead of scrolling */}
          <div className="min-h-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              {panel === 'states' && (
                <StatesPanel
                  key="states"
                  states={states}
                  activeId={activeStateId}
                  accent={accent}
                  onSelect={onStateChange}
                />
              )}
              {panel === 'buttons' && (
                <ButtonsPanel
                  key="buttons"
                  buttons={buttons}
                  functionalCount={functionalCount}
                  accent={accent}
                  labelForPath={labelForPath}
                  onSelectLink={onSelectLink}
                />
              )}
              {panel === 'links' && (
                <LinksPanel
                  key="links"
                  links={links}
                  accent={accent}
                  labelForPath={labelForPath}
                  onSelect={onSelectLink}
                />
              )}
              {panel === 'capabilities' && (
                <CapabilitiesPanel
                  key="capabilities"
                  capabilities={capabilities}
                  accent={sectionAccent}
                />
              )}
              {panel === 'animations' && (
                <AnimationsPanel key="animations" animations={animations} accent={sectionAccent} />
              )}
              {panel === 'notes' && <NotesPanel key="notes" path={screen.path} />}
            </AnimatePresence>

            {/* APIs-used — optional; renders only when endpoints are derivable.
                Shown under States/Buttons/Links (not Animations/Notes) so the
                motion inventory + notes panel each stay focused surfaces. */}
            {panel !== 'notes' && panel !== 'animations' && panel !== 'capabilities' && (
              <ApisPanel apis={apis} accent={sectionAccent} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Header sub-components (UNCHANGED — owner keeps the device toggle + chrome)
 * ========================================================================== */

/** Device toggle — flat tab inside the inset track (anti-pill). */
function DeviceTab({
  active,
  label,
  icon,
  accent,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="gh-hoverable flex min-h-[34px] items-center gap-1 rounded-md px-2.5 py-1.5"
      style={{
        backgroundColor: active ? withOpacity(accent, 0.16) : 'transparent',
        color: active ? accent : TXT_SECONDARY,
        border: `1px solid ${active ? withOpacity(accent, 0.32) : 'transparent'}`,
      }}
    >
      {icon}
      <span className="text-[12px] font-semibold">{label}</span>
    </button>
  );
}

/** Square glass icon-button — 44px target, hover lift, visible focus. */
function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="gh-glass-inset gh-hoverable flex h-10 w-10 items-center justify-center"
      style={{ color: TXT_SECONDARY }}
    >
      {children}
    </button>
  );
}

/** Glass icon-link (open in new tab) matching IconButton sizing. */
function IconLink({ label, href, children }: { label: string; href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      title={label}
      className="gh-glass-inset gh-hoverable flex h-10 w-10 items-center justify-center"
      style={{ color: TXT_SECONDARY }}
    >
      {children}
    </a>
  );
}
