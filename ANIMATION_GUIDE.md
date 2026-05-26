# Point 7: Animation & Interactivity Guide

## Overview

Comprehensive animation system using **Framer Motion** and **Lucide Icons** for smooth, consistent interactions across the Neellohit platform.

---

## Animation Library

All animations are defined in `lib/animations.ts` for easy reuse and consistency.

### Quick Reference

```typescript
import { animations, variants } from "@/lib/animations"
```

---

## Animation Patterns

### 1. ENTRY ANIMATIONS
**Purpose**: Smooth fade-in with upward slide when page/component loads

**Pattern**: Opacity fade + Y-axis slide

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  Content
</motion.div>
```

**Variants Available**:
- `fadeUp`: Fade in with Y-slide (0.4s)
- `fadeIn`: Pure opacity fade (0.3s)
- `scaleIn`: Fade + scale up (0.3s)
- `slideInLeft`: Fade + X-slide from left (0.4s)
- `slideInRight`: Fade + X-slide from right (0.4s)

**Usage**:
- Page content on navigation
- Card appearances in lists
- Modal/dialog openings
- New sections coming into view

---

### 2. HOVER EFFECTS
**Purpose**: Provide visual feedback when user hovers over interactive elements

**Pattern**: Scale + Color transitions

```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click Me
</motion.button>
```

**Available Hover Effects**:
- `scale: 1.05` - Medium scale (cards, buttons)
- `scale: 1.02` - Small scale (subtle feedback)
- `scale: 1.1` - Large scale (icon buttons)
- `y: -4` - Lift effect (cards)
- `boxShadow: "0 0 40px rgba(239, 68, 68, 0.3)"` - Red glow

**Color Transitions** (via CSS):
- Primary buttons: `hover:bg-red-600`
- Secondary buttons: `hover:bg-red-500/10 hover:text-red-200`
- Cards: `hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]`

**Usage**:
- Buttons (primary, secondary, icon)
- Cards (task cards, stat cards)
- Links and nav items
- Input focus states

---

### 3. ACTIVE STATES
**Purpose**: Highlight selected/active states with smooth transitions

**Pattern**: Smooth background + border changes

```typescript
<motion.div
  className={`
    border-2 transition-colors duration-200
    ${active 
      ? "bg-red-500/10 border-red-500/50" 
      : "border-transparent"}
  `}
  layout
>
  Active Item
</motion.div>
```

**Smooth Transitions** (200-300ms):
```typescript
transition: { duration: 0.2, ease: "easeInOut" }
```

**Spring Transitions** (for premium feel):
```typescript
transition: { type: "spring", bounce: 0.2, duration: 0.6 }
```

**Usage**:
- Navigation tabs (active background change)
- Filter buttons (selected state)
- Sidebar menu items (active highlight)
- Form radio buttons/checkboxes

---

### 4. AMBIENT ANIMATIONS
**Purpose**: Continuous, subtle background animations that catch attention without distraction

**Pattern**: 15-20 second loops with low opacity

```typescript
<motion.div
  animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
  className="fixed w-[600px] h-[600px] bg-red-500/8 rounded-full blur-[120px]"
/>
```

**Ambient Effects Available**:

| Effect | Duration | Loop Type | Use Case |
|--------|----------|-----------|----------|
| `pulse` | 15s | Opacity + scale | Background glows |
| `glow` | 20s | Scale + opacity | Decorative elements |
| `float` | 6s | Y-position | Cards, buttons |
| `rotate` | 20s | Rotation | Loading spinners |
| `rotateSlowReverse` | 30s | Reverse rotation | Background elements |

**Implementation**:
```typescript
// Pulse glow
animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
transition={{ duration: 15, repeat: Infinity, ease: "linear" }}

// Slow rotation
animate={{ rotate: 360 }}
transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
```

**Usage**:
- Background glow effects (top-left, bottom-right)
- Decorative floating elements
- Loading spinners
- Accent animations (subtle pulsing badges)

---

### 5. STAGGERED ANIMATIONS
**Purpose**: Cascade animations for list items, creating professional entrance effect

**Pattern**: Parent container with staggered children

```typescript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

**Stagger Delays**:
- Small: 50ms (many items)
- Medium: 100ms (normal lists)
- Large: 150ms (fewer items)

