---
name: react-native-expo-building
description: >
  Builds React Native Expo applications with proper project architecture,
  file structure, config plugins, native modules, Expo Router navigation,
  secure storage, Hermes performance, and platform-specific code. Covers
  managed workflow vs prebuild decisions, feature-based organization, and
  Expo SDK best practices. Use when building Expo apps, choosing workflow
  mode, setting up navigation, adding native modules, or when user mentions
  Expo, React Native, Expo Router, config plugin, or native module.
---

# React Native Expo Building

Build mobile apps with Expo that are structured for scale, performant
on real devices, and ready for native module integration when needed.

---

## 1. Workflow Decision Tree

```
What level of native access do you need?
│
├── Pure JavaScript/TypeScript app?
│   └── Managed Workflow (no prebuild)
│       WHY: Fastest development, EAS handles native code
│       TOOLS: expo-camera, expo-location, etc. (Expo modules)
│
├── Need a custom native module or unsupported library?
│   └── Prebuild (Development Build)
│       WHY: Full native project access with Expo benefits
│       COMMAND: npx expo prebuild
│       TOOLS: Any React Native library, custom native code
│
├── Existing React Native app adding Expo?
│   └── Gradual adoption
│       WHY: Add Expo modules without full migration
│       TOOLS: npx install-expo-modules
│
└── Need full control (custom Xcode/Gradle config)?
    └── Bare Workflow
        WHY: Maximum flexibility, manual native management
        CAUTION: You lose EAS build convenience
```

---

## 2. Project Structure

### Feature-Based Organization (Recommended)

```
app/
├── (tabs)/               # Tab-based layout group
│   ├── index.tsx         # Home tab
│   ├── explore.tsx       # Explore tab
│   ├── profile.tsx       # Profile tab
│   └── _layout.tsx       # Tab navigator layout
├── (auth)/               # Auth flow group
│   ├── login.tsx
│   ├── register.tsx
│   └── _layout.tsx
├── settings/
│   ├── index.tsx
│   └── notifications.tsx
├── _layout.tsx           # Root layout
└── +not-found.tsx        # 404 page

components/
├── ui/                   # Generic reusable UI
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── features/             # Feature-specific components
│   ├── home/
│   │   ├── FeedCard.tsx
│   │   └── StoryRow.tsx
│   └── profile/
│       ├── Avatar.tsx
│       └── StatGrid.tsx
└── layout/
    ├── SafeArea.tsx
    └── ScreenContainer.tsx

lib/
├── api/                  # API clients
│   ├── client.ts         # Base fetch/axios config
│   └── users.ts          # User-specific API functions
├── hooks/                # Custom hooks
│   ├── useAuth.ts
│   └── useItems.ts
├── stores/               # State management (Zustand)
│   ├── authStore.ts
│   └── itemStore.ts
├── utils/                # Pure utility functions
│   ├── format.ts
│   └── validation.ts
└── constants/
    ├── colors.ts
    └── config.ts

assets/
├── fonts/
├── images/
└── icons/
```

### Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Components | PascalCase | `FeedCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Stores | camelCase with `Store` suffix | `authStore.ts` |
| Utils | camelCase | `formatDate.ts` |
| Routes | kebab-case (file-based) | `app/settings/index.tsx` |
| Types | PascalCase with `.types.ts` | `User.types.ts` |

---

## 3. Config Plugins

### When to Use Config Plugins

```
Need to modify native project files?
│
├── AndroidManifest.xml changes (permissions, activity config)?
│   └── Config plugin
│
├── Info.plist changes (usage descriptions, capabilities)?
│   └── Config plugin
│
├── Podfile modifications?
│   └── Config plugin
│
├── Build.gradle changes?
│   └── Config plugin
│
└── Just adding an Expo SDK module?
    └── No plugin needed — expo install handles it
```

### Writing a Config Plugin

```javascript
// plugins/withCustomScheme.js
const { withInfoPlist } = require('expo/config-plugins');

module.exports = function withCustomScheme(config, { scheme }) {
  return withInfoPlist(config, (config) => {
    config.modResults.CFBundleURLTypes = [
      ...(config.modResults.CFBundleURLTypes || []),
      {
        CFBundleURLSchemes: [scheme],
      },
    ];
    return config;
  });
};
```

```json
// app.json
{
  "expo": {
    "plugins": [
      ["./plugins/withCustomScheme", { "scheme": "myapp" }]
    ]
  }
}
```

---

## 4. Native Modules

### Expo Modules API (Preferred)

```swift
// ios/MyModule/MyModule.swift
import ExpoModulesCore

public class MyModule: Module {
    public func definition() -> ModuleDefinition {
        Name("MyModule")

        Function("getDeviceId") {
            return UIDevice.current.identifierForVendor?.uuidString ?? ""
        }

        AsyncFunction("fetchData") { (url: String) -> String in
            let data = try await URLSession.shared.data(from: URL(string: url)!)
            return String(data: data.0, encoding: .utf8) ?? ""
        }
    }
}
```

