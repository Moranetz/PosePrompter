# Doll Figure (FigureCanvas) Bugs Found

## 🚨 CRITICAL BUG #1: Null/Undefined String Operations

### Location
- **File**: `src/components/ArticulatedFigure/FigureCanvas.jsx:114-115, 132-141`

### Problem
**String operations on potentially null/undefined values:**
```javascript
// Line 112-115
const originalTitle = typeof option === 'string' ? option : (option.title || '');
const originalPrompt = typeof option === 'string' ? option : (option.prompt || '');
const title = originalTitle.toLowerCase(); // CRASH if originalTitle is null/undefined
const prompt = originalPrompt.toLowerCase(); // CRASH if originalPrompt is null/undefined
```

**Then later (line 132-141):**
```javascript
const bodyText = bodyPose.title + ' ' + bodyPose.prompt; // Could be "null null" or "undefined undefined"
const armsText = arms.title + ' ' + arms.prompt;
// ... etc
```

**If `option.title` or `option.prompt` is explicitly `null` (not just missing):**
- `option.title || ''` returns `null` (falsy but not empty string)
- `.toLowerCase()` on `null` throws: `TypeError: Cannot read property 'toLowerCase' of null`
- Component crashes

### Impact
- **CRITICAL**: Component crashes if any option has null title/prompt
- Entire figure disappears
- User can't interact with app

### Fix Required
```javascript
const originalTitle = typeof option === 'string' ? option : (option?.title ?? '');
const originalPrompt = typeof option === 'string' ? option : (option?.prompt ?? '');
const title = (originalTitle || '').toLowerCase();
const prompt = (originalPrompt || '').toLowerCase();
```

---

## 🚨 CRITICAL BUG #2: Array Index Out of Bounds Not Fully Protected

### Location
- **File**: `src/components/ArticulatedFigure/FigureCanvas.jsx:106-108`

### Problem
**Index bounds checking has edge case:**
```javascript
let index = selections?.[categoryKey] || 0;
if (index < 0) index = 0;
if (index >= options.length) index = options.length - 1;
```

**Edge case:**
- If `options.length === 0` (empty array)
- `index = options.length - 1` = `-1`
- Then `options[index]` = `options[-1]` = `undefined`
- Line 111: `if (!option)` catches this, but it's inefficient

**Also:**
- If `selections[categoryKey]` is `NaN` or `Infinity`:
- `NaN || 0` = `NaN` (NaN is falsy but not 0)
- `NaN >= options.length` = `false` (NaN comparisons always false)
- `options[NaN]` = `undefined`

### Impact
- **CRITICAL**: Can access invalid array indices
- Returns undefined option
- Component may crash or render incorrectly

### Fix Required
```javascript
let index = selections?.[categoryKey] ?? 0;
// Ensure index is a valid number
if (typeof index !== 'number' || isNaN(index) || !isFinite(index)) {
  index = 0;
}
if (index < 0) index = 0;
if (options.length === 0) {
  return { title: '', prompt: '', originalTitle: '', originalPrompt: '' };
}
if (index >= options.length) index = options.length - 1;
```

---

## 🐛 BUG #3: String Concatenation with Null/Undefined

### Location
- **File**: `src/components/ArticulatedFigure/FigureCanvas.jsx:132-141`

### Problem
**String concatenation can produce "null null" or "undefined undefined":**
```javascript
const bodyText = bodyPose.title + ' ' + bodyPose.prompt;
```

**If `bodyPose.title` or `bodyPose.prompt` is `null` or `undefined`:**
- Result: `"null null"` or `"undefined undefined"`
- `.includes()` checks will match these strings literally
- `bodyText.includes('sitting')` might match `"null null".includes('sitting')` = false (okay)
- But `bodyText.includes('null')` = true (unexpected!)

### Impact
- Incorrect pose detection
- Figure renders wrong pose
- Confusing behavior

### Fix Required
```javascript
const bodyText = (bodyPose.title || '') + ' ' + (bodyPose.prompt || '');
const armsText = (arms.title || '') + ' ' + (arms.prompt || '');
// ... etc for all concatenations
```

---

## 🐛 BUG #4: Color String Interpolation Without Validation

