# Design System: PosePrompt Studio - Dress-Up Game Interface

## Design Philosophy

Transform the technical dashboard into a **fun, magical, and creative dress-up game experience**. The interface should feel light, airy, and inspiring—like a modern Barbie dress-up game for adults. The visual metaphor is a **photoshoot studio** or **artist's creative workspace**.

---

## 1. Color Palette & Visual Foundation

### Primary Background
- **Base**: Soft, warm white to cream gradient (`#fefefe` → `#f8f6f2`)
- **Studio Sweep Effect**: Subtle radial gradient from center, mimicking studio lighting
- **Accent Glow**: Very subtle warm tones (`#fff8e7` at edges) for depth

### Color System
- **Primary Accent**: Soft coral/peach (`#ff8a80` to `#ffab91`) - warm, inviting
- **Secondary Accent**: Soft lavender (`#b39ddb` to `#ce93d8`) - creative, magical
- **Success/Active**: Soft mint (`#80cbc4` to `#a5d6a7`) - fresh, positive
- **Text Primary**: Warm dark gray (`#3d3d3d` to `#2c2c2c`)
- **Text Secondary**: Medium gray (`#6b6b6b`)
- **Category Colors**: Maintain existing vibrant palette but soften with 20-30% opacity overlays

### Typography
- **Primary Font**: Modern, friendly sans-serif (Inter, Poppins, or system-ui)
- **Headings**: Medium weight (500-600), slightly rounded
- **Body**: Regular weight (400), comfortable line-height (1.6)
- **Word-Buttons**: Medium weight (500), clear and readable

---

## 2. Clickable Word-Buttons Design

### Style: Elegant Pills with Depth
- **Shape**: Rounded pill/oval buttons (`border-radius: 24px` minimum)
- **Size**: Comfortable touch targets (min 44px height, padding 12px 20px)
- **Base State**:
  - Soft fill color matching category (with 15-20% opacity)
  - Subtle shadow: `0 2px 8px rgba(0,0,0,0.08)`
  - Border: 1.5px solid category color at 30% opacity
  - Text: Category color (full opacity)
  - Smooth transition: `all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`

### Hover State
- **Lift Effect**: Transform `translateY(-2px)`, shadow increases to `0 4px 12px rgba(0,0,0,0.12)`
- **Glow**: Subtle glow ring using category color at 20% opacity
- **Scale**: Slight scale `1.02` for tactile feedback
- **Background**: Fill increases to 25% opacity

### Active/Selected State
- **Fill**: Category color at 40% opacity
- **Border**: 2px solid category color (full opacity)
- **Shadow**: Enhanced shadow with category color tint
- **Icon**: Optional checkmark or sparkle icon appears
- **Pulse Animation**: Gentle pulse glow (2s infinite)

### Disabled/Excluded State
- **Opacity**: 0.4
- **Grayscale filter**: 50%
- **No hover effects**

### Layout
- **Container**: Horizontal scrolling container with snap points
- **Spacing**: 12px gap between buttons
- **Grouping**: Visual grouping by category with subtle dividers or section headers

---

## 3. Layout Architecture

### Overall Structure: Studio Layout
```
┌─────────────────────────────────────────────────┐
│  Header: App Title + Studio Badge               │
├──────────────┬──────────────────────────────────┤
│              │                                   │
│  Category    │   Articulated Figure Preview     │
│  Sidebar     │   (Center Stage)                 │
│  (Left)      │                                   │
│              │                                   │
│  - Scrollable│   - Premium Frame/Canvas         │
│  - Collapsible│  - Soft Studio Lighting Effect  │
│  - Icon +    │  - Shimmer on Generate           │
│    Category  │                                   │
│    Names     │                                   │
│              │                                   │
├──────────────┴──────────────────────────────────┤
│  Word-Buttons: Horizontal Scroll (Category View) │
│  [Pose] [Style] [Angle] [Lighting] ...          │
└─────────────────────────────────────────────────┘
```

### Category Sidebar (Left)
- **Width**: 280px (collapsible to 60px icon-only)
- **Background**: Soft white with subtle texture
- **Sections**: Collapsible accordion for each category group
- **Active Indicator**: Left border accent (4px) in category color
- **Icons**: Playful, illustrative icons for each category
- **Scroll Behavior**: Smooth, with subtle fade at edges

### Main Content Area (Center)
- **Articulated Figure Preview**: 
  - Large, centered canvas area (min 600px width)
  - Premium frame effect: Soft inner shadow, subtle border
  - Background: Very subtle gradient sweep (studio lighting)
  - Figure: SVG-based articulated mannequin/figure
  - Updates dynamically as selections change
- **Action Buttons**: Floating at bottom-right (Generate, Copy, Randomize)

### Word-Buttons Bar (Bottom)
- **Position**: Fixed or sticky at bottom
- **Layout**: Horizontal scroll with snap points
- **Background**: Soft white with subtle top border
- **Category Filter**: Active category highlighted, others slightly faded

---

## 4. Articulated Figure Preview

### Visual Design
- **Style**: Clean, minimalist articulated figure (think fashion sketch or paper doll)
- **Base**: Neutral gray outline (`#d0d0d0`)
- **Articulation Points**: Subtle joints (shoulders, elbows, hips, knees)
- **Dynamic Updates**: 
  - Selected options visually apply to figure
  - Smooth transitions between states
  - Color overlays for outfits/styles
  - Pose changes reflect body positioning

