---
name: Mobile Plugins
description: Mobile app integrations. Giphy, camera, push notifications, deep linking, in-app purchases, biometrics.
last_updated: 2026-03
owner: Frank
---

# Mobile Plugins

Essential mobile integrations for React Native and native apps.

> **See also:** `agents/mobile-native/SKILL.md`, `app-types/mobile/SKILL.md`, `agents/realtime/SKILL.md`

---

## Context Questions

Before choosing plugins, ask:

1. **What features needed?** — Camera, push, payments, auth
2. **What platform?** — iOS, Android, both
3. **Expo or bare RN?** — Determines available plugins
4. **What's the timeline?** — Quick integration vs custom native
5. **What permissions?** — Camera, location, notifications

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Plugin** | Expo module ←→ Custom native |
| **Complexity** | One-liner ←→ Backend required |
| **Platform** | iOS only ←→ Cross-platform |
| **Auth** | Anonymous ←→ Full social login |
| **Monetization** | Free ←→ In-app purchases |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Camera/gallery | expo-image-picker |
| Push notifications | expo-notifications + backend |
| Social login | expo-auth-session |
| Biometrics | expo-local-authentication |
| In-app purchases | expo-in-app-purchases |
| Deep linking | React Navigation linking config |
| GIF picker | @giphy/react-native-sdk |

---

## TL;DR

| Plugin | Purpose | Platforms | Setup Time |
|--------|---------|-----------|------------|
| **Expo Image Picker** | Camera/gallery access | iOS, Android | 15 min |
| **Expo Notifications** | Push notifications | iOS, Android | 1 hour |
| **React Native FBSDK** | Facebook/Instagram sharing | iOS, Android | 1 hour |
| **Giphy SDK** | GIF search/integration | iOS, Android | 30 min |
| **Expo In-App Purchases** | IAP (subscriptions, products) | iOS, Android | 2-3 hours |
| **Expo Local Authentication** | Face ID, Touch ID | iOS, Android | 30 min |
| **React Navigation Deep Linking** | Deep links | iOS, Android | 1 hour |

**For vibe coders:** Expo provides most plugins out-of-the-box (camera, notifications, auth).

---

## Part 1: Giphy Integration

### Install Giphy SDK

```bash
# Expo
npx expo install @giphy/react-native-sdk

# Bare React Native
npm install @giphy/react-native-sdk
cd ios && pod install
```

### Setup (Giphy API Key)

```typescript
// app/config/giphy.ts
export const GIPHY_API_KEY = process.env.EXPO_PUBLIC_GIPHY_API_KEY!;

// Get API key: https://developers.giphy.com/
```

### Giphy Picker Component

```tsx
// components/GiphyPicker.tsx
import { GiphyDialog, GiphyMediaView } from '@giphy/react-native-sdk';
import { useState } from 'react';
import { Button, View } from 'react-native';

export function GiphyPicker() {
  const [media, setMedia] = useState(null);

  const showGiphyDialog = () => {
    GiphyDialog.show({
      apiKey: GIPHY_API_KEY,
      theme: 'dark',
      mediaType: 'gif', // 'gif', 'sticker', 'text'
    }).then((media) => {
      setMedia(media);
    }).catch((e) => {
      console.error('Giphy error:', e);
    });
  };

  return (
    <View>
      <Button title="Pick GIF" onPress={showGiphyDialog} />

      {media && (
        <GiphyMediaView
          media={media}
          style={{ width: 300, height: 200 }}
        />
      )}
    </View>
  );
}
```

### Send GIF to Server

```typescript
// Upload GIF URL to your backend
const sendGif = async (media: GiphyMedia) => {
  const gifUrl = media.images.original.url;

  await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'gif',
      url: gifUrl,
      gifId: media.id,
    }),
  });
};
```

---

## Part 2: Camera and Gallery Access

### Expo Image Picker

```bash
npx expo install expo-image-picker
```

