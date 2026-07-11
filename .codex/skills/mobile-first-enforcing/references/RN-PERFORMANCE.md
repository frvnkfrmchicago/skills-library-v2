# React Native Performance

## Hermes Engine

Hermes is the default JS engine for Expo SDK 49+. Verify it's enabled:

```json
// app.json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```

If `jsEngine` is missing or set to `"jsc"`, switch to Hermes for:
- 50-80% faster startup
- Lower memory usage
- Better garbage collection

---

## Re-Render Debugging

### Identify Unnecessary Re-Renders

```tsx
// Temporary: wrap component in React.memo and log renders
const MyComponent = React.memo(function MyComponent({ data }: Props) {
  console.log('MyComponent rendered'); // remove before shipping
  return <View>...</View>;
});
```

### Common Re-Render Causes

1. **Inline objects/arrays in props** — create new reference every render
   ```tsx
   // ❌ New object every render
   <View style={{ padding: 16 }}>
   
   // ✅ Stable reference
   const styles = StyleSheet.create({ container: { padding: 16 } });
   <View style={styles.container}>
   ```

2. **Inline callbacks** — wrap in `useCallback`
   ```tsx
   // ❌ New function every render
   <Pressable onPress={() => navigate(item.id)}>
   
   // ✅ Stable callback
   const handlePress = useCallback(() => navigate(item.id), [item.id]);
   <Pressable onPress={handlePress}>
   ```

3. **Context providers re-rendering all consumers** — split contexts by update frequency

---

## FlatList Optimization

```tsx
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  // Performance props:
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}     // Unmount off-screen items
  maxToRenderPerBatch={10}          // Render 10 items per batch
  windowSize={5}                    // Keep 5 screens of items in memory
  initialNumToRender={10}           // First render: 10 items
  updateCellsBatchingPeriod={50}    // Batch updates every 50ms
/>
```

### When to Use Which

| Component | Use For |
|-----------|---------|
| `FlatList` | Simple lists > 20 items |
| `SectionList` | Grouped lists with headers |
| `FlashList` (Shopify) | High-perf lists > 100 items, drop-in FlatList replacement |
| `ScrollView` | Static content, < 20 items |

---

## Image Optimization in RN

```tsx
// ✅ expo-image (recommended over Image from react-native)
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  style={{ width: 200, height: 200 }}
  contentFit="cover"
  placeholder={blurhash}          // Show placeholder while loading
  transition={200}                 // Fade in
  cachePolicy="memory-disk"        // Cache aggressively
/>
```

- Use `expo-image` instead of `react-native` Image — better caching, blurhash, transitions
- Always set explicit `width` and `height`
- Use `cachePolicy` to avoid re-downloading

---

## Navigation Performance

### Lazy Loading Screens

```tsx
// Expo Router — screens are lazy by default
// React Navigation — use lazy prop:
<Tab.Screen
  name="Settings"
  component={SettingsScreen}
  options={{ lazy: true }}
/>
```

### Reduce Initial Bundle

```tsx
// Heavy screens: dynamic import
const HeavyChart = React.lazy(() => import('./HeavyChart'));

// Wrap in Suspense
<Suspense fallback={<ActivityIndicator />}>
  <HeavyChart />
</Suspense>
```

---

## App Size Optimization

- Run `npx expo-doctor` to check for common issues
- Use `npx react-native-bundle-visualizer` to find large dependencies
- Tree-shake unused imports
- Use `expo-asset` for local assets that need caching

---

## Animation Performance

```tsx
// ✅ Reanimated — runs on UI thread, 60fps
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const offset = useSharedValue(0);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: offset.value }],
}));

// ❌ Animated API from react-native — runs on JS thread, can jank
```

Use `react-native-reanimated` for all animations. The built-in `Animated` API runs on the JS thread and drops frames under load.

---

## Debugging Tools

| Tool | What It Shows |
|------|--------------|
| React DevTools | Component tree, re-renders, props |
| Flipper | Network, layout, performance, logs |
| `console.time()` / `console.timeEnd()` | Custom timing measurements |
| Xcode Instruments | iOS memory, CPU, energy |
| Android Studio Profiler | Android memory, CPU, network |
