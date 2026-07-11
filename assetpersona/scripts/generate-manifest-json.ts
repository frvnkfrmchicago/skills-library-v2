import { SCREEN_GROUPS, SCREEN_MANIFEST } from '../src/data/screen-manifest';
import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const destPath = resolve(__dirname, '..', 'src', 'components', 'screens', 'screen-manifest.json');

async function main() {
  const manifestJson = {
    project: "assetpersona",
    framework: "vite-react",
    scannedAt: new Date().toISOString(),
    totalScreens: SCREEN_MANIFEST.length,
    groups: SCREEN_GROUPS.map(g => ({
      id: g.id,
      label: g.label,
      color: g.color,
      icon: g.icon,
      flowOrder: g.flowOrder,
      screens: g.screens.map(s => ({
        path: s.path,
        label: s.label,
        displayLabel: s.label,
        purpose: s.description,
        states: s.states,
        linksTo: s.flowLinks.map(l => ({
          target: l.target,
          label: l.action,
          via: "link"
        })),
        buttons: []
      }))
    }))
  };
  
  await writeFile(destPath, JSON.stringify(manifestJson, null, 2), 'utf-8');
  console.log('Successfully wrote screen-manifest.json!');
}

main().catch(console.error);