```tsx
// components/ImagePicker.tsx
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Button, Image, View } from 'react-native';

export function CameraGalleryPicker() {
  const [image, setImage] = useState<string | null>(null);

  // Request permissions
  const requestPermissions = async () => {
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    const media = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!camera.granted || !media.granted) {
      alert('Camera and gallery access required');
    }
  };

  // Take photo
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Pick from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Images, Videos, All
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true, // iOS 14+, Android
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View>
      <Button title="Take Photo" onPress={takePhoto} />
      <Button title="Pick from Gallery" onPress={pickImage} />

      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
    </View>
  );
}
```

### Upload to Server (Multipart)

```typescript
// Upload image to backend
const uploadImage = async (uri: string) => {
  const formData = new FormData();

  formData.append('photo', {
    uri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as any);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = await response.json();
  return data.url; // Cloudflare R2, S3, etc.
};
```

---

## Part 3: Push Notifications (APNs, FCM)

### Expo Notifications Setup

```bash
npx expo install expo-notifications expo-device expo-constants
```

```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Get push token
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
```

### Use in App

```tsx
// app/index.tsx
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      // Send token to your backend
      sendTokenToBackend(token);
    });

    // Listener for when notification is received
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listener for when user taps notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Navigate to screen based on notification data
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return <YourApp />;
}
```

### Send Push Notification (Backend)

```typescript
// Using Expo Push Notification Service
const sendPushNotification = async (expoPushToken: string, message: string) => {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      title: 'New Message',
      body: message,
      data: { screen: 'Chat', chatId: '123' },
    }),
  });
};
```

---

## Part 4: Deep Linking

### Setup Deep Links

```typescript
// app.json (Expo)
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "bundleIdentifier": "com.yourcompany.myapp",
      "associatedDomains": ["applinks:myapp.com"]
    },
    "android": {
      "package": "com.yourcompany.myapp",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "myapp.com",
              "pathPrefix": "/app"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### React Navigation Deep Linking

```typescript
// navigation/index.tsx
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      Profile: 'profile/:id',
      Post: 'post/:postId',
      Chat: 'chat/:chatId',
    },
  },
};

export default function Navigation() {
  return (
    <NavigationContainer linking={linking}>
      <RootNavigator />
    </NavigationContainer>
  );
}

// Links will work:
// myapp://profile/123
// https://myapp.com/profile/123
// myapp://chat/abc
```

### Handle Deep Link

```tsx
// screens/ProfileScreen.tsx
import { useRoute } from '@react-navigation/native';

export function ProfileScreen() {
  const route = useRoute();
  const { id } = route.params; // From myapp://profile/123

  return <Profile userId={id} />;
}
```

---

## Part 5: In-App Purchases (iOS, Android)

### Expo In-App Purchases

```bash
npx expo install expo-in-app-purchases
```

### Setup Products

```typescript
// lib/iap.ts
import * as InAppPurchases from 'expo-in-app-purchases';

// Product IDs (from App Store Connect / Play Console)
const PRODUCT_IDS = {
  premium: 'com.myapp.premium.monthly',
  tokens: 'com.myapp.tokens.100',
};

// Initialize IAP
export async function initIAP() {
  await InAppPurchases.connectAsync();

  // Get available products
  const { results } = await InAppPurchases.getProductsAsync([
    PRODUCT_IDS.premium,
    PRODUCT_IDS.tokens,
  ]);

  return results;
}

// Purchase product
export async function purchaseProduct(productId: string) {
  await InAppPurchases.purchaseItemAsync(productId);
}

// Restore purchases (iOS)
export async function restorePurchases() {
  const { results } = await InAppPurchases.getPurchaseHistoryAsync();
  return results;
}
```

### Use in Component

```tsx
// components/PremiumUpgrade.tsx
import { useState, useEffect } from 'react';
import { Button, Text, View } from 'react-native';

export function PremiumUpgrade() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    initIAP().then(setProducts);

    // Listen for purchase updates
    InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        results.forEach(purchase => {
          if (!purchase.acknowledged) {
            // Verify purchase on backend
            verifyPurchase(purchase).then(() => {
              // Grant access
              InAppPurchases.finishTransactionAsync(purchase, true);
            });
          }
        });
      }
    });

    return () => InAppPurchases.disconnectAsync();
  }, []);

  return (
    <View>
      {products.map(product => (
        <View key={product.productId}>
          <Text>{product.title} - {product.price}</Text>
          <Button
            title="Buy"
            onPress={() => purchaseProduct(product.productId)}
          />
        </View>
      ))}
    </View>
  );
}
```

### Verify Purchase (Backend)

```typescript
// Validate receipt on backend (prevent fraud)
// iOS: Validate with Apple's verifyReceipt API
// Android: Validate with Google Play Developer API

