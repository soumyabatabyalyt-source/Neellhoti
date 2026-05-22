# Global Theme Implementation Guide

## Quick Apply Pattern

For any page that needs dark/light mode support, follow this pattern:

### Step 1: Import Theme Hook
```typescript
import { useTheme } from "@/lib/useTheme"
```

### Step 2: Initialize in Component
```typescript
const { dark, mounted } = useTheme()

if (!mounted) return null
```

### Step 3: Apply to Main Container
```typescript
<div className={`
  your-existing-classes
  transition-colors duration-500
  ${dark ? "bg-[#0f0814] text-white" : "bg-[#fafaf8] text-slate-900"}
`}>
```

### Step 4: Update Key Elements

#### Background Color
```typescript
${dark ? "bg-[#0f0814]" : "bg-[#fafaf8]"}
```

#### Cards/Boxes
```typescript
${dark 
  ? "bg-white/[0.05] border-white/10" 
  : "bg-[#7f1d1d] border-black"
}
```

#### Input Fields
```typescript
${dark
  ? "bg-black/30 border-white/10 text-white placeholder-slate-500"
  : "bg-white/60 border-red-500/30 text-slate-900 placeholder-slate-500"
}
```

#### Buttons
```typescript
${dark
  ? "bg-red-500 hover:bg-red-600 text-white"
  : "bg-red-500 hover:bg-red-600 text-white"}
```

#### Text Colors
```typescript
${dark ? "text-white/60" : "text-slate-600"}
```

#### Borders & Dividers
```typescript
${dark ? "bg-white/10" : "bg-red-500/20"}
```

---

## Color Reference

### Core Colors

| Element | Dark Mode | Light Mode |
|---------|-----------|-----------|
| Background | `#0f0814` | `#fafaf8` |
| Cards | `#7f1d1d` | `#7f1d1d` |
| Text Primary | `#ffffff` | `#1f2937` |
| Text Secondary | `#9ca3af` | `#6b7280` |
| Borders | `#000000` | `#000000` |
| Accents | `#ef4444` | `#ef4444` |

### Opacity Variations

**Dark Mode:**
- White 5%: `white/[0.05]`
- White 10%: `white/10`
- White 20%: `white/20`
- Red 20%: `red-500/20`

**Light Mode:**
- Red 20%: `red-500/20`
- Red 30%: `red-500/30`
- Red 60%: `red-500/60`
- White 60%: `white/60`

---

## Pages to Update (In Order of Priority)

### ✅ Already Updated
- [x] app/layout.tsx (root)
- [x] app/page.tsx (landing)
- [x] app/demo/page.tsx (theme showcase)
- [x] app/dashboard/layout.tsx
- [x] app/manager/layout.tsx
- [x] app/admin/layout.tsx
- [x] app/auth/page.tsx
- [x] app/signup/page.tsx

### 🔄 In Progress
- [ ] app/login/page.tsx
- [ ] app/auth/callback/page.tsx
- [ ] app/pending-approval/page.tsx

### ⏳ Remaining Pages (Inherit from Layouts)
The following pages automatically inherit theme from their layouts, so they may not need individual updates unless they have custom background styling:

**Dashboard Pages:**
- app/dashboard/page.tsx
- app/dashboard/tasks/page.tsx
- app/dashboard/my-tasks/page.tsx
- app/dashboard/my-tasks/active/page.tsx
- app/dashboard/my-tasks/history/page.tsx
- app/dashboard/wallet/page.tsx
- app/dashboard/account/page.tsx

**Manager Pages:**
- app/manager/page.tsx
- app/manager/tasks/page.tsx
- app/manager/tasks/create/page.tsx
- app/manager/submissions/page.tsx
- app/manager/accounts/page.tsx
- app/manager/taskers/page.tsx
- app/manager/withdrawals/page.tsx
- app/manager/draft-tasks/page.tsx

**Admin Pages:**
- app/admin/page.tsx
- app/admin/users/page.tsx
- app/admin/tasks/page.tsx
- app/admin/withdrawals/page.tsx
- app/admin/settings/page.tsx
- app/admin/logs/page.tsx

**Other Pages:**
- app/client/page.tsx
- app/start-campaign/page.tsx
- app/wallet/page.tsx
- app/my-tasks/page.tsx

---

## Custom Component Pattern

For custom components that need theme support:

```typescript
import { useTheme } from "@/lib/useTheme"

export function MyComponent() {
  const { dark } = useTheme()

  return (
    <div className={`
      ${dark ? "bg-[#0f0814]" : "bg-[#fafaf8]"}
      transition-colors duration-500
    `}>
      {/* Content */}
    </div>
  )
}
```

---

## Tailwind Configuration Notes

The following custom colors are used:
- Dark background: `#0f0814`
- Light background: `#fafaf8`
- Deep red: `#7f1d1d`

These should ideally be added to `tailwind.config.ts`:

```javascript
colors: {
  'theme-dark': '#0f0814',
  'theme-light': '#fafaf8',
  'theme-red': '#7f1d1d',
}
```

Then use:
```typescript
${dark ? "bg-theme-dark" : "bg-theme-light"}
```

---

## Testing Checklist

For each updated page, verify:
- [ ] Page loads without hydration errors
- [ ] Theme toggle works (moon/sun icon)
- [ ] Dark mode colors are correct
- [ ] Light mode colors are correct
- [ ] All text is readable in both modes
- [ ] Forms/inputs are properly styled
- [ ] Buttons are properly styled
- [ ] Transitions are smooth (500ms)
- [ ] No white flashes on page load
- [ ] Mobile responsive in both modes

---

## Common Issues & Fixes

### Issue: White flash on page load
**Solution:** Add `if (!mounted) return null` to prevent hydration mismatch

### Issue: Theme not persisting
**Solution:** Ensure `useTheme()` hook is imported and used

### Issue: Text not visible in light mode
**Solution:** Use `text-slate-900` or `text-[#1f2937]` for light mode

### Issue: Red cards visible
**Solution:** Cards should always be `#7f1d1d` with black borders in both modes

### Issue: Transitions aren't smooth
**Solution:** Add `transition-colors duration-500` to theme-dependent elements

---

## Implementation Status

```
████░░░░░░░░░░░░░░░░░░░░░░░░  25% Complete

✅ Core infrastructure (hooks, utilities)
✅ Layout files (dashboard, manager, admin)
✅ Auth pages (auth, signup)
🔄 Login & other auth pages
⏳ Remaining standalone pages (mostly inherit from layouts)
```

---

**Last Updated:** 2026-05-22
**Next Steps:** Update login page, then verify all pages inherit theme correctly
