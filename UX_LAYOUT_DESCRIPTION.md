# Pose Prompter - Complete UX Layout Description

## Overview
Pose Prompter is a web application for generating pose prompts with a studio-style layout. The interface uses a split-screen design with a preview area on the left and controls on the right.

---

## 1. Overall Layout Structure

### Page Hierarchy (Top to Bottom)
```
┌─────────────────────────────────────────────────────────┐
│ HEADER (Fixed at top, 56px height)                      │
├──────────────────┬──────────────────────────────────────┤
│                  │                                       │
│ PREVIEW AREA     │ OPTIONS PANEL                        │
│ (Left, 60% width)│ (Right, 40% width)                   │
│                  │ ┌─────────────────────────────────┐  │
│                  │ │ SIDEBAR (Scrollable)            │  │
│                  │ │ - Category Groups               │  │
│                  │ │ - Category Items                │  │
│                  │ └─────────────────────────────────┘  │
│                  │ ┌─────────────────────────────────┐  │
│                  │ │ FIXED CONTROLS (Never scrolls) │  │
│                  │ │ - Word Button Bar               │  │
│                  │ │ - Action Buttons                │  │
│                  │ └─────────────────────────────────┘  │
├──────────────────┴──────────────────────────────────────┤
│ FOOTER (Fixed at bottom, 64px height)                   │
└─────────────────────────────────────────────────────────┘
```

### Background & Color Scheme
- **Main Background**: Radial gradient from `#fefefe` at 30% to `#f8f6f2` at 100%
- **Text Color**: `#2c2c2c` (dark gray) for primary text, `#6b6b6b` for secondary
- **Accent Colors**: Each category has its own color (purple, blue, green, etc.)
- **Borders**: Subtle `rgba(0,0,0,0.08)` borders throughout

---

## 2. HEADER Component

### Location
- **Position**: Fixed at the very top of the page
- **Height**: 56px (48px on mobile)
- **Width**: 100% of viewport
- **Z-index**: 100 (stays above other content)

### Visual Design
- **Background**: Linear gradient from `#fefefe` to `#f8f6f2`
- **Border**: 1px solid `rgba(0,0,0,0.08)` at bottom
- **Shadow**: `0 2px 8px rgba(0,0,0,0.04)`
- **Padding**: 0 16px horizontally

### Contents (Left to Right)

#### Left Side:
1. **App Title** - "Pose Prompter"
   - **Font**: Bold (700), `clamp(16px, 4vw, 20px)`
   - **Color**: `#2c2c2c`
   - **Letter Spacing**: -0.5px
   - **Action**: None (non-clickable, decorative)

2. **Studio Badge** (Desktop only, hidden on mobile)
   - **Text**: "STUDIO"
   - **Background**: Purple gradient (`#a855f7` to `#8b5cf6`)
   - **Color**: White
   - **Size**: 10px font, uppercase, 3px vertical padding, 10px horizontal padding
   - **Border Radius**: 10px
   - **Action**: None (non-clickable, decorative)

#### Center:
- **Empty** - Reserved for future navigation (currently no nav links)

#### Right Side:
3. **Hamburger Menu Button** (Mobile only, hidden on desktop)
   - **Icon**: Menu icon (hamburger) or X icon when open
   - **Size**: 24px icon
   - **Color**: `#2c2c2c`
   - **Background**: Transparent, becomes `rgba(0,0,0,0.05)` on hover
   - **Size**: Minimum 44x44px touch target
   - **Border Radius**: 8px
   - **Action**: 
     - **DOES**: Opens/closes mobile menu overlay
     - **DOES NOT**: Navigate anywhere, perform any other action

### Mobile Menu Overlay (When Hamburger is Clicked)
- **Position**: Fixed overlay covering entire screen below header
- **Background**: `rgba(0,0,0,0.5)` backdrop
- **Menu Panel**: 
  - **Width**: 80% of screen, max 300px
  - **Height**: 100%
  - **Position**: Slides in from left
  - **Background**: Same gradient as header
  - **Content**: Currently empty (placeholder for future nav items)
  - **Action**: Clicking outside closes the menu

---

## 3. PREVIEW AREA (Left Side)

### Location
- **Position**: Left side of workspace
- **Width**: 60% of workspace (100% on tablet/mobile)
- **Height**: `calc(100vh - 56px - 64px)` (full height minus header/footer)
- **Max Width**: 1200px
- **Padding**: 16px
- **Sticky**: Yes (stays in place when scrolling)

