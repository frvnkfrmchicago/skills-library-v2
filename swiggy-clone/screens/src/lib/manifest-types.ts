/** App-agnostic manifest extensions (Mobbin-style journeys + capabilities). */

export type CapabilityType = 'input' | 'action' | 'navigation' | 'display' | 'system';

export interface ScreenCapability {
  id: string;
  label: string;
  description: string;
  type: CapabilityType;
  functional: boolean;
}

export interface FlowPathDef {
  id: string;
  label: string;
  description?: string;
  /** Ordered screen paths for this journey (Mobbin flow order). */
  order: string[];
  tags?: string[];
}

export interface ManifestScreen {
  path: string;
  label: string;
  displayLabel?: string;
  purpose?: string;
  visibleInGallery?: boolean;
  capabilities?: ScreenCapability[];
  linksTo?: unknown[];
  buttons?: unknown[];
  states?: unknown[];
  hasLoading?: boolean;
  hasError?: boolean;
  animations?: unknown[];
}

export interface ManifestGroup {
  id: string;
  label: string;
  color: string;
  icon: string;
  flowOrder: number;
  screens: ManifestScreen[];
}

export interface ScreenManifest {
  project: string;
  framework: string;
  flowPaths?: FlowPathDef[];
  groups: ManifestGroup[];
}
