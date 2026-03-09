---
name: extensions
description: Build browser extensions, VSCode extensions, and IDE plugins.
last_updated: 2026-03
owner: Frank
---

# Extensions & Plugins

Build extensions for browsers, VSCode, and other platforms.

---

## Context Questions

1. **What platform?** — Chrome/Firefox browser, VSCode, Figma, Slack
2. **What's the core function?** — Modify pages, add features, integrate APIs
3. **Distribution?** — Public store, private/enterprise, self-hosted
4. **Permissions needed?** — Tabs, storage, activeTab, background scripts
5. **Complexity?** — Simple popup, content script, full background service

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Platform** | Browser ←→ IDE ←→ App plugin |
| **Complexity** | Popup only ←→ Full background service |
| **Distribution** | Private ←→ Public store |
| **Permissions** | Minimal ←→ Full access |
| **UI** | No UI ←→ Full options page |

---

## TL;DR

| Platform | Framework | Key Files |
|----------|-----------|-----------|
| **Chrome/Edge** | Manifest V3 | manifest.json, background.js, content.js |
| **Firefox** | WebExtensions | Same as Chrome (mostly compatible) |
| **VSCode** | Extension API | package.json, extension.ts |
| **Figma** | Plugin API | manifest.json, code.ts, ui.html |

---

## Part 1: Chrome Extension (Manifest V3)

### Project Structure

```
my-extension/
├── manifest.json
├── background.js        # Service worker
├── content.js           # Runs on web pages
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/
│   ├── options.html
│   └── options.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### manifest.json (Manifest V3)

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "Does something useful",
  
  "permissions": [
    "activeTab",
    "storage"
  ],
  
  "host_permissions": [
    "https://*.example.com/*"
  ],
  
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  
  "background": {
    "service_worker": "background.js"
  },
  
  "content_scripts": [
    {
      "matches": ["https://*.example.com/*"],
      "js": ["content.js"],
      "css": ["content.css"]
    }
  ],
  
  "options_page": "options/options.html"
}
```

### Background Service Worker

```javascript
// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    // Do async work
    fetchData().then(data => sendResponse({ data }));
    return true; // Keep channel open for async response
  }
});

// Context menu
chrome.contextMenus.create({
  id: 'myExtension',
  title: 'Do Something',
  contexts: ['selection'],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'myExtension') {
    chrome.tabs.sendMessage(tab.id, { 
      action: 'processSelection',
      text: info.selectionText 
    });
  }
});
```

### Content Script

```javascript
// content.js
// Runs in the context of web pages

// Inject UI
const container = document.createElement('div');
container.id = 'my-extension-container';
container.innerHTML = `
  <button id="my-ext-btn">Click Me</button>
`;
document.body.appendChild(container);

// Listen for messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processSelection') {
    processText(request.text);
    sendResponse({ success: true });
  }
});

// Send message to background
document.getElementById('my-ext-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
    console.log('Got data:', response.data);
  });
});
```

### Popup

```html
<!-- popup/popup.html -->
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h1>My Extension</h1>
    <button id="action-btn">Do Action</button>
    <div id="status"></div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

```javascript
// popup/popup.js
document.getElementById('action-btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'doSomething' }, (response) => {
    document.getElementById('status').textContent = response.status;
  });
});

// Load saved settings
chrome.storage.sync.get(['setting1'], (result) => {
  console.log('Setting1:', result.setting1);
});

// Save settings
chrome.storage.sync.set({ setting1: 'value' });
```

---

## Part 2: VSCode Extension

### Setup

```bash
npm install -g yo generator-code
yo code
# Select: New Extension (TypeScript)
```

### Project Structure

```
my-vscode-extension/
├── package.json
├── src/
│   └── extension.ts
├── .vscode/
│   └── launch.json
└── README.md
```

### package.json

```json
{
  "name": "my-vscode-extension",
  "displayName": "My Extension",
  "version": "0.0.1",
  "engines": { "vscode": "^1.85.0" },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "myExtension.helloWorld",
        "title": "Hello World"
      }
    ],
    "keybindings": [
      {
        "command": "myExtension.helloWorld",
        "key": "ctrl+shift+h",
        "mac": "cmd+shift+h"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "command": "myExtension.helloWorld",
          "group": "navigation"
        }
      ]
    }
  }
}
```

### extension.ts

```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension activated');

  // Register command
  const command = vscode.commands.registerCommand('myExtension.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World!');
  });

  // Text manipulation
  const transform = vscode.commands.registerCommand('myExtension.transform', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    const text = editor.document.getText(selection);
    
    editor.edit(editBuilder => {
      editBuilder.replace(selection, text.toUpperCase());
    });
  });

  // Webview panel
  const webview = vscode.commands.registerCommand('myExtension.openPanel', () => {
    const panel = vscode.window.createWebviewPanel(
      'myPanel',
      'My Panel',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );
    
    panel.webview.html = getWebviewContent();
  });

  context.subscriptions.push(command, transform, webview);
}

function getWebviewContent() {
  return `
    <!DOCTYPE html>
    <html>
    <body>
      <h1>Hello from Webview!</h1>
    </body>
    </html>
  `;
}

export function deactivate() {}
```

---

## Part 3: Figma Plugin

### manifest.json

```json
{
  "name": "My Figma Plugin",
  "id": "123456789",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"]
}
```

### code.ts

```typescript
figma.showUI(__html__, { width: 300, height: 400 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-rectangles') {
    const nodes = [];
    
    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
      nodes.push(rect);
    }
    
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
  
  figma.closePlugin();
};
```

---

## Part 4: Distribution

### Chrome Web Store

1. Create developer account ($5 one-time)
2. Create `zip` of extension files
3. Upload via Chrome Developer Dashboard
4. Provide screenshots, description
5. Submit for review

### VSCode Marketplace

```bash
npm install -g vsce
vsce package  # Creates .vsix
vsce publish  # Publishes to marketplace
```

### Firefox Add-ons

```bash
npx web-ext lint
npx web-ext build
# Upload to addons.mozilla.org
```

---

## Common Patterns

### Storage

```javascript
// Chrome
chrome.storage.sync.set({ key: 'value' });
chrome.storage.sync.get(['key'], (result) => console.log(result.key));

// VSCode
context.globalState.update('key', 'value');
const value = context.globalState.get('key');
```

### Cross-Browser Compatibility

```javascript
// Polyfill for Firefox/Chrome
const browser = typeof browser !== 'undefined' ? browser : chrome;
```

---

## Checklist

- [ ] Define manifest with correct permissions
- [ ] Set up project structure
- [ ] Implement core functionality
- [ ] Add popup/options UI if needed
- [ ] Test in development mode
- [ ] Create icons (16, 48, 128)
- [ ] Write description and screenshots
- [ ] Submit to store

---

## Related Skills

- `agents/mcp/SKILL.md` — MCP server for Claude integration
- `agents/typescript-advanced/SKILL.md` — TypeScript patterns
- `agents/pwa/SKILL.md` — Progressive web apps
