---
name: touch-interactions
description: Touch interactions. Gestures, haptics, swipe actions, mobile-first UX.
last_updated: 2026-03
owner: Frank
---

# Touch Interactions

Build natural, responsive touch experiences for mobile.

> **See also:** `agents/mobile-native/SKILL.md`, `agents/motion/SKILL.md`

---

## Context Questions

Before implementing touch interactions:

1. **What platform?** — React Native, web, hybrid
2. **What gesture types?** — Tap, swipe, pinch, long press, pan
3. **What's the feedback model?** — Visual only, haptic, audio
4. **What's the complexity?** — Single gesture, combined gestures, custom
5. **Mobile-first or cross-platform?** — iOS/Android only, web too

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Platform** | React Native ←→ Web |
| **Complexity** | Simple tap ←→ Multi-finger gestures |
| **Feedback** | Visual only ←→ Full haptic |
| **Library** | Native APIs ←→ Gesture Handler |
| **Customization** | Pre-built ←→ Custom physics |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| React Native app | Gesture Handler + Reanimated |
| Web-only | Framer Motion or native touch events |
| Need haptics | expo-haptics with feedback patterns |
| Swipe actions on list | Swipeable component from Gesture Handler |
| Custom drag behavior | Pan gesture with spring physics |
| Accessibility critical | Ensure touch targets ≥44pt |

---

## TL;DR

| Gesture | Use Case |
|---------|----------|
| **Tap** | Primary action |
| **Long Press** | Secondary menu |
| **Swipe** | Navigation, actions |
| **Pinch** | Zoom |
| **Pan** | Move, scroll |

---

## Part 1: React Native Gesture Handler

### Setup

```bash
npx expo install react-native-gesture-handler react-native-reanimated
```

```tsx
// app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack />
    </GestureHandlerRootView>
  );
}
```

### Tap Gesture

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring 
} from 'react-native-reanimated';

function TappableCard() {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Text>Tap me</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

### Long Press

```tsx
function LongPressItem({ onDelete }) {
  const isPressed = useSharedValue(false);

  const longPress = Gesture.LongPress()
    .minDuration(500) // 500ms to trigger
    .onStart(() => {
      isPressed.value = true;
      // Trigger haptic
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    })
    .onEnd(() => {
      isPressed.value = false;
      onDelete?.();
    });

  const style = useAnimatedStyle(() => ({
    backgroundColor: isPressed.value ? '#fee' : '#fff',
  }));

  return (
    <GestureDetector gesture={longPress}>
      <Animated.View style={style}>
        <Text>Long press to delete</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

### Swipe Actions

```tsx
import { Swipeable } from 'react-native-gesture-handler';

function SwipeableRow({ children, onDelete }) {
  const renderRightActions = () => (
    <TouchableOpacity 
      style={styles.deleteButton}
      onPress={onDelete}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      {children}
    </Swipeable>
  );
}

// Usage
<SwipeableRow onDelete={() => deleteItem(id)}>
  <ItemCard item={item} />
</SwipeableRow>
```

### Pan Gesture (Drag)

```tsx
function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      // Spring back to origin
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.box, style]} />
    </GestureDetector>
  );
}
```

### Pinch to Zoom

```tsx
function ZoomableImage({ source }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // Clamp between 0.5x and 3x
      if (scale.value < 0.5) {
        scale.value = withSpring(0.5);
        savedScale.value = 0.5;
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
        savedScale.value = 3;
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinch}>
      <Animated.Image source={source} style={[styles.image, style]} />
    </GestureDetector>
  );
}
```

---

## Part 2: Haptic Feedback

### Setup

```bash
npx expo install expo-haptics
```

### Haptic Patterns

```tsx
import * as Haptics from 'expo-haptics';

// Light - subtle confirmation
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium - standard feedback
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy - strong confirmation
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Success - task completed
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Warning - caution
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

// Error - something wrong
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