### Frame/Canvas Treatment
- **Container**: 
  - Soft rounded corners (16px)
  - Inner shadow: `inset 0 2px 8px rgba(0,0,0,0.06)`
  - Outer glow: Very subtle category color glow when active
  - Background: Soft gradient (`#fafafa` → `#f5f5f5`)
- **Studio Lighting Effect**:
  - Radial gradient overlay (subtle)
  - Optional lens flare icon (very subtle, top-right)
  - Soft vignette at edges

### Loading/Generating State
- **Shimmer Animation**: 
  - Horizontal shimmer sweep across figure
  - Gradient: `rgba(255,255,255,0.3)` moving left to right
  - Duration: 2s, infinite loop
- **Pulse**: Gentle scale pulse (1.0 → 1.02) on figure
- **Text Overlay**: "Creating your perfect shot..." with soft fade

---

## 5. Micro-Interactions

### Button Clicks
- **Ripple Effect**: Subtle ripple from click point (category color, 0.3s)
- **Bounce**: Slight scale animation (`1.0` → `1.05` → `1.0`) on click
- **Sound**: Optional subtle click sound (if audio enabled)

### Selection Changes
- **Slide-In**: New selection slides in from right (0.3s ease-out)
- **Glow Pulse**: Selected button pulses with category color glow (2s)
- **Figure Update**: Smooth morph/transition on figure (0.5s ease-in-out)

### Category Navigation
- **Smooth Scroll**: Horizontal scroll with momentum and snap points
- **Fade In/Out**: Buttons fade in as they enter viewport
- **Active Indicator**: Smooth underline or highlight bar follows active category

### Randomize Action
- **Shuffle Animation**: Buttons briefly shuffle/shake (0.5s)
- **Confetti**: Optional subtle confetti particles on success
- **Figure Spin**: Figure does a gentle 360° rotation (0.8s)

### Copy to Clipboard
- **Checkmark Animation**: Checkmark icon animates in with scale + fade
- **Success Glow**: Button glows with success color (mint green)
- **Toast Notification**: Subtle toast appears: "Prompt copied!"

---

## 6. Component Specifications

### Category Sidebar Item
```css
- Padding: 16px 20px
- Border-radius: 12px
- Hover: Background lightens 5%
- Active: Left border 4px, background tint
- Icon: 24px, category color
- Text: 14px, medium weight
```

### Word-Button (Pill)
```css
- Height: 44px (min)
- Padding: 12px 24px
- Border-radius: 24px
- Font-size: 14px
- Font-weight: 500
- Gap between buttons: 12px
```

### Articulated Figure Container
```css
- Min-width: 600px
- Aspect-ratio: 3:4 (portrait)
- Border-radius: 16px
- Padding: 40px
- Background: Soft gradient
```

### Action Buttons (Generate, Copy, Randomize)
```css
- Size: 48px height
- Border-radius: 12px
- Padding: 14px 28px
- Font-weight: 600
- Shadow: 0 4px 12px rgba(0,0,0,0.1)
- Hover: Lift + glow
```

---

## 7. Responsive Behavior

### Desktop (1200px+)
- Full sidebar + figure preview + word-buttons bar
- All elements visible simultaneously

### Tablet (768px - 1199px)
- Collapsible sidebar (icon-only by default)
- Figure preview remains prominent
- Word-buttons bar scrollable

### Mobile (< 768px)
- Sidebar becomes bottom sheet/drawer
- Figure preview full-width, smaller
- Word-buttons bar: Vertical stack or compact horizontal scroll

---

## 8. Accessibility

- **Focus States**: Clear, visible focus rings (category color, 3px)
- **Keyboard Navigation**: Full keyboard support (arrow keys, tab, enter)
- **Screen Readers**: Proper ARIA labels, semantic HTML
- **Color Contrast**: WCAG AA compliant (4.5:1 minimum)
- **Touch Targets**: Minimum 44x44px for all interactive elements

---

## 9. Implementation Notes

### Technology Recommendations
- **Animations**: CSS transitions + Framer Motion or React Spring
- **Figure**: SVG-based with React components for dynamic updates
- **Icons**: Lucide React (already in use) or custom illustrated icons
- **Layout**: CSS Grid + Flexbox, or Tailwind CSS utility classes

### File Structure
```
/components
  /ArticulatedFigure
    - FigureCanvas.tsx
    - FigureParts.tsx
    - FigureStyles.ts
  /CategorySidebar
    - Sidebar.tsx
    - CategoryItem.tsx
  /WordButtons
    - WordButton.tsx
    - WordButtonBar.tsx
  /PreviewArea
    - PreviewCanvas.tsx
    - StudioFrame.tsx
  /MicroInteractions
    - RippleEffect.tsx
    - ShimmerEffect.tsx
    - ConfettiEffect.tsx
```

---

## 10. Visual Examples & References

### Mood Board Keywords
- Modern fashion design tools
- Paper doll games
- Creative studio apps (Procreate, Canva)
- Soft, pastel aesthetics
- Playful but professional

### Design Inspiration
- Clean, minimal interfaces with personality
- Delightful micro-interactions (Stripe, Linear)
- Fashion/beauty app interfaces
- Creative tool UIs (Figma, Adobe XD)

---

This design system transforms the technical interface into a **magical, creative playground** where users feel inspired and excited to experiment with their perfect photo prompt.