### Location
- **File**: `src/components/ArticulatedFigure/FigureCanvas.jsx:1297-1299`

### Problem
**Color string interpolation can produce invalid colors:**
```javascript
const accentColor = categoryColors?.['BodyPose'] || '#10b981';
// ...
const strokeColor = (isSitting || isLeaning || isReclining) 
  ? `${accentColor}99` // 60% opacity accent 
  : baseStroke;
```

**If `categoryColors['BodyPose']` is:**
- `null` → `null || '#10b981'` = `'#10b981'` ✓ (okay)
- `undefined` → `undefined || '#10b981'` = `'#10b981'` ✓ (okay)
- `''` (empty string) → `'' || '#10b981'` = `'#10b981'` ✓ (okay)
- `'invalid'` → `'invalid' || '#10b981'` = `'invalid'` ✗ (produces `'invalid99'` - invalid color!)
- `123` (number) → `123 || '#10b981'` = `123` ✗ (produces `'12399'` - invalid color!)

### Impact
- Invalid CSS colors
- Figure might not render
- Browser console errors

### Fix Required
```javascript
const getValidColor = (color, defaultColor) => {
  if (!color || typeof color !== 'string') return defaultColor;
  // Check if it's a valid hex color
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return color;
  return defaultColor;
};

const accentColor = getValidColor(categoryColors?.['BodyPose'], '#10b981');
```

---

## 🐛 BUG #5: Missing Null Check in getPartColor

### Location
- **File**: `src/components/ArticulatedFigure/FigureCanvas.jsx:1356-1366` (inferred from usage)

### Problem
**`getPartColor` function likely doesn't handle null/undefined:**
```javascript
const getPartColor = (category, defaultColor) => {
  // Likely implementation:
  return categoryColors?.[category] || defaultColor;
  // But what if categoryColors[category] is null?
  // null || defaultColor = defaultColor ✓ (okay)
  // But what if it's an invalid color string?
}
```

**Need to verify implementation**, but likely issues:
- Invalid color strings not validated
- Null colors not handled explicitly

### Impact
- Invalid colors in figure
- Rendering issues

### Fix Required
**Verify and fix `getPartColor` implementation** (need to see actual code)

---

## 🐛 BUG #6: Math Operations Without Validation

### Location
- **File**: `src/components/ArticulatedFigure/FigureCanvas.jsx:2002-2004, 2037-2038, etc.`

### Problem
**Math operations on potentially undefined values:**
```javascript
x2: centerX + shoulderWidth + Math.sin(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale,
```

**If `poseVariant.rightArm` is `undefined` or `null`:**
- `undefined * Math.PI / 180` = `NaN`
- `Math.sin(NaN)` = `NaN`
- `NaN * 35 * bodyScale` = `NaN`
- SVG coordinates become `NaN` → figure doesn't render

**If `bodyScale` is `undefined`:**
- `35 * undefined` = `NaN`
- Same issue

### Impact
- **CRITICAL**: Figure doesn't render if any pose value is undefined
- Entire component breaks
- User sees blank space

### Fix Required
**Add validation in poseVariant useMemo:**
```javascript
return { 
  head: headRotate || 0, 
  headTilt: headTilt || 0,
  // ... ensure all numeric values have defaults
  leftArm: leftArm || 0,
  rightArm: rightArm || 0,
  leftElbow: leftElbow || 0,
  rightElbow: rightElbow || 0,
  bodyScale: bodyScale || 1.0,
  // ... etc
};
```

---

## 🐛 BUG #7: Optional Chaining Not Used Consistently

### Location
- **File**: `src/components/ArticulatedFigure/FigureCanvas.jsx:1291, 1294`

### Problem
**Inconsistent optional chaining:**
```javascript
const jointColor = categoryColors?.['BodyPose'] || '#10b981'; // Uses ?.
const accentColor = categoryColors?.['BodyPose'] || '#10b981'; // Uses ?.
```

**But elsewhere:**
```javascript
const bodyText = bodyPose.title + ' ' + bodyPose.prompt; // No optional chaining
```

**Inconsistent patterns:**
- Some places use `?.`
- Some places use `||`
- Some places use neither
- Leads to crashes in some cases but not others

