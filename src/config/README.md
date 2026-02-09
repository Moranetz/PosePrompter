# UX Design System - Organized Structure

This directory contains the UX Design System split into organized modules for better maintainability.

## File Structure

### Core Files

- **`uxConstants.js`** - Core design tokens (BASE grid, touch targets, spacing, typography, icon sizes, colors, hierarchy, forms, patterns, accessibility)
- **`uxAnimations.js`** - Animation constants (easing curves, springs, timing, haptics, audio)
- **`uxMobile.js`** - Mobile-specific optimizations (thumb zones, button sizes, gestures, screen priorities)
- **`uxProgress.js`** - Progress indicators and Zeigarnik Effect implementations
- **`uxEmotional.js`** - Emotional design constants and feeling-first design patterns
- **`uxSocial.js`** - Social proof displays and trust signals
- **`uxLayout.js`** - Layout patterns (vertical rhythm, optical guides, breakpoints, container widths)
- **`uxHelpers.js`** - Utility functions for UX calculations (progress, spacing, colors, typography)

### Entry Points

- **`uxDesignSystem.js`** - Main entry point that re-exports everything (use this for convenience imports)
- **`uxDesignSystem.md`** - Detailed documentation, rules, and guidelines

## Usage

### Import from Main Entry Point (Recommended)

```javascript
import { 
  TOUCH_TARGETS, 
  SPACING, 
  getProgressPercent,
  SPRINGS,
  THUMB_ZONES 
} from './config/uxDesignSystem';
```

### Import from Specific Modules (For Tree-Shaking)

```javascript
// Only import what you need
import { TOUCH_TARGETS, SPACING } from './config/uxConstants';
import { SPRINGS, EASING } from './config/uxAnimations';
import { THUMB_ZONES } from './config/uxMobile';
```

## Organization by UX Law

- **Fitts's Law**: `TOUCH_TARGETS`, `ICON_SIZES`, `BUTTON_SIZES`, `THUMB_ZONES` (uxConstants.js, uxMobile.js)
- **Doherty Threshold**: `RESPONSE_TIMES`, `TIMINGS`, `DURATIONS` (uxConstants.js, uxAnimations.js)
- **Miller's Law**: `CHUNK_LIMITS`, `getChunkedItems()` (uxConstants.js, uxHelpers.js)
- **Law of Proximity**: `BASE`, `SPACING` (8px grid system) (uxConstants.js)
- **Law of Prägnanz**: `TYPOGRAPHY`, `COLORS` (60-30-10 rule) (uxConstants.js)
- **Von Restorff Effect**: `HIERARCHY`, `COLORS.ACCENT` (uxConstants.js)
- **Zeigarnik Effect**: `PROGRESS`, `PROGRESS_LAYERS` (uxProgress.js)
- **Postel's Law**: `FORM` (uxConstants.js)
- **Optical Guides**: `OPTICAL_GUIDE`, `VERTICAL_RHYTHM` (uxLayout.js)

## Adding New Constants

1. **Core constants** (spacing, typography, colors, icons) → Add to `uxConstants.js`
2. **Animation-related** → Add to `uxAnimations.js`
3. **Mobile-specific** → Add to `uxMobile.js`
4. **Progress-related** → Add to `uxProgress.js`
5. **Emotional design** → Add to `uxEmotional.js`
6. **Social proof** → Add to `uxSocial.js`
7. **Layout patterns** → Add to `uxLayout.js`
8. **Helper functions** → Add to `uxHelpers.js`

Then export from `uxDesignSystem.js` for convenience.

## Key Constants Available

### Spacing (8px Grid)
- `BASE` - Base unit (8px)
- `SPACING[1-12]` - Grid multiples (8px, 16px, 24px, etc.)
- `SPACING.XS` through `SPACING['5XL']` - Semantic spacing

### Typography
- `TYPOGRAPHY.XS` through `TYPOGRAPHY['4XL']` - Font sizes
- `TYPOGRAPHY.NORMAL` through `TYPOGRAPHY.BOLD` - Font weights
- `TYPOGRAPHY.TIGHT`, `NORMAL`, `RELAXED` - Line heights

### Colors (60-30-10 Rule)
- `COLORS.NEUTRAL.*` - 60% neutrals (backgrounds, text)
- `COLORS.BRAND.*` - 30% brand colors (purple)
- `COLORS.ACCENT.*` - 10% accent (orange - CTA only)

### Icons & Touch Targets
- `ICON_SIZES.XS` through `ICON_SIZES['2XL']`
- `TOUCH_TARGETS.SMALL` through `TOUCH_TARGETS.XLARGE`

### Layout
- `BREAKPOINTS.*` - Responsive breakpoints
- `CONTAINER_WIDTHS.*` - Max container widths
- `VERTICAL_RHYTHM.*` - Section size patterns
- `OPTICAL_GUIDE.*` - Text width hierarchy

## Documentation

Detailed documentation, rules, and guidelines should be added to `uxDesignSystem.md`.
