---
name: micro-interactions
description: Micro-interactions. Button states, loading, success animations, haptics, toast, progress, confetti.
last_updated: 2026-03
---

# Micro-interactions

The small details that make apps feel great.

## TL;DR

| Interaction | Where | Library |
|-------------|-------|---------|
| **Button press** | Everywhere | Motion, CSS |
| **Loading** | Data fetches | Skeleton, spinner |
| **Success/Error** | Form submit | Toast, animation |
| **Haptics** | Mobile touch | React Native |
| **Hover effects** | Desktop | CSS, Motion |
| **Confetti** | Celebrations | canvas-confetti |

---

## Context Questions (Ask Before Recommending)

Before suggesting micro-interaction patterns:

1. **What's the interaction trigger?** (button click, form submit, scroll, gesture)
2. **What's the feedback purpose?** (confirm action, show progress, celebrate, alert error)
3. **What's the platform?** (web, mobile, both)
4. **Performance constraints?** (low-end devices, battery-sensitive)
5. **Brand intensity?** (subtle/professional, playful/bold)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Intensity** | Subtle (opacity change) ←→ Dramatic (confetti, shake) |
| **Duration** | Instant (50ms) ←→ Noticeable (300ms+) |
| **Feedback Type** | Visual only ←→ Visual + Haptic + Audio |
| **Trigger** | Hover ←→ Click ←→ Scroll ←→ Gesture |
| **Celebration Level** | None ←→ Toast ←→ Confetti |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Button + confirmation | Scale down on press, subtle spring |
| Form + success | Checkmark animation + toast |
| Form + error | Shake animation + red border |
| Mobile + important action | Haptic feedback + visual |
| Achievement + celebration | Confetti + toast |
| Loading + unknown duration | Spinner or skeleton |
| Loading + known progress | Progress bar |

---

## Part 1: Button Feedback

### Press States with Motion

```tsx
import { motion } from 'motion/react';

const AnimatedButton = ({ children, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    className="px-6 py-3 bg-blue-600 text-white rounded-lg"
  >
    {children}
  </motion.button>
);
```

### Pure CSS States

```css
.button {
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

### Loading Button State

```tsx
const SubmitButton = ({ loading, children }) => (
  <button 
    disabled={loading}
    className="relative"
  >
    <span className={loading ? 'invisible' : ''}>{children}</span>
    {loading && (
      <span className="absolute inset-0 flex items-center justify-center">
        <Spinner size="sm" />
      </span>
    )}
  </button>
);
```

---

## Part 2: Loading States

### Skeleton Loading

```tsx
// Skeleton component
const Skeleton = ({ className }) => (
  <div 
    className={cn(
      'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
      className
    )}
  />
);

// Usage for card
const CardSkeleton = () => (
  <div className="p-4 space-y-4">
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

// Usage for list
const ListSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
```

### Spinner Variants

```tsx
// Simple spinner
const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  
  return (
    <svg
      className={cn('animate-spin', sizes[size])}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
};

// Dots spinner
const DotsSpinner = () => (
  <div className="flex gap-1">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className="h-2 w-2 bg-current rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);
```

### Progress Indicators

```tsx
// Linear progress
const ProgressBar = ({ value, max = 100 }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
    <motion.div
      className="bg-blue-600 h-full"
      initial={{ width: 0 }}
      animate={{ width: `${(value / max) * 100}%` }}
      transition={{ duration: 0.3 }}
    />
  </div>
);

// Circular progress
const CircularProgress = ({ value, size = 40 }) => {
  const radius = (size - 4) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        className="stroke-gray-200"
        fill="none"
        strokeWidth="4"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <motion.circle
        className="stroke-blue-600"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        style={{ strokeDasharray: circumference }}
      />
    </svg>
  );
};
```

---

## Part 3: Success/Error Animations

### Checkmark Animation

```tsx
const SuccessCheck = () => (
  <motion.svg
    viewBox="0 0 50 50"
    className="h-16 w-16"
  >
    <motion.circle
      cx="25" cy="25" r="20"
      className="fill-green-500"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    />
    <motion.path
      d="M15 25 L22 32 L35 18"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    />
  </motion.svg>
);
```

### Error Shake

```tsx
const ShakeAnimation = ({ trigger, children }) => (
  <motion.div
    animate={trigger ? {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    } : {}}
  >
    {children}
  </motion.div>
);

// Usage
const FormField = ({ error }) => (
  <ShakeAnimation trigger={error}>
    <Input className={error ? 'border-red-500' : ''} />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </ShakeAnimation>
);
```

### Form Validation Animation

```tsx
const AnimatedInput = ({ error }) => (
  <motion.div
    animate={{
      borderColor: error ? '#ef4444' : '#e5e7eb',
    }}
    className="relative"
  >
    <input className="w-full px-4 py-2 border rounded-lg" />
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className="text-red-500 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </motion.div>
);
```

---

## Part 4: Haptic Feedback (Mobile)

### React Native Haptics

```tsx
import * as Haptics from 'expo-haptics';

// Light tap
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium tap (button press)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy tap (important action)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Success
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Warning
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

// Error
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

// Selection change
Haptics.selectionAsync();
```

### Haptic Button Component

```tsx
import * as Haptics from 'expo-haptics';
import { Pressable, Animated } from 'react-native';

const HapticButton = ({ onPress, children }) => {
  const scale = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };
  
  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
```

### Web Vibration API

```tsx
// Limited support, use sparingly
const vibrate = (pattern?: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern || 10);
  }
};