const verifyPurchase = async (purchase) => {
  const response = await fetch('/api/verify-purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receipt: purchase.transactionReceipt,
      platform: Platform.OS,
    }),
  });

  return response.json();
};
```

---

## Part 6: Share Functionality

### Expo Sharing

```bash
npx expo install expo-sharing
```

```tsx
// components/ShareButton.tsx
import * as Sharing from 'expo-sharing';
import { Button } from 'react-native';

export function ShareButton({ url, title }: { url: string; title: string }) {
  const share = async () => {
    const canShare = await Sharing.isAvailableAsync();

    if (canShare) {
      await Sharing.shareAsync(url, {
        dialogTitle: title,
        mimeType: 'image/jpeg', // For images
      });
    }
  };

  return <Button title="Share" onPress={share} />;
}
```

### React Native Share (Built-in)

```tsx
import { Share } from 'react-native';

const shareContent = async () => {
  try {
    await Share.share({
      message: 'Check out this app!',
      url: 'https://myapp.com', // iOS only
      title: 'My App',
    });
  } catch (error) {
    console.error(error);
  }
};
```

---

## Part 7: Location Services

### Expo Location

```bash
npx expo install expo-location
```

```tsx
// components/LocationPicker.tsx
import * as Location from 'expo-location';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';

export function LocationPicker() {
  const [location, setLocation] = useState(null);

  const getLocation = async () => {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      alert('Location permission denied');
      return;
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    setLocation(location);

    // Reverse geocode (lat/lng → address)
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    console.log(address[0]); // { city, street, region, country, ... }
  };

  return (
    <View>
      <Button title="Get Location" onPress={getLocation} />

      {location && (
        <Text>
          {location.coords.latitude}, {location.coords.longitude}
        </Text>
      )}
    </View>
  );
}
```

### Background Location (Tracking)

```typescript
// Track location in background
const startBackgroundTracking = async () => {
  await Location.requestBackgroundPermissionsAsync();

  await Location.startLocationUpdatesAsync('background-location-task', {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 5000, // 5 seconds
    distanceInterval: 10, // 10 meters
  });
};
```

---

## Part 8: Biometric Authentication (Face ID, Fingerprint)

### Expo Local Authentication

```bash
npx expo install expo-local-authentication
```

```tsx
// components/BiometricAuth.tsx
import * as LocalAuthentication from 'expo-local-authentication';
import { useState, useEffect } from 'react';
import { Button, Text, View } from 'react-native';

export function BiometricAuth() {
  const [biometricType, setBiometricType] = useState(null);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (compatible && enrolled) {
      // Types: FINGERPRINT = 1, FACIAL_RECOGNITION = 2
      setBiometricType(types);
    }
  };

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });

    if (result.success) {
      console.log('Authenticated!');
      // Proceed to app
    } else {
      console.log('Authentication failed:', result.error);
    }
  };

  return (
    <View>
      <Text>
        Biometric: {biometricType?.includes(2) ? 'Face ID' : 'Touch ID'}
      </Text>
      <Button title="Authenticate" onPress={authenticate} />
    </View>
  );
}
```

---

## Part 9: Social Login (Apple, Google, Facebook)

### Expo Auth Session

```bash
npx expo install expo-auth-session expo-crypto expo-web-browser
```

### Google Sign-In

```tsx
// components/GoogleSignIn.tsx
import * as Google from 'expo-auth-session/providers/google';
import { useState, useEffect } from 'react';
import { Button } from 'react-native';

export function GoogleSignIn() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // Send token to backend
      fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authentication.accessToken }),
      });
    }
  }, [response]);

  return (
    <Button
      title="Sign in with Google"
      disabled={!request}
      onPress={() => promptAsync()}
    />
  );
}
```

### Apple Sign-In

```tsx
// components/AppleSignIn.tsx (iOS only)
import * as AppleAuthentication from 'expo-apple-authentication';