**Usage**:
- Task card lists
- Dashboard stat cards
- Manager account lists
- Form field groups

---

### 6. PAGE TRANSITIONS
**Purpose**: Smooth navigation between pages

**Pattern**: Fade + Y-slide between routes

```typescript
<motion.div
  key={pathname}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  {children}
</motion.div>
```

**Already Implemented In**:
- Dashboard layout (line 213-220)
- Manager layout
- Content wrappers

---

## Color Transitions

### Dark Mode
```typescript
// Smooth color transition on hover
className="transition-colors duration-300"
```

### Light Mode
```typescript
// Same CSS transition classes work in both modes
className="transition-all duration-500"
```

---

## Lucide Icons Integration

All icons come from `lucide-react`:

```typescript
import {
  Zap,           // Fast, energy
  Users,         // Community, people
  TrendingUp,    // Growth, success
  Clock,         // Time, duration
  CheckCircle2,  // Success, approval
  AlertCircle,   // Warning, important
  ArrowRight,    // Action, next
  // ... 100+ more
} from "lucide-react"
```

**Icon Usage**:
```typescript
<CheckCircle2 className="w-6 h-6 text-green-500" />
<Clock className="w-5 h-5 text-slate-400" />
<TrendingUp className="w-4 h-4" />
```

**Animated Icons**:
```typescript
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
>
  <Loader2 className="w-6 h-6 text-red-500" />
</motion.div>
```

---

## Implementation Checklist

### Pages Updated with Animations ✅

#### Auth Pages
- [x] app/auth/page.tsx - Entry animations
- [x] app/signup/page.tsx - Staggered form inputs
- [x] app/login/page.tsx - Smooth transitions
- [x] app/pending-approval/page.tsx - Timeline animations

#### Dashboard
- [x] app/dashboard/layout.tsx - Page transitions
- [ ] app/dashboard/tasks/page.tsx - Card stagger animations
- [ ] app/dashboard/wallet/page.tsx - Stat card animations
- [ ] app/dashboard/account/page.tsx - Form animations

#### Manager
- [x] app/manager/layout.tsx - Page transitions
- [ ] app/manager/tasks/page.tsx - Task list animations
- [ ] app/manager/tasks/create/page.tsx - Form field animations
- [ ] app/manager/submissions/page.tsx - Submission list animations

#### Admin
- [x] app/admin/layout.tsx - Page transitions
- [ ] app/admin/users/page.tsx - User list animations
- [ ] app/admin/tasks/page.tsx - Admin task animations

#### Landing & Showcase
- [x] app/page.tsx - Landing animations
- [x] app/demo/page.tsx - Demo animations with ambient glows

---

## Performance Tips

1. **Use `layoutId` for shared layout animations** when multiple elements transition between positions
2. **Prefer `whileInView` for scroll-triggered animations** instead of watching scroll position
3. **Use `once: true` in viewport** to animate only on first appearance
4. **Limit simultaneous animations** - max 5-6 at once for 60fps performance
5. **Use CSS transitions** for simple color/background changes (cheaper than Framer Motion)
6. **Optimize motion.div usage** - don't wrap every element, only animated ones

---

## Common Patterns

### Loading Spinner
```typescript
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
>
  <Loader2 className="w-6 h-6" />
</motion.div>
```

### Fade In List
```typescript
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

### Card Hover Effect
```typescript
<motion.div
  whileHover={{
    scale: 1.05,
    boxShadow: "0 0 40px rgba(239, 68, 68, 0.3)",
  }}
  className="bg-[#7f1d1d] border-2 border-black rounded-3xl p-6"
>
  Content
</motion.div>
```

### Active Tab
```typescript
<motion.button
  className={`
    px-4 py-2 rounded-xl transition-colors duration-200
    ${active
      ? "bg-red-500/10 border border-red-500/50"
      : "border border-transparent"}
  `}
>
  {active && (
    <motion.div
      layoutId="active-indicator"
      className="absolute inset-0 rounded-xl bg-red-500/10"
      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
    />
  )}
  Tab
</motion.button>
```

---

## Browser Support

- ✅ Chrome/Edge (All versions with Framer Motion)
- ✅ Firefox (All versions)
- ✅ Safari (12+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**GPU Acceleration**: Transforms and opacity changes use GPU for 60fps performa