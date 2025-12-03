# Arm Angle Coordinate System Reference

## Overview

This document explains the arm angle coordinate system used in the `FigureCanvas` component. Understanding this system is **critical** for correctly implementing pose logic.

## The Core Rule

- **Positive arm angle values** = arm goes **OUTWARD** (away from body center)
- **Negative arm angle values** = arm goes **INWARD** (toward body center)

## Arm Angle Values

### Positive Values (Outward)
Positive values move the arm away from the body center:
- `+10` to `+15`: Arms at sides, relaxed
- `+30` to `+50`: Arms on hips, reaching outward
- `+50` to `+70`: Arms extended outward, on knees (when sitting)

### Negative Values (Inward)
Negative values move the arm toward the body center:
- `-5` to `-10`: Hands meeting at center/lap
- `-15` to `-20`: Arms folded/crossed, wrapped around torso
- `-30` to `-40`: Arms behind back
- `-35` to `-55`: Arms raised upward

## Elbow Angle Values

- **Positive values**: Forearm extends in the direction determined by the arm angle
- **Negative values**: Forearm angles back/inward (used for behind-back poses)

## Common Patterns

| Pose Description | Arm Angle | Example Values |
|-----------------|-----------|----------------|
| Arms at sides | Positive | `leftArm = 12, rightArm = 12` |
| Arms crossing body | Negative | `leftArm = -15, rightArm = -15` |
| Hands meeting at center | Negative | `leftArm = -10, rightArm = -10` |
| Arms behind back | Negative | `leftArm = -30, rightArm = -30` |
| Arms on hips | Positive | `leftArm = 50, rightArm = 50` |
| Arms raised up | Negative | `leftArm = -45, rightArm = -45` |
| One arm raised | Mixed | `leftArm = 12, rightArm = -50` |

## Validation Rules

### Must Use Negative Values
If the pose description contains any of these keywords, **arm angles MUST be negative**:
- "folded"
- "crossed"
- "clasped"
- "behind back"
- "wrapped"
- "together"
- "meeting"
- "in lap"

### Typically Use Positive Values
If the pose description contains any of these keywords, **arm angles are typically positive**:
- "at sides"
- "on hip"
- "on knee"
- "in pocket"
- "outward"
- "extended" (when going outward, not upward)

### Can Be Either
- "raised" - Can be negative (upward) or positive (outward)
- "extended" - Can be negative (upward) or positive (outward)

## Quick Reference Table

| Intent | Expected Direction | Typical Values |
|--------|-------------------|----------------|
| `handIntent.folded` | Inward (negative) | `-15` to `-20` |
| `handIntent.behindBack` | Inward (negative) | `-30` |
| `handIntent.clasped` | Inward (negative) | `-10` |
| `handIntent.wrapped` | Inward (negative) | `-20` |
| `handIntent.onLap` | Inward (negative) | `-5` |
| `handIntent.onHip` | Outward (positive) | `50` |
| `handIntent.onKnee` | Outward (positive) | `55` |
| `handIntent.inPocket` | Outward (positive) | `35` |
| `handIntent.atSides` | Outward (positive) | `12` |
| `handIntent.raised` | Mixed (usually negative for upward) | `-45` to `-50` |

## Examples: Correct vs Incorrect

### Example 1: Arms Loosely Folded
**Correct:**
```javascript
leftArm = -15;   // Negative = inward
rightArm = -15;  // Negative = inward
leftElbow = 120;
rightElbow = 120;
```

**Incorrect:**
```javascript
leftArm = 70;    // Positive = outward (WRONG!)
rightArm = 70;   // Positive = outward (WRONG!)
```

### Example 2: Arms Behind Back
**Correct:**
```javascript
leftArm = -30;   // Negative = inward
rightArm = -30;  // Negative = inward
leftElbow = -40; // Negative = further back
rightElbow = -40;
```

**Incorrect:**
```javascript
leftArm = -25;   // Too small, might look like at sides
leftElbow = 50;  // Positive = wrong direction
```

### Example 3: Hands Clasped Together
**Correct:**
```javascript
leftArm = -10;   // Negative = inward to meet
rightArm = -10;  // Negative = inward to meet
leftElbow = 100;
rightElbow = 100;
```

**Incorrect:**
```javascript
leftArm = 30;    // Positive = outward (WRONG!)
rightArm = 30;   // Positive = outward (WRONG!)
```

## Common Mistakes to Avoid

1. **Using positive values for poses that require arms to come together**
   - ❌ `leftArm = 70` for "Arms Loosely Folded"
   - ✅ `leftArm = -15` for "Arms Loosely Folded"

2. **Not understanding that "raised" can mean upward (negative) or outward (positive)**
   - Check the context: "raised up" = negative, "raised to the side" = can be positive

3. **Forgetting that elbow angles also matter**
   - For behind-back poses, elbows should also be negative

4. **Assuming all "extended" poses use positive values**
   - "Extended gracefully upward" = negative
   - "Extended to the side" = positive

## When Adding New Poses

Before setting arm angle values, ask yourself:

1. **Does the pose description mention arms coming together, crossing, or meeting?**
   - If YES → Use **negative** values
   - If NO → Continue to next question

2. **Does the pose description mention arms at sides, on hips, or outward?**
   - If YES → Use **positive** values
   - If NO → Continue to next question

3. **Does the pose description mention arms raised or extended upward?**
   - If YES → Use **negative** values
   - If NO → Use positive values (default for outward)

## Testing Your Implementation

1. **Visual Test**: Look at the rendered figure - do the arms match the pose description?
2. **Console Validation**: In development mode, check the browser console for validation warnings
3. **Compare with Similar Poses**: If unsure, compare with a similar existing pose

## Reference Constants

The code includes `ARM_ANGLES` constants for common patterns:

```javascript
const ARM_ANGLES = {
  // Outward (positive)
  AT_SIDES: 12,
  ON_HIP: 50,
  ON_KNEE: 55,
  IN_POCKET: 35,
  
  // Inward (negative)
  FOLDED: -15,
  BEHIND_BACK: -30,
  CLASPED: -10,
  WRAPPED: -20,
  ON_LAP: -5,
  RAISED_UP: -45,
  PAW_GESTURE: -35,
};
```

Use these constants when appropriate to ensure consistency.

## Need Help?

If you're unsure about a pose:
1. Check this document first
2. Look at similar existing poses in the code
3. Test visually in the browser
4. Check the development console for validation warnings

Remember: **When in doubt, if the pose description says arms come together, cross, or meet, the arm angles MUST be negative.**
