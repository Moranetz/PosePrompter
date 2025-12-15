# AI Image Generation UX Design

## Overview
A modern, intuitive interface for generating AI images with multiple models, clear credit costs, and excellent user feedback.

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header: "AI Image Generator"                           │
│  Subtitle: "Transform your prompts into stunning images"│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STEP 1: Select AI Model                                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │ Flux │ │ SDXL │ │Nano  │ │DALL-E│                  │
│  │ Pro  │ │      │ │Banana│ │  3   │                  │
│  │⭐⭐⭐⭐⭐│ │⭐⭐⭐│ │⭐⭐⭐⭐│ │⭐⭐⭐⭐│                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STEP 2: Enter Your Prompt                             │
│  ┌───────────────────────────────────────────────────┐ │
│  │ [Text area with character count]                  │ │
│  │                                                    │ │
│  │                                                    │ │
│  └───────────────────────────────────────────────────┘ │
│  💡 Tip: Be specific for best results                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STEP 3: Advanced Options (Collapsible)                │
│  ▼ Size: [1024x1024 ▼]  Quality: [HD ▼]                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [✨ Generate Image]                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Generation Progress / Result                           │
│  [Loading animation or generated image]                  │
└─────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Model Selection Cards

**Design:**
- Card-based selection with hover effects
- Each card shows:
  - Model name and icon
  - Quality indicator (⭐ rating or badge)
  - "Recommended" badge for best model
  - Brief description on hover

**Visual States:**
- Default: Subtle border, transparent background
- Hover: Slight glow, border highlight
- Selected: Purple border, highlighted background
- Disabled: Grayed out if insufficient credits

**Example:**
```
┌─────────────────────┐
│  ⚡ Flux Pro         │
│  ⭐⭐⭐⭐⭐          │
│  Best Quality       │
│  [Selected ✓]       │
└─────────────────────┘
```

### 2. Prompt Input Area

**Features:**
- Large textarea (min 6 lines)
- Character counter (max 1000)
- Placeholder with example prompts
- Auto-save to localStorage
- "Use current prompt" button (if available from main app)
- Prompt suggestions/templates dropdown

**Visual:**
- Dark background with subtle border
- Focus state: Purple border glow
- Character count in bottom right
- Word count indicator

### 3. Advanced Options (Collapsible)

**Options:**
- **Size:** Dropdown (1024x1024, 1792x1024, 1024x1792)
- **Quality:** Toggle (Standard/HD) - only for DALL-E 3
- **Number of outputs:** 1-4 (for Flux/SDXL)
- **Seed:** Optional (for reproducibility)
- **Negative prompt:** Optional textarea

**UI:**
- Collapsible section with "Advanced Options ▼"
- Clean form layout
- Tooltips explaining each option
- Reset to defaults button

### 4. Generate Button

**Generate Button:**
- Large, prominent button
- Shows model name: "Generate with Nano Banana Pro"
- Disabled state if:
  - No prompt
  - Insufficient credits (error shown on click)
  - Already generating
- Loading state: Spinner + "Generating with [Model]..."

### 5. Generation Progress

**Loading State:**
```
┌────────────────────────────────────────┐
│  ⏳ Generating with Nano Banana Pro...  │
│                                         │
│  [Animated progress bar]                │
│                                         │
│  This usually takes 10-30 seconds      │
│  [Cancel]                               │
└────────────────────────────────────────┘
```

**Features:**
- Progress indicator (if API supports it)
- Estimated time remaining
- Cancel button
- Fun loading messages ("Adding magic...", "Almost there!")

### 6. Result Display

**Success State:**
```
┌────────────────────────────────────────┐
│  ✅ Image Generated!                    │
│                                         │
│  [Generated Image - Large Preview]     │
│                                         │
│  [Download] [Regenerate] [Share]        │
└────────────────────────────────────────┘
```

**Actions:**
- Download (high-res)
- Regenerate (same prompt, new variation)
- Share (copy link, social media)
- Save to gallery/history
- Use as new prompt reference

### 7. Generation History

**Sidebar or Tab:**
- Grid of previous generations
- Filter by model
- Search by prompt
- Quick regenerate from history
- Delete option

## User Flow

1. **Land on page** → See model selection
2. **Select model** → Model highlighted
3. **Enter prompt** → See character count
4. **Optional: Adjust settings** → Expand advanced options
5. **Click Generate** → See loading animation
6. **View result** → Download, regenerate, or share
7. **Continue** → Generate more or browse history

## Error States

### Insufficient Credits
```
┌────────────────────────────────────────┐
│  ⚠️ Insufficient Credits                │
│                                         │
│  You don't have enough credits for      │
│  this generation.                       │
│                                         │
│  [Buy More Credits]                     │
└────────────────────────────────────────┘
```

### Generation Failed
```
┌────────────────────────────────────────┐
│  ❌ Generation Failed                   │
│                                         │
│  The image couldn't be generated.      │
│  Your credits have been refunded.       │
│                                         │
│  [Try Again] [Contact Support]         │
└────────────────────────────────────────┘
```

### Rate Limit
```
┌────────────────────────────────────────┐
│  ⏱️ Too Many Requests                   │
│                                         │
│  Please wait 30 seconds before          │
│  generating another image.              │
│                                         │
│  [OK]                                   │
└────────────────────────────────────────┘
```

## Mobile Responsive

- Stack model cards vertically
- Full-width prompt input
- Collapsible advanced options
- Bottom-fixed generate button
- Swipeable image gallery

## Accessibility

- Keyboard navigation for all controls
- Screen reader labels
- High contrast mode support
- Focus indicators
- ARIA labels for buttons

## Animations & Micro-interactions

- Smooth card selection transitions
- Button hover effects
- Loading spinner with pulse
- Image fade-in on completion
- Success checkmark animation
- Credit counter animation when deducted

## Color Scheme

- **Primary:** Purple (#8b5cf6) - matches your theme
- **Success:** Green (#22c55e)
- **Warning:** Yellow (#eab308)
- **Error:** Red (#ef4444)
- **Info:** Blue (#3b82f6)
- **Background:** Dark with transparency
- **Text:** White with varying opacity

## Implementation Priority

### Phase 1 (MVP)
1. Model selection cards
2. Prompt input
3. Generate button with credit display
4. Basic result display

### Phase 2
1. Advanced options
2. Generation history
3. Better error handling
4. Loading animations

### Phase 3
1. Prompt suggestions
2. Image editing tools
3. Batch generation
4. Social sharing