// Selection - toggle, picker
Haptics.selectionAsync();
```

### When to Use Haptics

| Action | Haptic Type |
|--------|-------------|
| Button tap | Light or Medium |
| Toggle switch | Selection |
| Delete item | Heavy + Warning |
| Success | Success notification |
| Error | Error notification |
| Pull-to-refresh | Medium at threshold |
| Swipe action | Light during, Heavy on commit |

### Custom Haptic Hook

```tsx
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function useHaptics() {
  const isSupported = Platform.OS !== 'web';

  const tap = () => {
    if (isSupported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const success = () => {
    if (isSupported) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const error = () => {
    if (isSupported) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const heavy = () => {
    if (isSupported) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return { tap, success, error, heavy };
}

// Usage
const { tap, success } = useHaptics();
<Button onPress={() => { tap(); doAction(); }} />
```

---

## Part 3: Pull-to-Refresh

### FlatList Built-in

```tsx
function RefreshableList() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#007AFF"
          colors={['#007AFF']} // Android
        />
      }
    />
  );
}
```

### Custom Pull-to-Refresh

```tsx
function CustomPullRefresh() {
  const translateY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0 && !isRefreshing.value) {
        translateY.value = Math.min(event.translationY * 0.5, 100);
        
        // Haptic at threshold
        if (translateY.value > 60) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    })
    .onEnd(() => {
      if (translateY.value > 60) {
        isRefreshing.value = true;
        translateY.value = withSpring(60);
        runOnJS(onRefresh)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        {/* Content */}
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## Part 4: Swipe Actions (List Items)

### Delete on Swipe

```tsx
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const SWIPE_THRESHOLD = -80;

function SwipeToDelete({ onDelete, children }) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd((event) => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-200, {}, () => {
          runOnJS(onDelete)();
        });
      } else {
        translateX.value = withTiming(0);
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Delete button behind */}
      <View style={styles.deleteBackground}>
        <Ionicons name="trash" size={24} color="white" />
      </View>
      
      {/* Content slides over */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.content, style]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

### Multiple Actions (Archive, Delete)

```tsx
function SwipeActions({ onArchive, onDelete, children }) {
  const translateX = useSharedValue(0);

  // Swipe left = delete, swipe right = archive
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (translateX.value < -100) {
        runOnJS(onDelete)();
      } else if (translateX.value > 100) {
        runOnJS(onArchive)();
      }
      translateX.value = withSpring(0);
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View>{children}</Animated.View>
    </GestureDetector>
  );
}
```

---

## Part 5: Web Touch Events

### Basic Touch Handling

```tsx
// React (web)
function TouchableDiv() {
  const handleTouchStart = (e: React.TouchEvent) => {
    console.log('Touch started at:', e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    console.log('Moving:', e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    console.log('Touch ended');
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      Touch me
    </div>
  );
}
```

### Swipe Detection (Web)

```tsx
import { useState, useRef } from 'react';

function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = 0;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) onSwipeLeft();
    if (isRightSwipe) onSwipeRight();
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}
```

### Framer Motion Drag

```tsx
import { motion } from 'framer-motion';

function DraggableCard() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      whileDrag={{ scale: 1.05 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) {
          // Swiped right
        } else if (info.offset.x < -100) {
          // Swiped left
        }
      }}
    >
      Drag me
    </motion.div>
  );
}
```

---

## Part 6: Touch-Friendly UI Patterns

### Minimum Touch Targets

```css
/* Minimum 44x44 points for touch targets */
.button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
}

/* More generous for important actions */
.primary-button {
  min-height: 48px;
  padding: 14px 24px;
}
```

### Thumb Zone (Mobile)

```
┌─────────────────────────────────┐
│                                 │ <- Hard to reach
│           Status bar            │
├─────────────────────────────────┤
│                                 │
│                                 │
│         Content area            │ <- Scrollable
│                                 │
│                                 │
├─────────────────────────────────┤
│   [Action 1]  [Action 2]  [+]   │ <- Easy to reach
│         Bottom navigation       │ <- Primary actions here
└─────────────────────────────────┘
```

### Loading States

```tsx
function TouchableWithLoading({ onPress, loading, children }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        loading && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        children
      )}
    </Pressable>
  );
}
```

---

## Checklist

```markdown
- [ ] Gesture Handler installed and configured
- [ ] Tap feedback on all buttons
- [ ] Haptics on important actions
- [ ] Swipe actions for list items
- [ ] Pull-to-refresh where needed
- [ ] Touch targets >= 44x44 points
- [ ] Important actions in thumb zone
- [ ] Loading states for async actions
```

---

## Resources

- Gesture Handler: <https://docs.swmansion.com/react-native-gesture-handler/>
- Reanimated: <https://docs.swmansion.com/react-native-reanimated/>
- Expo Haptics: <https://docs.expo.dev/versions/latest/sdk/haptics/>
- Touch Guidelines: <https://developer.apple.com/design/human-interface-guidelines/inputs>

---

## Related Skills

- `agents/mobile-native/SKILL.md` — React Native basics
- `agents/motion/SKILL.md` — Animation patterns
- `agents/micro-interactions/SKILL.md` — Subtle feedback