```typescript
// Using the module in JS
import { getDeviceId, fetchData } from './modules/my-module';

const id = getDeviceId();
const data = await fetchData('https://api.example.com/data');
```

### When to Build a Native Module

| Need | Solution |
|---|---|
| Camera, Location, Notifications | Use existing Expo modules (`expo-camera`, etc.) |
| Bluetooth, NFC, HealthKit | Check Expo ecosystem first, then community libraries |
| Custom native SDK integration | Build an Expo module |
| Performance-critical computation | Build an Expo module with native code |

---

## 5. Navigation (Expo Router)

### File-Based Routing

```typescript
// app/_layout.tsx — Root layout
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen
        name="modal"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  );
}
```

```typescript
// app/(tabs)/_layout.tsx — Tab layout
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

### Typed Navigation

```typescript
// Type-safe navigation
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate
router.push('/profile/123');
router.replace('/login');
router.back();

// With params
router.push({
  pathname: '/item/[id]',
  params: { id: '123' }
});
```

### Deep Linking

```json
// app.json
{
  "expo": {
    "scheme": "myapp",
    "ios": { "associatedDomains": ["applinks:myapp.com"] },
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "data": [{ "scheme": "myapp" }],
        "category": ["BROWSABLE", "DEFAULT"]
      }]
    }
  }
}
```

---

## 6. Secure Storage

```typescript
// ✅ REQUIRED — Use expo-secure-store for sensitive data
import * as SecureStore from 'expo-secure-store';

// Store
await SecureStore.setItemAsync('auth_token', token);

// Retrieve
const token = await SecureStore.getItemAsync('auth_token');

// Delete
await SecureStore.deleteItemAsync('auth_token');
```

```typescript
// ❌ NEVER — AsyncStorage for sensitive data
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('auth_token', token);
// AsyncStorage is UNENCRYPTED — tokens can be extracted from device
```

### Storage Decision

| Data Type | Storage | Why |
|---|---|---|
| Auth tokens, API keys | `expo-secure-store` | Encrypted, Keychain/Keystore backed |
| User preferences | `AsyncStorage` | Non-sensitive, fast |
| App state (offline) | `AsyncStorage` or MMKV | Performance, offline access |
| Cached API responses | React Query persistence | Automatic cache management |

---

## 7. Performance

### Hermes Engine

Hermes is enabled by default in Expo SDK 50+. Verify:

```json
// app.json — Hermes should be enabled
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```

### FlatList Optimization

```typescript
// ✅ Optimized FlatList
<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Bundle Analysis

```bash
# Analyze bundle size
npx expo export --dump-sourcemap
npx react-native-bundle-visualizer
```

### Performance Budget

| Metric | Target |
|---|---|
| Cold start | < 2s |
| Navigation transition | < 300ms |
| FlatList scroll | 60fps |
| JS bundle size | < 2MB |
| Image assets | < 500KB each, lazy loaded |

---

## 8. Platform-Specific Code

```typescript
// ✅ Platform.select for inline differences
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
});
```

```typescript
// ✅ File-based platform code
// components/HapticButton.ios.tsx — iOS-specific
// components/HapticButton.android.tsx — Android-specific
// components/HapticButton.tsx — fallback/web

// Import resolves automatically:
import { HapticButton } from '@/components/HapticButton';
```

---

## ⛔ STOP GATE — Architecture

DO NOT mark any Expo project as architecturally complete without:

1. No direct native imports (`import { NativeModules }`) in managed workflow
2. All sensitive data in `expo-secure-store`, not `AsyncStorage`
3. File-based routing with proper layout hierarchy
4. `expo-router` used for navigation (not `@react-navigation` directly)
5. Hermes engine confirmed enabled
6. FlatList optimized for lists > 20 items

---

## NEVER

- **NEVER** store auth tokens in `AsyncStorage` — use `expo-secure-store`
- **NEVER** use `@react-navigation` directly when Expo Router is available
- **NEVER** import from `react-native` core when an Expo module exists
- **NEVER** skip `keyExtractor` on FlatList
- **NEVER** use `ScrollView` for long lists — use `FlatList` or `FlashList`
- **NEVER** hardcode API URLs — use environment config
- **NEVER** eject to bare workflow without exhausting managed options first

---

## Pre-Completion Checklist

- [ ] Workflow mode chosen (managed vs prebuild) with justification
- [ ] Feature-based file structure implemented
- [ ] Expo Router for all navigation
- [ ] Secure storage for sensitive data
- [ ] Hermes engine enabled
- [ ] FlatList optimized for all scrollable lists
- [ ] Platform-specific code uses `Platform.select` or file extensions
- [ ] Config plugins used for native configuration (not manual edits)

---

## Related Skills

- `expo-testflight-shipping` — Build and ship pipeline
- `ios-debugging` — Debugging Expo on iOS
- `android-building` — Android-specific patterns
- `mobile-first-enforcing` — Responsive and touch-first UI
- `frontend-architecting` — Component architecture patterns