// Usage
<button onClick={() => { vibrate(); handleClick(); }}>
  Click Me
</button>
```

---

## Part 5: Hover Effects

### Card Hover

```tsx
const HoverCard = ({ children }) => (
  <motion.div
    className="bg-white rounded-xl p-6 shadow-sm"
    whileHover={{
      y: -4,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);
```

### Magnetic Effect

```tsx
const MagneticButton = ({ children }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setPosition({
      x: (e.clientX - centerX) * 0.1,
      y: (e.clientY - centerY) * 0.1,
    });
  };
  
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };
  
  return (
    <motion.button
      ref={ref}
      animate={{ x: position.x, y: position.y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.button>
  );
};
```

### Glow on Hover

```css
.glow-button {
  position: relative;
  overflow: hidden;
}

.glow-button::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #ff6b6b);
  background-size: 200% 200%;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -1;
  filter: blur(10px);
}

.glow-button:hover::before {
  opacity: 1;
  animation: glow 2s linear infinite;
}

@keyframes glow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

---

## Part 6: Pull-to-Refresh & Swipe

### Pull-to-Refresh (React Native)

```tsx
import { RefreshControl, ScrollView } from 'react-native';

const Feed = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4F46E5"
        />
      }
    >
      {/* Content */}
    </ScrollView>
  );
};
```

### Swipe Actions (Gesture Handler)

```tsx
import { Swipeable } from 'react-native-gesture-handler';

const SwipeableItem = ({ onDelete, children }) => {
  const renderRightActions = () => (
    <View style={styles.deleteAction}>
      <Text style={styles.deleteText}>Delete</Text>
    </View>
  );
  
  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableRightOpen={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onDelete();
      }}
    >
      {children}
    </Swipeable>
  );
};
```

---

## Part 7: Toast Notifications

### React Hot Toast

```tsx
import toast from 'react-hot-toast';

// Success
toast.success('Changes saved!');

// Error
toast.error('Something went wrong');

// Loading
const loadingToast = toast.loading('Saving...');
// Later:
toast.dismiss(loadingToast);
toast.success('Saved!');

// Custom
toast.custom((t) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: t.visible ? 1 : 0, y: t.visible ? 0 : 50 }}
    className="bg-white rounded-xl p-4 shadow-lg"
  >
    <p>Custom toast content</p>
    <button onClick={() => toast.dismiss(t.id)}>Dismiss</button>
  </motion.div>
));
```

### Toast Provider Setup

```tsx
import { Toaster } from 'react-hot-toast';

const App = () => (
  <>
    <Component />
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
        },
        success: {
          iconTheme: { primary: '#4ade80', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#f87171', secondary: '#fff' },
        },
      }}
    />
  </>
);
```

---

## Part 8: Confetti & Celebrations

### canvas-confetti

```tsx
import confetti from 'canvas-confetti';

// Basic burst
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});

// Fireworks
const fireworks = () => {
  const duration = 3000;
  const end = Date.now() + duration;
  
  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#4F46E5', '#7C3AED', '#06B6D4']
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#4F46E5', '#7C3AED', '#06B6D4']
    });
    
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  
  frame();
};

// Emoji rain
confetti({
  particleCount: 50,
  emoji: ['🎉', '🎊', '⭐', '✨'],
});
```

### Celebration Moments

```tsx
// Achievement unlock
const celebrateAchievement = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
  
  toast('🏆 Achievement Unlocked!', {
    icon: '🎉',
    duration: 4000,
  });
};

// Purchase complete
const celebratePurchase = () => {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.5 }
  });
};

// Streak milestone
const celebrateStreak = (days: number) => {
  confetti({
    particleCount: days * 10,
    spread: 90,
    emoji: ['🔥', '⭐', '💪'],
  });
};
```

---

## Part 9: React Native Reanimated

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

// Press animation
const PressableCard = () => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <GestureDetector
      gesture={Gesture.Tap()
        .onBegin(() => { scale.value = withSpring(0.95); })
        .onFinalize(() => { scale.value = withSpring(1); })
      }
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Content */}
      </Animated.View>
    </GestureDetector>
  );
};

// Pulse animation
const PulsingDot = () => {
  const opacity = useSharedValue(1);
  
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 1000 }),
      -1,
      true
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  return <Animated.View style={[styles.dot, animatedStyle]} />;
};
```

---

## Performance Considerations

```markdown
## Do
- Use CSS transitions for simple effects
- Use transform/opacity (GPU accelerated)
- Debounce rapid triggers
- Use will-change sparingly
- Prefer useNativeDriver (RN)

## Don't
- Animate layout properties (width, height, padding)
- Use heavy animations on scroll
- Trigger many animations simultaneously
- Forget to clean up animation listeners
- Over-use confetti (save for special moments)
```

---

## Checklist

- [ ] Button press states (hover, active, focus)
- [ ] Loading states (skeleton or spinner)
- [ ] Form validation feedback
- [ ] Success/error animations
- [ ] Toast notifications configured
- [ ] Haptics on mobile (if applicable)
- [ ] Celebration moments identified
- [ ] Performance tested on low-end devices

---

## Related Skills

- `motion/SKILL.md` — Framer Motion deep dive
- `gsap/SKILL.md` — Complex animations
- `mobile/SKILL.md` — React Native patterns
- `animation-planning/SKILL.md` — Planning animations