### Visual Design
- **Background**: `linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)`
- **Border**: 1px solid `rgba(0,0,0,0.05)`
- **Border Radius**: `clamp(8px, 2vw, 16px)`
- **Shadow**: Inset shadow `0 2px 8px rgba(0,0,0,0.06)` + outer shadow `0 4px 20px rgba(0,0,0,0.08)`
- **Aspect Ratio**: 3:4 (portrait orientation)
- **Display**: Flexbox, centered content

### Contents

#### StudioFrame Component
The preview area contains a **StudioFrame** component that displays:

1. **Studio Lighting Effect** (Decorative overlay)
   - **Position**: Absolute, covers entire frame
   - **Effect**: Radial gradient creating soft lighting from top
   - **Action**: None (purely visual)

2. **Vignette Effect** (Decorative overlay)
   - **Position**: Absolute, covers entire frame
   - **Effect**: Subtle darkening at edges
   - **Action**: None (purely visual)

3. **Lens Flare Icon** (Decorative, top-right)
   - **Position**: Absolute, 20px from top and right
   - **Size**: 30x30px circle
   - **Opacity**: 0.15
   - **Action**: None (purely visual)

4. **Shimmer Effect** (Only when generating)
   - **Position**: Absolute, animates across frame
   - **Animation**: Slides left to right continuously
   - **Trigger**: Only visible when `isGenerating` is true
   - **Action**: None (visual feedback only)

5. **Figure Canvas** (Main content)
   - **Component**: `FigureCanvas` - displays the articulated figure
   - **Position**: Centered within frame
   - **Updates**: Dynamically updates based on selected options
   - **Animation**: Pulses gently when generating
   - **Action**: None (display only, not interactive)

6. **Generating Text Overlay** (Only when generating)
   - **Position**: Absolute, bottom center (30px from bottom)
   - **Text**: "Creating your perfect shot..."
   - **Background**: `rgba(255,255,255,0.9)`
   - **Padding**: 12px 24px
   - **Border Radius**: 24px
   - **Shadow**: `0 4px 12px rgba(0,0,0,0.1)`
   - **Animation**: Fades in/out continuously
   - **Action**: None (informational only)

### Responsive Behavior
- **Desktop**: 60% width, full height
- **Tablet (≤1024px)**: 100% width, 50vh height
- **Mobile (≤768px)**: 100% width, 40vh height
- **Small Mobile (≤480px)**: 100% width, 35vh height

---

## 4. OPTIONS PANEL (Right Side)

### Location
- **Position**: Right side of workspace
- **Width**: 40% of workspace (100% on tablet/mobile)
- **Height**: Full height minus header/footer
- **Padding**: 16px
- **Layout**: Flex column with two sections

### Structure
The options panel is divided into TWO sections:

#### A. Scrollable Sidebar Area (Top Section)
- **Flex**: Takes up available space (`flex: 1`)
- **Overflow**: Vertical scroll only (`overflow-y: auto`)
- **Purpose**: Contains category groups and items

#### B. Fixed Controls Area (Bottom Section)
- **Flex**: Fixed size (`flex-shrink: 0`)
- **Overflow**: None (never scrolls)
- **Gap**: 16px between child elements
- **Purpose**: Contains word buttons and action buttons

---

## 5. SIDEBAR Component (Scrollable Section)

### Location
- **Position**: Top section of options panel
- **Width**: 260px (fixed)
- **Background**: Linear gradient `#fefefe` to `#f8f6f2`
- **Border**: 1px solid `rgba(0,0,0,0.08)`
- **Border Radius**: 12px
- **Shadow**: `0 2px 8px rgba(0,0,0,0.05)`
- **Padding**: 12px 10px

### Structure

#### Header Section (Top, Fixed)
- **Title**: "Pose Prompter"
  - **Font**: 16px, weight 600, color `#2c2c2c`
  - **Action**: None (non-clickable)
- **Subtitle**: "Your creative workspace"
  - **Font**: 11px, italic, color `#6b6b6b`
  - **Action**: None (non-clickable)
- **Border**: Bottom border separating from content

#### Category Groups Section (Scrollable)
Contains multiple **Category Groups**, each with:

##### Group Header Button
- **Appearance**: 
  - **Background**: Transparent (becomes `rgba(0,0,0,0.03)` on hover)
  - **Padding**: 8px 6px
  - **Border Radius**: 6px
  - **Display**: Flex, space-between
- **Left Side**:
  - **Title**: Group name (12px, weight 600, color `#2c2c2c`)
  - **Description**: Group description (10px, italic, color `#6b6b6b`)
- **Right Side**:
  - **Expand/Collapse Icon**: ▼ (expanded) or ▶ (collapsed)
  - **Color**: `#6b6b6b`
  - **Size**: 12px
- **Action**:
  - **DOES**: Expands/collapses the group to show/hide categories
  - **DOES NOT**: Select categories, perform any other action

##### Category Items (Shown when group is expanded)
Each category group contains multiple **CategoryItem** components:

###### CategoryItem Structure
Each item displays:

1. **Category Color Indicator** (Leftmost)
   - **Size**: 12x12px circle
   - **Color**: Category-specific color
   - **Opacity**: 1.0 if included, 0.4 if excluded
   - **Action**: None (visual indicator only)

2. **Category Name** (Center)
   - **Font**: 13px, weight 500
   - **Color**: `#2c2c2c` if active, `#3d3d3d` if inactive
   - **Opacity**: 1.0 if included, 0.5 if excluded
   - **Action**: 
     - **DOES**: Clicking selects this category (makes it active)
     - **DOES NOT**: Change the selected option, toggle lock/include

3. **Option Counter** (Right side)
   - **Text**: Format "X/Y" (e.g., "3/15")
   - **Font**: 11px, weight 500, color `#6b6b6b`
   - **Opacity**: 1.0 if included, 0.4 if excluded
   - **Action**: None (informational only)

4. **Include/Exclude Toggle Button** (Eye icon)
   - **Icon**: Eye (included) or EyeOff (excluded)
   - **Size**: 18px
   - **Color**: Category color if included, `#9ca3af` if excluded
   - **Background**: Transparent, becomes `${categoryColor}15` on hover
   - **Padding**: 4px
   - **Border Radius**: 4px
   - **Action**:
     - **DOES**: Toggles whether this category is included in the prompt
     - **DOES NOT**: Select the category, change the option, lock/unlock

