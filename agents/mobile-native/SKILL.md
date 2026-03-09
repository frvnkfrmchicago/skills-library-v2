---
name: mobile-native
description: Mobile native development. React Native, Expo, Capacitor, app store submission.
last_updated: 2026-03
owner: Frank
---

# Mobile Native

Build native mobile apps with JavaScript/TypeScript.

> **See also:** `app-types/mobile/SKILL.md` for mobile blueprint, `agents/pwa/SKILL.md` for PWA

---

## Context Questions

Before building mobile, ask:

1. **What's the platform target?** — iOS, Android, both
2. **What's the app type?** — New build vs web-to-mobile
3. **What native features?** — Camera, push, biometrics, payments
4. **What's the timeline?** — Ship fast vs full control
5. **Is OTA update needed?** — Bug fixes without store review

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Framework** | Expo (managed) ←→ RN CLI (bare) |
| **Origin** | New app ←→ Wrap existing web |
| **Native** | Expo modules ←→ Custom native code |
| **Update** | Store only ←→ OTA via EAS |
| **Build** | EAS Cloud ←→ Local Xcode/Android Studio |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Most projects | Expo with Expo Router |
| Heavy native code | React Native CLI |
| Existing web app | Capacitor |
| Need OTA updates | EAS Update |
| App store submission | EAS Build + Submit |
| Push notifications | expo-notifications |

---

## TL;DR

| Framework | Best For |
|-----------|----------|
| **Expo** | Most React Native projects |
| **React Native CLI** | Heavy native code needs |
| **Capacitor** | Web app → mobile quickly |
| **Flutter** | Not JS/TS (skip this) |

**Default choice:** Expo with Expo Router

---

## Part 1: Framework Comparison

| Feature | React Native + Expo | Capacitor | Flutter |
|---------|---------------------|-----------|---------|
| **Language** | TypeScript | TypeScript | Dart |
| **Performance** | Near-native | WebView | Near-native |
| **Learning curve** | Low (if React) | Low (if web) | Medium |
| **OTA updates** | Yes (EAS) | Yes | No |
| **Native modules** | Many available | Plugin-based | Built-in |
| **When to use** | New apps, full control | Existing web apps | Non-JS teams |

---

## Part 2: Expo Setup (Recommended)

### Create Project

```bash
# Create new Expo project with Expo Router
npx create-expo-app@latest my-app --template tabs

cd my-app
npx expo start
```

### Project Structure

```
my-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/             # Tab navigator group
│   │   ├── index.tsx       # Home tab
│   │   ├── explore.tsx     # Explore tab
│   │   └── _layout.tsx     # Tab layout
│   ├── _layout.tsx         # Root layout
│   └── +not-found.tsx      # 404 page
├── components/             # Shared components
├── constants/              # Colors, config
├── hooks/                  # Custom hooks
└── assets/                 # Images, fonts
```

### Expo Router Basics

```tsx
// app/_layout.tsx - Root layout
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  )
}

// app/(tabs)/_layout.tsx - Tab layout
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
```

### Navigation

```tsx
import { Link, useRouter, useLocalSearchParams } from 'expo-router'

// Declarative navigation
<Link href="/profile">Go to Profile</Link>
<Link href="/user/123">User 123</Link>

// Programmatic navigation
const router = useRouter()
router.push('/profile')
router.replace('/login')
router.back()

// Get params
// In app/user/[id].tsx
const { id } = useLocalSearchParams()
```

---

## Part 3: Styling

### StyleSheet (Built-in)

```tsx
import { StyleSheet, View, Text } from 'react-native'

export default function Card({ title }: { title: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
})
```

### NativeWind (Tailwind for RN)

```bash
npx expo install nativewind tailwindcss
```

```tsx
// With NativeWind
import { View, Text } from 'react-native'

export default function Card({ title }: { title: string }) {
  return (
    <View className="bg-white rounded-xl p-4 shadow-md">
      <Text className="text-lg font-semibold text-gray-900">{title}</Text>
    </View>
  )
}
```

### Platform-Specific Styles

```tsx
import { Platform, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    padding: Platform.OS === 'ios' ? 20 : 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 3,
      },
    }),
  },
})

// Or platform-specific files
// Button.ios.tsx
// Button.android.tsx
// Button.tsx (fallback)
```

---

## Part 4: State Management

Same as web! Use:

```tsx
// Zustand (recommended)
import { create } from 'zustand'

interface AuthStore {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}))

// TanStack Query for server state
import { useQuery } from '@tanstack/react-query'

function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
  })
}
```

---

## Part 5: Native Components

### FlatList (Virtualized List)

```tsx
import { FlatList, View, Text } from 'react-native'

interface Item {
  id: string
  title: string
}

export default function ProductList({ products }: { products: Item[] }) {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="p-4 border-b border-gray-200">
          <Text>{item.title}</Text>
        </View>
      )}
      // Performance optimizations
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      // Pull to refresh
      onRefresh={() => refetch()}
      refreshing={isLoading}
      // Infinite scroll
      onEndReached={() => fetchNextPage()}
      onEndReachedThreshold={0.5}
    />
  )
}
```

### Image Handling

```tsx
import { Image } from 'expo-image'

// Use expo-image for better performance
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200 }}
  contentFit="cover"
  transition={200}
  placeholder={blurhash}
/>
```

### Icons

```tsx
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons'

<Ionicons name="heart" size={24} color="red" />
<MaterialIcons name="settings" size={24} color="gray" />
```

---

## Part 6: EAS Build & Submit

### Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure
```

### Build

```bash
# Development build (for testing)
eas build --profile development --platform ios
eas build --profile development --platform android

