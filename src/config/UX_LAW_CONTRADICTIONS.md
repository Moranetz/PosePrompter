# UX Law Contradictions & Tensions

This document identifies potential contradictions and tensions between different UX laws, and provides guidance on how to resolve them.

## Major Tensions

### 1. **Hick's Law vs. Miller's Law**
**The Conflict:**
- **Hick's Law**: Reduce choices to speed up decision-making
- **Miller's Law**: Chunk information into 7±2 items

**The Tension:**
- If you have 20 options, Miller's Law says group into 3 chunks of ~7 items
- But Hick's Law says fewer choices = faster decisions
- Should you show 3 groups (slower) or reduce to 5 total options (faster)?

**Application:**
- Use **progressive disclosure**: Show 3-5 primary options initially (Hick's Law)
- Group remaining options into categories of 7±2 items (Miller's Law)
- Allow users to expand categories when needed
- **Example**: Navigation menu with 5 main items, each expanding to show 7 sub-items

**Current Implementation:**
```javascript
CHUNK_LIMITS.NAVIGATION_MAX: 7  // Miller's Law
// But also apply Hick's Law: show only 3-5 top-level nav items
```

---

### 2. **Von Restorff Effect vs. Law of Similarity**
**The Conflict:**
- **Von Restorff Effect**: Make important things stand out (different styling)
- **Law of Similarity**: Keep similar things styled consistently

**The Tension:**
- CTA button should stand out (Von Restorff)
- But all buttons should look similar (Law of Similarity)
- How do you make the CTA different without breaking consistency?

**Application:**
- Use **hierarchical consistency**: All buttons share base styling (Similarity)
- CTA uses accent color (10% rule) to stand out (Von Restorff)
- Maintain same shape, size, padding - only color differs
- **Example**: All buttons have same padding/border-radius, but CTA is orange

**Current Implementation:**
```javascript
COLORS.ACCENT.CTA: '#f59e0b'  // Only for CTAs (Von Restorff)
// But all buttons use same TOUCH_TARGETS and PATTERNS (Similarity)
```

---

### 3. **Law of Prägnanz vs. Information Needs**
**The Conflict:**
- **Law of Prägnanz**: Keep things simple, minimal
- **User Needs**: Users need enough information to make decisions

**The Tension:**
- Simple design might hide important information
- Too much information breaks simplicity
- Where's the balance?

**Application:**
- Use **progressive disclosure**: Show essential info first (Prägnanz)
- Provide "Learn more" or tooltips for details
- Use visual hierarchy to guide attention
- **Example**: Form shows 3 fields initially, "Advanced options" expands to show 7 more

**Current Implementation:**
```javascript
CHUNK_LIMITS.FORM_FIELDS_PER_STEP: 7  // Show 7 max, then multi-step
// Simple first, details on demand
```

---

### 4. **Fitts's Law vs. Space Constraints**
**The Conflict:**
- **Fitts's Law**: Make touch targets large (44px minimum)
- **Screen Space**: Limited real estate, especially mobile

**The Tension:**
- Large buttons take up valuable screen space
- Small buttons are harder to tap
- How do you fit everything?

**Application:**
- Use **priority-based sizing**: Primary actions = large (44-48px)
- Secondary actions = medium (36-44px)
- Tertiary actions = small (24-36px) or hidden in menu
- Use thumb zones to place important actions in easy-to-reach areas
- **Example**: Primary CTA is 48px, secondary buttons are 36px, settings icon is 24px

**Current Implementation:**
```javascript
TOUCH_TARGETS.MEDIUM: 44  // Primary actions
TOUCH_TARGETS.SMALL: 36   // Secondary actions
// But also use THUMB_ZONES for placement
```

---

### 5. **Zeigarnik Effect vs. Completion Satisfaction**
**The Conflict:**
- **Zeigarnik Effect**: Incomplete tasks create tension (keep progress visible)
- **Completion Satisfaction**: Users want to feel accomplished

**The Tension:**
- Show too much incomplete progress = anxiety
- Show too little = no motivation
- How do you balance tension with satisfaction?

**Application:**
- Use **layered progress**: Show multiple progress loops simultaneously
- Celebrate completions immediately (satisfaction)
- Immediately show next goal (maintain tension)
- Use 80-95% range for maximum motivation (almost there!)
- **Example**: Complete daily goal → celebrate → show weekly progress (67% complete)

**Current Implementation:**
```javascript
PROGRESS_LAYERS = {
  daily: { urgency: 'HIGH' },    // Immediate tension
  weekly: { urgency: 'MEDIUM' },  // Medium-term
  lifetime: { urgency: 'BACKGROUND' } // Long-term satisfaction
}
```

---

### 6. **Doherty Threshold vs. Processing Time**
**The Conflict:**
- **Doherty Threshold**: Response should be <400ms for "addictive" feel
- **Reality**: Some operations take longer (API calls, image processing)

**The Tension:**
- Can't make everything instant
- But slow responses feel broken
- How do you handle unavoidable delays?

**Application:**
- Use **perceived performance**: Show feedback immediately (<100ms)
- Use optimistic UI: Update UI before server confirms
- Show progress indicators for operations >400ms
- Use skeleton screens instead of spinners
- **Example**: Button press → immediate visual feedback → show progress bar if >400ms

**Current Implementation:**
```javascript
RESPONSE_TIMES.FAST: 100      // Immediate feedback
RESPONSE_TIMES.IDEAL: 400     // Maximum for addictive feel
RESPONSE_TIMES.ACCEPTABLE: 1000  // Show loading state
```

---

### 7. **Law of Proximity vs. Visual Hierarchy**
**The Conflict:**
- **Law of Proximity**: Related items should be close together
- **Visual Hierarchy**: Important items need space to stand out

**The Tension:**
- Grouping related items tightly might make hierarchy unclear
- Spacing for hierarchy might break grouping
- How do you balance both?

**Application:**
- Use **nested spacing**: Tight spacing within groups (4-8px)
- Larger spacing between groups (24-32px)
- Use visual weight (size, color) for hierarchy, not just spacing
- **Example**: Form fields grouped with 8px gap, but sections separated by 32px

**Current Implementation:**
```javascript
SPACING.SM: '8px'   // Within-group (Proximity)
SPACING.XL: '24px'  // Between-group (Hierarchy)
```

---

## Minor Tensions

### 8. **Serial Position Effect vs. Equal Importance**
**The Conflict:**
- **Serial Position Effect**: First and last items are remembered best
- **Equal Importance**: All items should be treated equally

**Resolution:**
- Place most important items first or last
- Use visual emphasis for items in the middle that are important
- Rotate featured content to give all items time in prime positions

---

### 9. **Tesler's Law vs. Simplicity**
**The Conflict:**
- **Tesler's Law**: Complexity is conserved (must go somewhere)
- **Law of Prägnanz**: Keep things simple

**Resolution:**
- Hide complexity in advanced settings
- Use smart defaults to reduce user decisions
- Progressive disclosure: simple first, complex on demand

---

## How to Resolve Contradictions

### 1. **Context Determines Priority**
- Different contexts emphasize different law combinations
- Mobile: Fitts's Law + Thumb Zones (accessibility + ergonomics)
- Forms: Postel's Law + Prägnanz (accept various inputs + simple interface)
- Navigation: Hick's Law + Miller's Law (fewer top-level + grouped sub-items)

### 2. **Hierarchical Application**
- Apply laws in layers based on importance
- Primary actions: Fitts's Law + Von Restorff (large + standout)
- Secondary actions: Law of Similarity + Proximity (consistent + grouped)
- Tertiary actions: Prägnanz (hide when possible)

### 3. **Progressive Disclosure**
- Start simple (Prägnanz, Hick's Law)
- Reveal complexity on demand (Miller's Law, Tesler's Law)
- This satisfies multiple laws simultaneously

### 4. **Visual + Functional Consistency**
- Functionally consistent: All buttons work the same (Similarity)
- Visually distinct: CTA stands out (Von Restorff)
- Both work together: consistent behavior + clear hierarchy

---

## Best Practices for Your Design System

1. **Use constants to enforce consistency** (Similarity)
2. **Use accent color sparingly** (Von Restorff - 10% rule)
3. **Chunk information** (Miller's Law - 7±2 items)
4. **Reduce choices** (Hick's Law - 3-5 primary options)
5. **Show progress** (Zeigarnik Effect)
6. **Celebrate completions** (Satisfaction)
7. **Provide immediate feedback** (Doherty Threshold)
8. **Use appropriate touch targets** (Fitts's Law)
9. **Group related items** (Proximity)
10. **Keep it simple, but not too simple** (Prägnanz + Information needs)

---

## Conclusion

UX laws are **complementary principles** that work together, not contradictions. The key is:

1. **Understand the context** - Which law combinations apply here?
2. **Apply hierarchically** - Primary actions get priority treatment
3. **Use progressive disclosure** - Simple first, complex on demand
4. **Test with users** - See which combinations work best

Your design system already implements these complementary principles through:
- Priority-based touch targets (Fitts's + Space efficiency)
- Hierarchical color system (Similarity + Von Restorff)
- Chunked information limits (Hick's + Miller's)
- Progressive disclosure patterns (Prägnanz + Information needs)
- Immediate feedback constants (Doherty + Perceived performance)

**Remember**: These aren't contradictions—they're different aspects of good UX that work together when applied thoughtfully.