export function AppleSignIn() {
  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Send to backend
      fetch('/api/auth/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          user: credential.user,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={{ width: 200, height: 44 }}
      onPress={signInWithApple}
    />
  );
}
```

---

## Part 10: Analytics SDKs (Amplitude, Mixpanel)

### Amplitude Analytics

```bash
npm install @amplitude/analytics-react-native
```

```typescript
// lib/analytics.ts
import * as amplitude from '@amplitude/analytics-react-native';

// Initialize
amplitude.init('YOUR_AMPLITUDE_API_KEY');

// Track event
export const trackEvent = (eventName: string, properties?: object) => {
  amplitude.track(eventName, properties);
};

// Identify user
export const identifyUser = (userId: string, traits?: object) => {
  amplitude.setUserId(userId);
  amplitude.identify(new amplitude.Identify().set('plan', 'pro'));
};
```

### Mixpanel Analytics

```bash
npm install mixpanel-react-native
```

```typescript
// lib/mixpanel.ts
import { Mixpanel } from 'mixpanel-react-native';

const mixpanel = new Mixpanel('YOUR_MIXPANEL_TOKEN');
await mixpanel.init();

// Track event
export const trackEvent = (eventName: string, properties?: object) => {
  mixpanel.track(eventName, properties);
};

// Identify user
export const identifyUser = (userId: string) => {
  mixpanel.identify(userId);
  mixpanel.getPeople().set({ '$name': 'John Doe', 'plan': 'premium' });
};
```

---

## Part 11: Common Plugin Patterns

### Permission Flow

```typescript
// components/PermissionGate.tsx
import * as Camera from 'expo-camera';
import * as Notifications from 'expo-notifications';

export const requestAllPermissions = async () => {
  const camera = await Camera.requestCameraPermissionsAsync();
  const media = await ImagePicker.requestMediaLibraryPermissionsAsync();
  const notifications = await Notifications.requestPermissionsAsync();
  const location = await Location.requestForegroundPermissionsAsync();

  return {
    camera: camera.granted,
    media: media.granted,
    notifications: notifications.granted,
    location: location.granted,
  };
};
```

### Error Handling

```typescript
// Always handle plugin errors gracefully
const safePluginCall = async (pluginFn: () => Promise<any>) => {
  try {
    return await pluginFn();
  } catch (error) {
    if (error.code === 'E_PICKER_CANCELLED') {
      // User cancelled
      return null;
    }

    console.error('Plugin error:', error);
    alert('Something went wrong. Please try again.');
    return null;
  }
};
```

---

## Part 12: Testing Mobile Plugins

### Test on Physical Device

```bash
# Expo Go (for testing)
npx expo start

# Scan QR code with:
# - iOS: Camera app
# - Android: Expo Go app

# For testing IAP, push notifications:
# - Build development build
eas build --profile development --platform ios
```

### Debugging

```typescript
// Enable debug logging
import { LogBox } from 'react-native';

if (__DEV__) {
  LogBox.ignoreLogs(['Warning: ...']); // Ignore specific warnings
}

// Remote debugging
// Shake device → "Debug" (opens Chrome DevTools)
```

---

## When to Use This Skill

- Adding camera/gallery access to mobile app
- Implementing push notifications
- Integrating GIF search (Giphy)
- Setting up in-app purchases (subscriptions, products)
- Adding biometric authentication (Face ID, Touch ID)
- Implementing deep linking (myapp://...)
- Social login (Google, Apple, Facebook)
- Sharing content to other apps
- Tracking user analytics (Amplitude, Mixpanel)
- Accessing device location

---

## See Also

- `agents/mobile-native/SKILL.md` - React Native patterns
- `app-types/mobile/SKILL.md` - Mobile app blueprint
- `agents/realtime/SKILL.md` - Real-time features
- `agents/analytics/SKILL.md` - Analytics tracking
- `agents/touch-interactions/SKILL.md` - Touch gestures
- `agents/micro-interactions/SKILL.md` - Mobile animations