5. **Lock/Unlock Toggle Button** (Lock icon)
   - **Icon**: Lock (locked) or Unlock (unlocked)
   - **Size**: 18px
   - **Color**: `#fbbf24` (yellow) if locked, `#9ca3af` if unlocked
   - **Background**: Transparent, becomes yellow tint on hover if locked
   - **Padding**: 4px
   - **Border Radius**: 4px
   - **Tooltip**: "Lock (won't randomize)" or "Unlock (will randomize)"
   - **Action**:
     - **DOES**: Toggles whether this category is locked (won't randomize)
     - **DOES NOT**: Select the category, change the option, include/exclude

6. **Manage Button** (Settings icon) - **ONLY VISIBLE WHEN LOGGED IN**
   - **Icon**: Settings gear
   - **Size**: 18px
   - **Color**: Category color if menu open, `#9ca3af` if closed
   - **Background**: Transparent, becomes `${categoryColor}15` on hover
   - **Padding**: 4px
   - **Border Radius**: 4px
   - **Action**:
     - **DOES**: Opens/closes a dropdown menu for managing category options
     - **DOES NOT**: Directly perform any action (opens menu only)

###### Manage Dropdown Menu (Appears when Settings icon clicked)
- **Position**: Absolute, below the Settings button, aligned to right
- **Background**: White
- **Border**: 1px solid `rgba(0,0,0,0.1)`
- **Border Radius**: 8px
- **Shadow**: `0 4px 12px rgba(0,0,0,0.15)`
- **Min Width**: 180px
- **Z-index**: 1000

**Menu Items** (in order):

1. **"Hide Selected Option"** Button
   - **Style**: Full width, 10px 14px padding, left-aligned text
   - **Font**: 13px, color `#2c2c2c`
   - **Background**: Transparent, becomes `rgba(0,0,0,0.05)` on hover
   - **Action**:
     - **DOES**: Hides the currently selected option for this category
     - **DOES NOT**: Delete the option permanently, affect other categories

2. **"Show Hidden Options"** Button
   - **Style**: Same as above
   - **Action**:
     - **DOES**: Opens a modal/dialog to show and restore hidden options
     - **DOES NOT**: Automatically restore options, affect other categories

3. **"Add Custom Option"** Button
   - **Style**: Same as above
   - **Action**:
     - **DOES**: Opens a dialog/form to add a new custom option to this category
     - **DOES NOT**: Add options to other categories, modify existing options

4. **Divider** (Visual separator)
   - **Height**: 1px
   - **Background**: `rgba(0,0,0,0.1)`
   - **Margin**: 4px vertical
   - **Action**: None (visual only)

5. **"Reset to Defaults"** Button
   - **Style**: Same as above, but color is `#ef4444` (red)
   - **Background**: Transparent, becomes `rgba(239, 68, 68, 0.1)` on hover
   - **Action**:
     - **DOES**: Resets this category to its default options (removes customizations)
     - **DOES NOT**: Delete user data, affect other categories, require confirmation (currently)

### Visual States

#### Active Category
- **Background**: `${categoryColor}10` (10% opacity of category color)
- **Left Border**: 3px solid category color
- **Text**: Darker (`#2c2c2c`)

#### Inactive Category
- **Background**: Transparent (becomes `${categoryColor}08` on hover)
- **Left Border**: 3px transparent
- **Text**: Lighter (`#3d3d3d`)

#### Excluded Category
- **Opacity**: Reduced to 0.5 for text, 0.4 for indicators
- **Visual**: Appears grayed out

---

## 6. WORD BUTTON BAR (Fixed Controls Section)

### Location
- **Position**: Top of fixed controls area (below scrollable sidebar)
- **Visibility**: Only shown when a category is selected AND has options
- **Width**: 100% of options panel width
- **Padding**: 12px 16px

### Visual Design
- **Background**: Linear gradient `#fefefe` to `rgba(254,254,254,0.95)`
- **Border**: 1px solid `rgba(0,0,0,0.08)`
- **Border Radius**: 10px
- **Shadow**: `0 2px 8px rgba(0,0,0,0.05)`
- **Max Width**: 1400px (centered)

### Structure

#### Category Label (Top)
- **Text**: Category display name (e.g., "Pose", "Style", "Angle")
- **Font**: 11px, weight 600, uppercase
- **Color**: Category color
- **Letter Spacing**: 0.5px
- **Opacity**: 1.0 if included, 0.4 if excluded
- **Action**: None (informational only)

#### Scrollable Button Container (Below label)
- **Layout**: Horizontal scroll
- **Gap**: 12px between buttons
- **Scroll Behavior**: Smooth scrolling, snap points enabled
- **Scrollbar**: Thin, colored with category color at 40% opacity
- **Padding**: 4px bottom (for scrollbar)

### Word Buttons (Individual Buttons)

Each button represents one option in the selected category:

#### Visual Design
- **Min Height**: 44px
- **Padding**: 12px 24px
- **Border Radius**: 24px (pill shape)
- **Font**: 14px, weight 500
- **Text Color**: Category color
- **White Space**: `nowrap` (text doesn't wrap)

#### States

##### Default (Unselected)
- **Border**: 1.5px solid `${categoryColor}40` (40% opacity)
- **Background**: `${categoryColor}15` (15% opacity)
- **Shadow**: `0 2px 8px rgba(0,0,0,0.08)`
- **Opacity**: 1.0 if included, 0.4 if excluded
- **Filter**: None if included, `grayscale(50%)` if excluded

##### Selected
- **Border**: 2px solid category color (full opacity)
- **Background**: `${categoryColor}40` (40% opacity)
- **Shadow**: `0 4px 12px ${categoryColor}30` + `0 2px 8px rgba(0,0,0,0.08)`
- **Animation**: Pulse glow effect (2s infinite)
- **Checkmark**: Animated checkmark icon appears on left

##### Hover (Not disabled)
- **Transform**: `translateY(-2px) scale(1.02)` (lifts up)
- **Shadow**: Enhanced shadow with glow ring
- **Background**: Increases opacity slightly

##### Disabled (Category excluded)
- **Opacity**: 0.4
- **Filter**: `grayscale(50%)`
- **Cursor**: `not-allowed`
- **Hover**: No effect

#### Button Contents (Left to Right)

1. **Ripple Effect** (On click)
   - **Appearance**: Animated circle expanding from click point
   - **Color**: Category color
   - **Duration**: 300ms
   - **Action**: Visual feedback only

2. **Checkmark Icon** (Only when selected)
   - **Icon**: Check mark from Lucide React
   - **Size**: 16px
   - **Animation**: Scales and rotates in on selection
   - **Color**: Category color
   - **Action**: None (visual indicator only)

3. **Button Text**
   - **Content**: Option name (truncated if > 30 characters)
   - **Action**: None (text only)

4. **Package Badge** (Only if option comes from a package)
   - **Text**: First 8 characters of package name
   - **Font**: 10px, weight 600, uppercase
   - **Padding**: 2px 6px
   - **Background**: `rgba(139, 92, 246, 0.2)`
   - **Border**: 1px solid `rgba(139, 92, 246, 0.4)`
   - **Color**: `#a78bfa`
   - **Border Radius**: 4px
   - **Tooltip**: Full package name on hover
   - **Action**: None (informational only)

#### Button Actions
- **DOES**: 
  - Selects this option for the active category
  - Updates the preview figure
  - Scrolls button into view if needed
  - Shows ripple animation on click
- **DOES NOT**: 
  - Change the active category
  - Lock/unlock categories
  - Include/exclude categories
  - Perform any other action

---

## 7. ACTION BUTTONS (Fixed Controls Section)

### Location
- **Position**: Bottom of fixed controls area (below word button bar)
- **Layout**: Flex row, wraps on smaller screens
- **Gap**: `clamp(8px, 2vw, 12px)` between buttons
- **Width**: 100% of options panel

### Button List (Left to Right)

#### 1. Randomize Button
- **Icon**: RotateCcw (counter-clockwise arrow)
- **Text**: "Randomize"
- **Background**: Linear gradient `#ff8a80` to `#ffab91` (orange/red)
- **Color**: White
- **Size**: `clamp(44px, 5vw, 40px)` height, min 44px
- **Padding**: 10px 20px
- **Font**: 13px, weight 600
- **Border Radius**: 12px
- **Shadow**: `0 4px 12px rgba(255, 138, 128, 0.3)`
- **Hover**: Lifts up 2px, shadow increases
- **Action**:
  - **DOES**: Randomizes all unlocked categories to new random options
  - **DOES NOT**: Randomize locked categories, change active category, save anything

#### 2. Copy Prompt Button
- **Icon**: Copy
- **Text**: "Copy Prompt" (changes to "Copied!" after click)
- **Background**: 
  - Default: Linear gradient `#b39ddb` to `#ce93d8` (purple)
  - After copy: Linear gradient `#80cbc4` to `#a5d6a7` (teal/green)
- **Color**: White
- **Size**: Same as Randomize button
- **Padding**: Same as Randomize button
- **Font**: Same as Randomize button
- **Border Radius**: Same as Randomize button
- **Shadow**: 
  - Default: `0 4px 12px rgba(179, 157, 219, 0.3)`
  - After copy: `0 4px 12px rgba(128, 203, 196, 0.3)`
- **Animation**: Success pulse animation when copied
- **Hover**: Only works if not in "Copied" state
- **Action**:
  - **DOES**: Copies the complete prompt text to clipboard
  - **DOES NOT**: Save the prompt, open any dialog, change any selections

#### 3. Save Current Setup Button (ONLY VISIBLE WHEN LOGGED IN)
- **Icon**: Save
- **Text**: "Save Current Setup"
- **Background**: Linear gradient `#10b981` to `#22c55e` (green)
- **Color**: White
- **Size**: Same as other buttons
- **Padding**: Same as other buttons
- **Font**: Same as other buttons
- **Border Radius**: Same as other buttons
- **Shadow**: `0 4px 12px rgba(16, 185, 129, 0.3)`
- **Hover**: Lifts up 2px, shadow increases
- **Action**:
  - **DOES**: Opens a modal dialog to save the current configuration
  - **DOES NOT**: Save automatically (requires user input in modal), change any selections

#### 4. My Saved Sets Button (ONLY VISIBLE WHEN LOGGED IN)
- **Icon**: FolderOpen
- **Text**: "My Saved Sets"
- **Background**: Linear gradient `#8b5cf6` to `#a78bfa` (purple)
- **Color**: White
- **Size**: Same as other buttons
- **Padding**: Same as other buttons
- **Font**: Same as other buttons
- **Border Radius**: Same as other buttons
- **Shadow**: `0 4px 12px rgba(139, 92, 246, 0.3)`
- **Hover**: Lifts up 2px, shadow increases
- **Action**:
  - **DOES**: Opens a sidebar/modal showing all saved prompt sets
  - **DOES NOT**: Load a set automatically, delete sets directly

#### 5. Installed Packages Button (ONLY VISIBLE WHEN LOGGED IN)
- **Icon**: Package
- **Text**: "Installed Packages"
- **Background**: Linear gradient `#f59e0b` to `#fbbf24` (amber/yellow)
- **Color**: White
- **Size**: Same as other buttons
- **Padding**: Same as other buttons
- **Font**: Same as other buttons
- **Border Radius**: Same as other buttons
- **Shadow**: `0 4px 12px rgba(245, 158, 11, 0.3)`
- **Hover**: Lifts up 2px, shadow increases
- **Action**:
  - **DOES**: Opens a modal showing all installed packages with uninstall options
  - **DOES NOT**: Install packages, browse marketplace

### Button Behavior Notes
- All buttons have consistent hover effects (lift up 2px, enhanced shadow)
- Buttons wrap to new lines on smaller screens
- Minimum touch target size: 44x44px (accessibility requirement)
- All buttons use smooth transitions (0.3s ease)

---

## 8. FOOTER Component

### Location
- **Position**: Fixed at bottom of page
- **Height**: 64px
- **Width**: 100% of viewport
- **Z-index**: 100 (stays above other content)

### Visual Design
- **Background**: Linear gradient `#fefefe` to `#f8f6f2` (same as header)
- **Border**: 1px solid `rgba(0,0,0,0.08)` at top
- **Shadow**: `0 -2px 8px rgba(0,0,0,0.04)` (shadow above)
- **Padding**: 12px 16px
- **Display**: Flex, centered content

### Contents
- **Text**: "Your creative workspace for generating perfect pose prompts"
- **Font**: 11px
- **Color**: `#6b6b6b`
- **Alignment**: Center
- **Action**: None (non-interactive, informational only)

---

## 9. Responsive Behavior

### Desktop (> 1024px)
- **Layout**: Side-by-side (60% preview, 40% options)
- **Header**: Full navigation visible
- **Sidebar**: Full width (260px)
- **Buttons**: Horizontal layout, no wrapping
- **Footer**: Always visible

### Tablet (768px - 1024px)
- **Layout**: Stacked vertically (preview on top, options below)
- **Preview**: 100% width, 50vh height
- **Options**: 100% width, 50vh height
- **Sidebar**: Full width
- **Buttons**: May wrap to multiple rows

### Mobile (≤ 768px)
- **Layout**: Stacked vertically
- **Header**: Hamburger menu visible, nav hidden
- **Preview**: 100% width, 40vh height
- **Options**: 100% width, 60vh height
- **Sidebar**: 100% width (no fixed 260px)
- **Buttons**: Wrap to multiple rows
- **Touch Targets**: Minimum 44x44px

### Small Mobile (≤ 480px)
- **Preview**: 35vh height
- **Options**: 65vh height
- **Padding**: Reduced to 4px
- **Gaps**: Reduced to 8px

---

## 10. Modal Dialogs & Overlays

### Save Current Setup Modal
- **Trigger**: "Save Current Setup" button
- **Purpose**: Save current prompt configuration
- **Fields**: Name, description, tags, public/private toggle
- **Actions**: Save, Cancel

### My Saved Sets Sidebar/Modal
- **Trigger**: "My Saved Sets" button
- **Purpose**: View and manage saved prompt sets
- **Actions**: Load set, delete set, view details

### Installed Packages Modal
- **Trigger**: "Installed Packages" button
- **Purpose**: View and manage installed packages
- **Actions**: Uninstall package, view package details

### Manage Options Dropdown
- **Trigger**: Settings icon on category item
- **Purpose**: Manage category-specific options
- **Actions**: Hide option, show hidden, add custom, reset defaults

### Show Hidden Options Modal
- **Trigger**: "Show Hidden Options" in manage dropdown
- **Purpose**: View and restore hidden options
- **Actions**: Restore option, permanently delete

### Add Custom Option Modal
- **Trigger**: "Add Custom Option" in manage dropdown
- **Purpose**: Add new custom option to category
- **Fields**: Option name/text
- **Actions**: Add, Cancel

---

## 11. Visual Feedback & Animations

### Loading States
- **Generating**: Shimmer effect on preview, pulse animation, "Creating..." text
- **Saving**: Button shows loading spinner (if implemented)
- **Loading Data**: Skeleton loaders or spinners

### Success States
- **Copy Prompt**: Button changes to "Copied!" with green gradient
- **Save Success**: Toast notification (if implemented)
- **Checkmark Animation**: On word button selection

### Hover States
- **Buttons**: Lift up 2px, enhanced shadow
- **Category Items**: Background color change
- **Word Buttons**: Scale up slightly, glow effect

### Active/Selected States
- **Active Category**: Colored left border, tinted background
- **Selected Word Button**: Checkmark, colored border, pulse glow
- **Locked Category**: Yellow lock icon

### Disabled States
- **Excluded Categories**: Reduced opacity, grayscale filter
- **Disabled Buttons**: Reduced opacity, not-allowed cursor

---

## 12. Keyboard Navigation

### Tab Navigation
- **Order**: Header → Sidebar categories → Word buttons → Action buttons
- **Focus**: Visible focus rings (category color, 3px)
- **Skip**: No skip links currently implemented

### Keyboard Shortcuts
- **Not Currently Implemented**: No keyboard shortcuts documented

---

## 13. Accessibility Features

### ARIA Labels
- All interactive buttons have `aria-label` attributes
- Tooltips provide additional context
- Screen reader friendly

### Color Contrast
- Text meets WCAG AA standards (4.5:1 minimum)
- Category colors are distinguishable
- Disabled states are clearly indicated

### Touch Targets
- All buttons minimum 44x44px (mobile accessibility standard)
- Adequate spacing between interactive elements

### Focus Management
- Focus rings visible on keyboard navigation
- Modal dialogs trap focus
- Focus returns to trigger after modal close

---

## 14. Data Flow & State Management

### Category Selection Flow
1. User clicks category in sidebar → `onCategorySelect` called
2. Active category updates → Word button bar updates
3. Preview figure updates → Shows current selections

### Option Selection Flow
1. User clicks word button → `onSelect(index)` called
2. Selection updates for active category → Counter updates
3. Preview figure updates → Reflects new option

### Randomize Flow
1. User clicks "Randomize" → `randomizeAll` called
2. All unlocked categories get random options → Selections update
3. Preview figure updates → Shows new random configuration
4. Word button bar scrolls to show selected buttons

### Lock/Include Flow
1. User clicks lock/include icon → Toggle function called
2. State updates → Visual indicators update
3. Randomize respects locked state → Excluded categories ignored in prompt

---

## 15. Important Notes

### What Buttons DO NOT Do
- **Category Items**: Do NOT change the selected option when clicked (only select category)
- **Word Buttons**: Do NOT change the active category
- **Randomize**: Does NOT randomize locked categories
- **Copy Prompt**: Does NOT save the prompt anywhere
- **Save Button**: Does NOT save automatically (opens modal)
- **Manage Menu**: Does NOT perform actions directly (opens dropdown)

### Conditional Visibility
- **Manage Button**: Only visible when user is logged in
- **Save/My Sets/Installed Packages**: Only visible when logged in
- **Word Button Bar**: Only visible when category selected AND has options
- **Mobile Menu**: Only visible on mobile devices

### State Dependencies
- Active category must be selected to show word buttons
- Category must have options to show word button bar
- User must be logged in to see user-specific buttons
- Locked categories are excluded from randomization
- Excluded categories are excluded from prompt generation

---

## 16. Color System

### Category Colors
Each category has a unique color assigned:
- Used for: Category indicators, borders, buttons, highlights
- Examples: Purple (`#b39ddb`), Blue, Green, Orange, etc.
- Opacity variations: 10%, 15%, 20%, 25%, 30%, 40% for backgrounds

### Status Colors
- **Locked**: Yellow (`#fbbf24`)
- **Success**: Green (`#10b981`, `#22c55e`)
- **Warning**: Amber (`#f59e0b`, `#fbbf24`)
- **Error**: Red (`#ef4444`)
- **Info**: Purple (`#8b5cf6`)

### Neutral Colors
- **Text Primary**: `#2c2c2c`
- **Text Secondary**: `#6b6b6b`
- **Text Tertiary**: `#9ca3af`
- **Background**: `#fefefe`, `#f8f6f2`
- **Borders**: `rgba(0,0,0,0.08)`

---

This completes the comprehensive UX layout description for Pose Prompter. Every button, component, and interaction has been documented with its location, appearance, and behavior.









