# Theme Configuration Guide

## Current Theme Setup

The Neellohit application now features a complete dark/light mode theme system with the following specifications:

---

## Color Palette

### Dark Mode (Default)
```
🟣 Background:        #0f0814 (Dark purple-black tint)
🔴 Cards:             #7f1d1d (Deep red)
⚫ Borders:           #000000 (Pure black)
⚪ Text:              #ffffff (Pure white)
🔴 Red Accents:       #ef4444 (Red glows & highlights)
```

### Light Mode
```
🟡 Background:        #fafaf8 (Creamy white)
🔴 Cards:             #7f1d1d (Deep red - same as dark mode)
⚫ Borders:           #000000 (Pure black - same as dark mode)
⚫ Text:              #1f2937 (Dark gray/charcoal)
🔴 Red Accents:       #ef4444 (Red highlights)
```

---

## Theme Toggle

### Location
The theme toggle button is located in the **top-right corner of the navbar** on:
- Dashboard (`/dashboard`)
- Manager Panel (`/manager`)
- Admin Panel (`/admin`)

### Button Appearance

**Dark Mode:**
- Background: Transparent (white/5)
- Border: Subtle white border
- Icon: Moon icon (yellow/golden color)
- Hover Effect: Slight brightness increase

**Light Mode:**
- Background: White
- Border: Slate gray border
- Icon: Sun icon (golden color)
- Hover Effect: Light gray background

### How to Use
1. Click the moon/sun icon in the top-right navbar
2. The entire UI transitions smoothly (500ms duration)
3. Your preference is saved to localStorage as `theme`
4. Persists across page refreshes and sessions

---

## Component Styling

### Cards (Both Modes)
- **Background**: `#7f1d1d` (deep red)
- **Border**: `border-black` (black borders)
- **Text**: `text-white` (white text on red)
- **Hover Effect**: Subtle red glow with shadow intensification

### Buttons

**Active/Primary Buttons**
- Dark Mode: Red background with semi-transparent overlay
- Light Mode: Deep red card background with black border

**Secondary Buttons**
- Border-based with red/subtle accents
- Text color adapts to mode

### Navigation Active State
- Dark Mode: Red semi-transparent background with border
- Light Mode: Deep red card background (#7f1d1d) with black border

---

## Layout Backgrounds

### Dark Mode Pages
- Main: `#0f0814`
- Navbar: `#0f0814/80` (with backdrop blur)
- Sidebar: `#111111`
- Mobile Topbar: `#111111`

### Light Mode Pages
- Main: `#fafaf8` (creamy white)
- Navbar: `#fafaf8/95` (with backdrop blur)
- Sidebar: Inherits from main (can override to white if needed)
- Mobile Topbar: Inherits from main

---

## Transitions

All theme changes use **smooth CSS transitions**:
- Duration: `500ms`
- Easing: `ease-in-out` (default)
- Properties: background, border-color, text-color, shadows

```css
transition-colors duration-500
```

---

## Implementation Details

### Dark Mode Detection
The app uses React state to track dark mode:
```javascript
const [dark, setDark] = useState(true)
```

### Persistence
Theme preference is saved to localStorage:
```javascript
localStorage.setItem("theme", dark ? "dark" : "light")
```

### Initial Load
On component mount, the app checks localStorage:
```javascript
const saved = localStorage.getItem("theme")
if (saved === "light") setDark(false)
```

---

## Color Reference

### Red Variations
```
#7f1d1d  - Deep Red (cards)
#991b1b  - Darker Red (hover state)
#ef4444  - Bright Red (accents, glows)
```

### Text Variations
```
#ffffff  - Pure White (dark mode text)
#1f2937  - Dark Gray (light mode text)
#6b7280  - Medium Gray (secondary text)
```

### Background Variations
```
#0f0814  - Dark Purple-black (dark mode)
#111111  - Near Black (sidebars)
#fafaf8  - Creamy White (light mode)
#f5f3f0  - Slightly warmer cream (alternative)
```

---

## Glowing Effects

### Dark Mode Glows
```css
shadow-[0_0_Xpx_rgba(239,68,68,Y)]
- X: 15-40px (intensity)
- Y: 0.1-0.4 (opacity)
```

### Light Mode Glows
```css
shadow-[0_0_Xpx_rgba(239,68,68,Y)]
- X: 10-25px (subtle)
- Y: 0.1-0.2 (low opacity)
```

---

## Files Modified

1. **app/layout.tsx** - Root background
2. **app/page.tsx** - Landing page
3. **app/demo/page.tsx** - Theme showcase
4. **app/dashboard/layout.tsx** - Full dark/light support
5. **app/manager/layout.tsx** - Full dark/light support
6. **app/admin/layout.tsx** - Full dark/light support

---

## Testing the Theme

### Dark Mode
1. Navigate to any page
2. Ensure theme toggle shows moon icon
3. Verify dark backgrounds (#0f0814)
4. Check red card styling

### Light Mode
1. Click theme toggle
2. Verify background changes to creamy white (#fafaf8)
3. Check all cards still display as deep red with black borders
4. Verify text is dark and readable
5. Confirm all navigation works properly

### Mobile Responsiveness
1. Resize browser to mobile width
2. Verify topbar appears instead of sidebar
3. Confirm theme toggle still visible and functional
4. Test theme switch on mobile view

---

## Future Customizations

To further customize the theme:

1. **Additional Colors**: Add new color values to Tailwind config
2. **Animation Speed**: Modify `duration-500` to adjust transition speed
3. **Card Styles**: Update `#7f1d1d` to different red tones if needed
4. **Font Colors**: Add custom light mode text colors to Tailwind
5. **Glow Intensity**: Adjust shadow opacity values for more/less glow

---

## Notes

- The creamy white background (#fafaf8) is easier on eyes in light mode than pure white
- Red cards maintain brand identity in both modes
- Black borders provide strong contrast and visual definition
- Purple tint in dark mode (#0f0814) is subtle (5% more than pure black)
- All transitions are smooth and user-friendly
- Theme persists across sessions via localStorage

---

**Status**: ✅ Complete and Ready for Production
