---
name: app-type-mobile
description: Mobile app blueprint using Expo (React Native). Build once, deploy to iOS and Android. Includes App Store submission process.
---

# Mobile App Blueprint

Build mobile apps with your web skills. Deploy to App Store.

## TL;DR

| Phase | Time | Output |
|-------|------|--------|
| Setup | 15 min | Expo project ready |
| Build UI | 2-4 hrs | Screens done |
| Test | 30 min | Works on device |
| Submit | 1-2 hrs | In App Store review |

---

## Plain English: How This Works

```
Your Code (React/TypeScript - skills you already have)
    ↓
Expo (turns your code into real iOS/Android apps)
    ↓
EAS Build (Expo's cloud service - builds the actual app files)
    ↓
App Store Connect / Google Play Console
    ↓
Users download your app
```

**You don't need to learn Swift or Kotlin.**
**You don't need a Mac to build iOS apps.** (EAS builds in the cloud)

---

## Stack

```
Framework:    Expo (React Native)
Styling:      NativeWind (Tailwind for mobile)
Navigation:   Expo Router (file-based, like Next.js)
State:        Zustand + TanStack Query
Auth:         Clerk (works on mobile)
Storage:      AsyncStorage (local) + your API
Build:        EAS Build
```

---

## Quick Start

### 1. Create Project

```bash
npx create-expo-app@latest my-app --template tabs
cd my-app
```

### 2. Install Essentials

```bash
npx expo install nativewind tailwindcss
npx expo install @clerk/clerk-expo
npx expo install zustand @tanstack/react-query
```

### 3. Run on Your Phone

```bash
npx expo start
```

Then:
- Download "Expo Go" app on your phone
- Scan the QR code
- See your app running

---

## File Structure

```
my-app/
├── app/                    # Screens (file-based routing)
│   ├── (tabs)/             # Tab navigation
│   │   ├── index.tsx       # Home tab
│   │   ├── explore.tsx     # Explore tab
│   │   └── _layout.tsx     # Tab bar config
│   ├── _layout.tsx         # Root layout
│   └── modal.tsx           # Modal screen
├── components/             # Reusable components
├── hooks/                  # Custom hooks
├── lib/                    # Utilities
└── assets/                 # Images, fonts
```

---

## NativeWind (Tailwind for Mobile)

```tsx
// Works just like web Tailwind!
import { View, Text } from "react-native"

export function Card() {
  return (
    <View className="bg-white rounded-xl p-4 shadow-lg">
      <Text className="text-xl font-bold text-gray-900">
        Hello Mobile
      </Text>
    </View>
  )
}
```

---

## Navigation (Expo Router)

```tsx
// app/(tabs)/index.tsx - Home tab
export default function HomeScreen() {
  return <View><Text>Home</Text></View>
}

// app/(tabs)/profile.tsx - Profile tab
export default function ProfileScreen() {
  return <View><Text>Profile</Text></View>
}

// Navigate programmatically
import { router } from "expo-router"
router.push("/profile")
router.push("/post/123")
```

---

## Common Components

### Button

```tsx
import { Pressable, Text } from "react-native"

export function Button({ title, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-blue-500 py-3 px-6 rounded-full active:bg-blue-600"
    >
      <Text className="text-white font-semibold text-center">
        {title}
      </Text>
    </Pressable>
  )
}
```

### Input

```tsx
import { TextInput } from "react-native"

export function Input({ placeholder, value, onChangeText }) {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      className="border border-gray-300 rounded-lg p-3 text-base"
    />
  )
}
```

---

## Auth with Clerk

```tsx
// app/_layout.tsx
import { ClerkProvider } from "@clerk/clerk-expo"
import { tokenCache } from "@/lib/cache"

export default function RootLayout() {
  return (
    <ClerkProvider 
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <Stack />
    </ClerkProvider>
  )
}
```

```tsx
// components/SignIn.tsx
import { useSignIn } from "@clerk/clerk-expo"

export function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn()
  
  // Use Clerk's sign-in flow
}
```

---

## App Store Submission

### Prerequisites

1. **Apple Developer Account** - $99/year at developer.apple.com
2. **EAS Account** - Free at expo.dev

### Step 1: Configure

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure
```

### Step 2: Update app.json

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.myapp",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.myapp",
      "versionCode": 1
    }
  }
}
```

### Step 3: Build

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build both
eas build --platform all
```

### Step 4: Submit

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

### Step 5: App Store Connect

1. Go to appstoreconnect.apple.com
2. Fill in app details, screenshots, description
3. Submit for review
4. Wait 1-3 days for approval

---

## App Store Requirements

### Screenshots Needed

| Device | Size |
|--------|------|
| iPhone 6.7" | 1290 x 2796 |
| iPhone 6.5" | 1284 x 2778 |
| iPhone 5.5" | 1242 x 2208 |
| iPad 12.9" | 2048 x 2732 |

**Tip:** Use screenshots from Simulator or tools like shots.so

### Required Info

- App name (30 chars max)
- Subtitle (30 chars max)  
- Description (4000 chars max)
- Keywords (100 chars max)
- Privacy policy URL
- Support URL
- App icon (1024 x 1024, no transparency)

---

## Timeline

```
Day 1: Build app
Day 2: Test thoroughly
Day 3: Build with EAS, submit
Day 4-7: Apple review
Day 7+: Live on App Store
```

---

## Tips

1. **Test on real device** - Simulators miss things
2. **Build early** - Find issues before submission
3. **Privacy policy** - Required, use a generator if needed
4. **Screenshots matter** - First impression in App Store
5. **Crash = rejection** - Test all flows before submitting