# Production build
eas build --profile production --platform all

# Check build status
eas build:list
```

### Submit to Stores

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

### eas.json Configuration

```json
{
  "cli": { "version": ">= 7.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {}
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "production"
      }
    }
  }
}
```

---

## Part 7: OTA Updates

```bash
# Publish update
eas update --branch production --message "Bug fixes"

# Check updates
eas update:list
```

```tsx
// Configure in app.json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/your-project-id"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

---

## Part 8: Push Notifications

### Setup

```bash
npx expo install expo-notifications expo-device
```

### Request Permission & Get Token

```tsx
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert('Push notifications require physical device')
    return
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-project-id',
  })

  return token.data // Send this to your server
}
```

### Handle Notifications

```tsx
import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export function useNotifications() {
  const notificationListener = useRef<Notifications.Subscription>()
  const responseListener = useRef<Notifications.Subscription>()

  useEffect(() => {
    // When notification received (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification:', notification)
      }
    )

    // When user taps notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data
        // Navigate based on data
        router.push(data.screen)
      }
    )

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])
}
```

---

## Part 9: Deep Linking

### Configure in app.json

```json
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "associatedDomains": ["applinks:myapp.com"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [{ "scheme": "https", "host": "myapp.com", "pathPrefix": "/" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### Handle Deep Links

```tsx
import { useURL } from 'expo-linking'
import { useRouter } from 'expo-router'

export function useDeepLinking() {
  const url = useURL()
  const router = useRouter()

  useEffect(() => {
    if (url) {
      // Parse and navigate
      const { path } = Linking.parse(url)
      if (path) router.push(path)
    }
  }, [url])
}

// Links work automatically with Expo Router
// myapp://product/123 → /product/123
// https://myapp.com/product/123 → /product/123
```

---

## Part 10: Capacitor (Web → Mobile)

### When to Use

- Existing web app to ship fast
- Web-first, mobile secondary
- Simple native features needed

### Setup

```bash
# In existing web project
npm install @capacitor/core @capacitor/cli
npx cap init

# Add platforms
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android

# Build web, sync, open IDE
npm run build
npx cap sync
npx cap open ios
```

### Native APIs

```typescript
import { Camera, CameraResultType } from '@capacitor/camera'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

// Camera
async function takePicture() {
  const image = await Camera.getPhoto({
    quality: 90,
    resultType: CameraResultType.Uri,
  })
  return image.webPath
}

// Haptics
async function vibrate() {
  await Haptics.impact({ style: ImpactStyle.Medium })
}
```

---

## Part 11: App Store Checklist

### iOS App Store

- [ ] Apple Developer account ($99/year)
- [ ] App Store Connect app created
- [ ] App icons (1024x1024 + sizes)
- [ ] Screenshots (6.5", 5.5" required)
- [ ] Privacy policy URL
- [ ] App description, keywords
- [ ] Age rating questionnaire
- [ ] Export compliance answers
- [ ] Build uploaded via EAS or Xcode

### Google Play Store

- [ ] Google Play Developer account ($25 one-time)
- [ ] App created in Play Console
- [ ] App icons (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone, tablet)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Data safety form
- [ ] AAB uploaded via EAS

---

## Checklist

- [ ] Expo project created
- [ ] Navigation working (Expo Router)
- [ ] Styling consistent (NativeWind or StyleSheet)
- [ ] State management setup
- [ ] Push notifications configured
- [ ] Deep linking working
- [ ] EAS Build configured
- [ ] App store assets ready
- [ ] Privacy policy written

---

## Mobile-First Checklist

Use this before shipping any mobile build.

### UX Fundamentals

- [ ] Touch targets ≥ 44x44px (Apple HIG) / 48x48dp (Material)
- [ ] Bottom navigation for primary actions (thumb zone)
- [ ] No hover-dependent interactions
- [ ] Swipe gestures have visual affordances
- [ ] Pull-to-refresh on scrollable lists
- [ ] Loading states (skeleton screens, not spinners)
- [ ] Haptic feedback on key actions

### Performance

- [ ] FlatList for long lists (not ScrollView)
- [ ] Images optimized (WebP, proper sizes)
- [ ] Lazy loading for off-screen content
- [ ] Animations at 60fps (use native driver)
- [ ] Bundle size checked (`npx expo-doctor`)
- [ ] Memory leaks checked (useEffect cleanup)

### Offline & Network

- [ ] Graceful offline handling
- [ ] Network error states
- [ ] Retry mechanisms
- [ ] Cached data shows while refreshing
- [ ] Slow network simulation tested (3G)

### Platform-Specific

- [ ] Safe area insets (notch, home indicator)
- [ ] Keyboard avoiding views
- [ ] iOS: Dynamic Type support
- [ ] Android: Back button handling
- [ ] Both: Permission request UX

### Accessibility

- [ ] VoiceOver/TalkBack tested
- [ ] Contrast ratios (4.5:1 minimum)
- [ ] Touch targets labeled
- [ ] Focus order logical
- [ ] Reduced motion respected

### Pre-Launch

- [ ] Real device testing (not just simulator)
- [ ] Different screen sizes tested
- [ ] Battery usage acceptable
- [ ] Crash reporting configured (Sentry)
- [ ] Analytics events firing

---

## Resources

- Expo Docs: https://docs.expo.dev/
- React Native Docs: https://reactnative.dev/docs/getting-started
- Capacitor Docs: https://capacitorjs.com/docs

---

## Related Skills

- `app-types/mobile/SKILL.md` — Mobile blueprint
- `agents/pwa/SKILL.md` — Progressive Web Apps
- `agents/state-management/SKILL.md` — Zustand, TanStack Query