### Impact
- Inconsistent error handling
- Some code paths crash, others don't
- Hard to debug

### Fix Required
**Use consistent optional chaining everywhere:**
```javascript
const bodyText = (bodyPose?.title || '') + ' ' + (bodyPose?.prompt || '');
```

---

## 🐛 BUG #8: Division by Zero Risk

### Location
- **File**: `src/components/ArticulatedFigure/FigureCanvas.jsx:2002-2004` (Math.PI / 180)

### Problem
**Not actually a bug** - `Math.PI / 180` is constant, but:
- If `poseVariant.rightArm` is `Infinity`:
- `Infinity * Math.PI / 180` = `Infinity`
- `Math.sin(Infinity)` = `NaN`
- SVG breaks

**Also:**
- If `bodyScale` is `0`:
- `35 * 0` = `0` (okay, but figure becomes invisible)
- If `bodyScale` is `Infinity`:
- `35 * Infinity` = `Infinity` (SVG breaks)

### Impact
- Figure doesn't render with extreme values
- Edge case but possible

### Fix Required
**Clamp values:**
```javascript
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const safeBodyScale = clamp(bodyScale || 1.0, 0.1, 10.0);
const safeArmAngle = clamp(poseVariant.rightArm || 0, -180, 180);
```

---

## 🐛 BUG #9: Missing Error Boundary

### Location
- **File**: `src/components/ArticulatedFigure/FigureCanvas.jsx:10`

### Problem
**Component has no error boundary or try-catch:**
- If any calculation fails, entire component crashes
- No fallback rendering
- No error message to user

### Impact
- **CRITICAL**: Entire app can crash if figure has bad data
- No recovery mechanism
- Poor user experience

### Fix Required
**Add error boundary or try-catch:**
```javascript
try {
  // All rendering logic
} catch (error) {
  console.error('[FigureCanvas] Rendering error:', error);
  // Render fallback figure or error message
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 400">
      <text x="100" y="200" textAnchor="middle" fill="#ffffff">
        Error rendering figure
      </text>
    </svg>
  );
}
```

---

## 🐛 BUG #10: Infinite Loop Risk in useMemo

### Location
- **File**: `src/components/ArticulatedFigure/FigureCanvas.jsx:98-1269`

### Problem
**Large useMemo with complex calculations:**
- If `selections` or `categories` change frequently
- useMemo recalculates entire pose variant
- Complex calculations could be slow
- No memoization of intermediate values

**Potential issues:**
- Performance degradation
- UI freezes on rapid selection changes
- No debouncing

### Impact
- Poor performance
- UI lag
- Bad user experience

### Fix Required
**Consider splitting useMemo or adding debouncing:**
```javascript
// Split into smaller useMemos
const bodyPoseData = useMemo(() => getPoseData('BodyPose'), [selections, categories]);
const armsData = useMemo(() => getPoseData('Arms'), [selections, categories]);
// ... etc
```

---

## Summary of Required Fixes

### Critical (Must Fix Immediately)
1. **Null/undefined string operations** - Add null checks before toLowerCase()
2. **Array index validation** - Validate index is number, handle empty arrays
3. **Math operations validation** - Ensure all numeric values have defaults
4. **Error boundary** - Add try-catch or error boundary

### Important (Should Fix Soon)
5. **String concatenation** - Use nullish coalescing
6. **Color validation** - Validate color strings
7. **Consistent optional chaining** - Use ?. everywhere
8. **Value clamping** - Clamp extreme values

### Nice to Have
9. **Performance optimization** - Split useMemo
10. **Division by zero** - Add checks (low priority)

---

## Recommended Fix Priority

1. **Add null checks before toLowerCase()** (CRITICAL - crashes)
2. **Validate array indices** (CRITICAL - crashes)
3. **Add error boundary** (CRITICAL - crashes)
4. **Ensure numeric defaults** (CRITICAL - breaks rendering)
5. **Fix string concatenation** (IMPORTANT - incorrect behavior)
6. **Validate colors** (IMPORTANT - rendering issues)
7. **Consistent optional chaining** (IMPORTANT - maintainability)
8. **Clamp values** (Nice to have)
9. **Performance optimization** (Nice to have)

