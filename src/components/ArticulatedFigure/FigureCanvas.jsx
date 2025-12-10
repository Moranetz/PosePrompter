import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * A clean, minimal figure that responds to actual pose selections
 * Parses pose titles to determine figure position
 * INTERACTIVE: Click on body parts to select that category
 * NOW INCLUDES: Head movement, facial expressions, and all pose correlations
 */
const FigureCanvas = ({ selections, categoryColors, categories, categoryDisplayNames, onPartClick, showAestheticFilter = false }) => {
  const [hoveredPart, setHoveredPart] = useState(null);
  const width = 200;
  const height = 400;
  const centerX = width / 2;

  // Arm angle reference values for common poses
  const ARM_ANGLES = {
    // Outward (positive) - arms away from body
    AT_SIDES: 12,
    ON_HIP: 50,
    ON_KNEE: 55,
    IN_POCKET: 35,
    
    // Inward (negative) - arms toward body center
    FOLDED: -15,
    BEHIND_BACK: -30,
    CLASPED: -10,
    WRAPPED: -20,
    ON_LAP: -5,
    RAISED_UP: -45, // For arms raised upward
    PAW_GESTURE: -35,
  };

  /**
   * Validates that arm angles match the expected direction based on pose intent
   * @param {Object} handIntent - The hand intent object
   * @param {number} leftArm - Left arm angle value
   * @param {number} rightArm - Right arm angle value
   * @param {string} poseName - Name of the pose for error messages
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  const validateArmAngles = (handIntent, leftArm, rightArm, poseName) => {
    const errors = [];
    
    // Poses that require INWARD (negative) arm angles
    const inwardPoses = ['folded', 'behindBack', 'clasped', 'wrapped', 'onLap'];
    const requiresInward = inwardPoses.some(key => handIntent[key]);
    
    if (requiresInward) {
      if (leftArm > 0 || rightArm > 0) {
        errors.push(
          `${poseName}: Arms should angle INWARD (negative values) but got ` +
          `leftArm=${leftArm}, rightArm=${rightArm}. ` +
          `For poses where arms come together/cross, use negative values.`
        );
      }
    }
    
    // Poses that typically use OUTWARD (positive) arm angles
    const outwardPoses = ['onHip', 'onKnee', 'inPocket', 'atSides'];
    const requiresOutward = outwardPoses.some(key => handIntent[key]);
    
    if (requiresOutward && !requiresInward) {
      // Only warn if both arms are negative when they should be outward
      if (leftArm < 0 && rightArm < 0) {
        errors.push(
          `${poseName}: Arms should angle OUTWARD (positive values) but got ` +
          `leftArm=${leftArm}, rightArm=${rightArm}. ` +
          `For poses at sides/hips/knees, use positive values.`
        );
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * Helper function to get expected arm angle direction for a pose
   * @param {Object} handIntent - The hand intent object
   * @returns {string} 'inward', 'outward', or 'mixed'
   */
  const getExpectedArmDirection = (handIntent) => {
    const inwardPoses = ['folded', 'behindBack', 'clasped', 'wrapped', 'onLap'];
    const outwardPoses = ['onHip', 'onKnee', 'inPocket', 'atSides'];
    
    const hasInward = inwardPoses.some(key => handIntent[key]);
    const hasOutward = outwardPoses.some(key => handIntent[key]);
    
    if (hasInward) return 'inward';
    if (hasOutward) return 'outward';
    return 'mixed';
  };

  // Determine pose based on actual selected options - OPTIONS WORK TOGETHER
  const poseVariant = useMemo(() => {
    // Get the actual pose title and prompt from selection index
    const getPoseData = (categoryKey) => {
      if (!categories || !categories[categoryKey]) return { title: '', prompt: '', originalTitle: '', originalPrompt: '' };
      const options = categories[categoryKey];
      if (!options || options.length === 0) return { title: '', prompt: '', originalTitle: '', originalPrompt: '' };
      
      // Ensure index is within bounds
      let index = selections?.[categoryKey] || 0;
      if (index < 0) index = 0;
      if (index >= options.length) index = options.length - 1;
      
      const option = options[index];
      if (!option) return { title: '', prompt: '', originalTitle: '', originalPrompt: '' };
      const originalTitle = typeof option === 'string' ? option : (option.title || '');
      const originalPrompt = typeof option === 'string' ? option : (option.prompt || '');
      const title = originalTitle.toLowerCase();
      const prompt = originalPrompt.toLowerCase();
      return { title, prompt, originalTitle, originalPrompt };
    };

    const bodyPose = getPoseData('BodyPose');
    const arms = getPoseData('Arms');
    const head = getPoseData('HeadPosition');
    const torsoData = getPoseData('Torso');
    const hands = getPoseData('Hands');
    const legs = getPoseData('Legs');
    const feet = getPoseData('Feet');
    const bodySize = getPoseData('BodySize');
    const facialExpression = getPoseData('FacialExpression');
    const eyes = getPoseData('Eyes');
    const mouth = getPoseData('Mouth');
    
    // Combine title and prompt for more context
    const bodyText = bodyPose.title + ' ' + bodyPose.prompt;
    const armsText = arms.title + ' ' + arms.prompt;
    const headText = head.title + ' ' + head.prompt;
    const torsoText = torsoData.title + ' ' + torsoData.prompt;
    const handsText = hands.title + ' ' + hands.prompt;
    const legsText = legs.title + ' ' + legs.prompt;
    const feetText = feet.title + ' ' + feet.prompt;
    const expressionText = facialExpression.title + ' ' + facialExpression.prompt;
    const eyesText = eyes.title + ' ' + eyes.prompt;
    const mouthText = mouth.title + ' ' + mouth.prompt;
    
    // Get original titles for exact matching (more reliable than keyword matching)
    const bodyTitleOriginal = bodyPose.originalTitle;
    const armsTitleOriginal = arms.originalTitle;
    const handsTitleOriginal = hands.originalTitle;
    const headTitleOriginal = head.originalTitle;
    const expressionTitleOriginal = facialExpression.originalTitle;
    const eyesTitleOriginal = eyes.originalTitle;
    const mouthTitleOriginal = mouth.originalTitle;
    const legsTitleOriginal = legs.originalTitle;
    const feetTitleOriginal = feet.originalTitle;
    const torsoTitleOriginal = torsoData.originalTitle;
    const bodySizeTitleOriginal = bodySize.originalTitle;
    
    // ===== STEP 1: Determine major body position first =====
    // Check specific pose titles FIRST for accuracy, then fall back to keyword matching
    let isSitting = false;
    let isLeaning = false;
    let isReclining = false;
    let isWalking = false;
    let isKneeUp = false; // One knee raised (for resting arm on)
    let isRelaxedStance = false; // Relaxed standing with one foot forward
    let isDelicateStance = false; // Delicate/soft standing pose
    let isPawGesture = false; // Japanese fashion-inspired paw gesture
    let legsCrossed = false; // Initialize legsCrossed early
    
    // EXACT MATCH for BodyPose titles (13 total options)
    // 1. "Sitting Contemplative Off-Camera"
    // 2. "Sitting Cross-Legged Floor Gaze"
    // 3. "Sitting Genuine Laugh Joy"
    // 4. "Curled Couch"
    // 5. "Relaxed Stance"
    // 6. "Standing Over-Shoulder"
    // 7. "Standing Delicate"
    // 8. "Leaning S-Curve Gesture"
    // 9. "Leaning Dock Coastal"
    // 10. "Reclining Grass Relaxed Grace"
    // 11. "Walking Introspection Mid-Step"
    // 12. "Walking Barefoot Carefree"
    // 13. "Innocent"
    
    if (bodyTitleOriginal === "Sitting Contemplative Off-Camera" ||
        bodyTitleOriginal === "Sitting Cross-Legged Floor Gaze" ||
        bodyTitleOriginal === "Sitting Genuine Laugh Joy") {
      isSitting = true;
      // Check if legs are crossed
      if (bodyTitleOriginal === "Sitting Contemplative Off-Camera" || 
          bodyText.includes('crossed') || bodyText.includes('cross-legged')) {
        legsCrossed = true;
      }
    } else if (bodyTitleOriginal === "Curled Couch") {
      isSitting = true; // Curled is a sitting position
      // Knees tucked for curled position
      isKneeUp = true;
    } else if (bodyTitleOriginal === "Leaning S-Curve Gesture" ||
               bodyTitleOriginal === "Leaning Dock Coastal") {
      isLeaning = true;
    } else if (bodyTitleOriginal === "Reclining Grass Relaxed Grace") {
      isReclining = true;
      isKneeUp = true; // "one knee bent up" from prompt
    } else if (bodyTitleOriginal === "Walking Introspection Mid-Step" ||
               bodyTitleOriginal === "Walking Barefoot Carefree") {
      isWalking = true;
    } else if (bodyTitleOriginal === "Relaxed Stance") {
      isRelaxedStance = true;
    } else if (bodyTitleOriginal === "Standing Delicate") {
      isDelicateStance = true;
    } else if (bodyTitleOriginal === "Standing Over-Shoulder") {
      // Standing pose, but special handling for over-shoulder
      // Don't set isSitting, isLeaning, etc. - it's a standing pose
    } else if (bodyTitleOriginal === "Innocent") {
      isPawGesture = true;
    } else {
      // Fallback: keyword matching for custom/package options
      // Fall back to keyword matching for custom poses
      if (bodyText.includes('sitting') || bodyText.includes('curled') || bodyText.includes('cross-legged')) {
        isSitting = true;
        if (bodyText.includes('knee bent') || bodyText.includes('one knee') || 
            legsText.includes('bent') || legsText.includes('knee up')) {
          isKneeUp = true;
        }
      } else if (bodyText.includes('leaning')) {
        isLeaning = true;
      } else if (bodyText.includes('reclining')) {
        isReclining = true;
        isKneeUp = bodyText.includes('knee bent') || legsText.includes('bent');
      } else if (bodyText.includes('walking') || bodyText.includes('mid-step')) {
        isWalking = true;
      } else if (bodyText.includes('relaxed stance') || bodyText.includes('foot forward') || bodyText.includes('elegant pose')) {
        isRelaxedStance = true;
      } else if (bodyText.includes('delicate') || bodyText.includes('soft') || bodyText.includes('slouch')) {
        isDelicateStance = true;
      }
    }
    
    // ===== STEP 2: Set base values based on body position =====
    // NOTE: Torso category will override this value later, so this is just a fallback
    let headRotate = 0;
    let torso = isSitting ? 8 : isLeaning ? -10 : isReclining ? 25 : isDelicateStance ? 5 : 0;
    let stance = isLeaning ? 8 : isWalking ? 5 : isRelaxedStance ? 3 : 0;
    // legsCrossed is already initialized and may be set in BodyPose detection, but check legs category too
    if (!legsCrossed) {
      legsCrossed = legsText.includes('crossed') || legsText.includes('cross-legged') || 
                    bodyText.includes('crossed') || bodyText.includes('cross-legged');
    }
    let legsBent = isSitting || isReclining || legsText.includes('bent') || legsText.includes('tucked');
    let lookingAway = false;
    let handsOpen = true;
    let feetPointed = false;
    
    // Special standing pose modifiers
    let oneFootForward = isRelaxedStance || isWalking;
    
    // ===== STEP 3: Determine WHAT the hands/arms are doing (intent) =====
    // EXACT MATCHING for each Arms and Hands option - this ensures 100% accuracy
    // Arms options (13 total):
    // 1. "Arms Sides Relaxed" - atSides
    // 2. "One Hand Pocket Unbothered" - inPocket
    // 3. "Arms Resting Around Knee" - onKnee
    // 4. "Forearm Resting Knee Relaxed" - onKnee
    // 5. "Arm Draped Lap" - onLap
    // 6. "Arms Loosely Folded" - folded
    // 7. "Arm Wrapped Torso Gesturing" - wrapped
    // 8. "One Arm Raised Side" - raised
    // 9. "Both Arms Extended Gracefully" - raised
    // 10. "Arm Adjusting Clothing" - holding
    // 11. "Hand Shielding Eyes Sun" - shielding
    // 12. "Both Hands Hips" - onHip
    // 13. "Arms Behind Back" - behindBack
    
    // Hands options (20 total):
    // 1. "Hands Sides Completely Relaxed" - atSides
    // 2. "Hands Resting Knee Thigh" - onKnee
    // 3. "Hands Lap Effortless Ease" - onLap
    // 4. "One Hand Pocket Relaxed" - inPocket
    // 5. "Hand Brushing Hair Natural Grace" - touchingHair
    // 6. "Head Resting Gently Hand" - touchingHead
    // 7. "Chin Resting Hand Contemplative" - touchingChin
    // 8. "Hand Touching Face Gently" - touchingFace
    // 9. "Fingertips Touching Lips" - touchingLips
    // 10. "Hands Cupping Face" - cupping
    // 11. "Hands Holding Small Object" - holding
    // 12. "Holding Skirt Fabric Lifting" - holding
    // 13. "Hands Holding Book" - holding
    // 14. "Hand Shielding Eyes Sun" - shielding
    // 15. "Hand Adjusting Clothing Natural" - holding
    // 16. "Hand Hip Gesturing" - onHip
    // 17. "Hand Reaching Toward Camera" - raised
    // 18. "Hands Loosely Clasped Together" - clasped
    // 19. "Hands Meditation Position" - clasped
    // 20. "Hands Gripping Surface" - holding
    
    let handIntent = {
      touchingFace: false,
      touchingChin: false,
      touchingLips: false,
      touchingHair: false,
      touchingHead: false,
      onKnee: false,
      onLap: false,
      onHip: false,
      inPocket: false,
      holding: false,
      cupping: false,
      folded: false,
      behindBack: false,
      raised: false,
      shielding: false,
      atSides: false,
      wrapped: false,
      clasped: false,
      oneArmOnly: false
    };
    
    // EXACT MATCH for Arms titles
    if (armsTitleOriginal === "Arms Sides Relaxed") {
      handIntent.atSides = true;
    } else if (armsTitleOriginal === "One Hand Pocket Unbothered") {
      handIntent.inPocket = true;
    } else if (armsTitleOriginal === "Arms Resting Around Knee" || armsTitleOriginal === "Forearm Resting Knee Relaxed") {
      handIntent.onKnee = true;
    } else if (armsTitleOriginal === "Arm Draped Lap") {
      handIntent.onLap = true;
    } else if (armsTitleOriginal === "Arms Loosely Folded") {
      handIntent.folded = true;
    } else if (armsTitleOriginal === "Arm Wrapped Torso Gesturing") {
      handIntent.wrapped = true;
    } else if (armsTitleOriginal === "One Arm Raised Side") {
      handIntent.raised = true;
      handIntent.oneArmOnly = true; // Flag for asymmetric arm position
    } else if (armsTitleOriginal === "Both Arms Extended Gracefully") {
      handIntent.raised = true;
    } else if (armsTitleOriginal === "Arm Adjusting Clothing") {
      handIntent.holding = true;
    } else if (armsTitleOriginal === "Hand Shielding Eyes Sun") {
      handIntent.shielding = true;
    } else if (armsTitleOriginal === "Both Hands Hips") {
      handIntent.onHip = true;
    } else if (armsTitleOriginal === "Arms Behind Back") {
      handIntent.behindBack = true;
    }
    
    // EXACT MATCH for Hands titles (these take priority over Arms)
    if (handsTitleOriginal === "Hands Sides Completely Relaxed") {
      handIntent.atSides = true;
      handIntent.inPocket = false; // Override arms
    } else if (handsTitleOriginal === "Hands Resting Knee Thigh") {
      handIntent.onKnee = true;
    } else if (handsTitleOriginal === "Hands Lap Effortless Ease") {
      handIntent.onLap = true;
    } else if (handsTitleOriginal === "One Hand Pocket Relaxed") {
      handIntent.inPocket = true;
    } else if (handsTitleOriginal === "Hand Brushing Hair Natural Grace") {
      handIntent.touchingHair = true;
    } else if (handsTitleOriginal === "Head Resting Gently Hand") {
      handIntent.touchingHead = true;
    } else if (handsTitleOriginal === "Chin Resting Hand Contemplative") {
      handIntent.touchingChin = true;
    } else if (handsTitleOriginal === "Hand Touching Face Gently") {
      handIntent.touchingFace = true;
    } else if (handsTitleOriginal === "Fingertips Touching Lips") {
      handIntent.touchingLips = true;
    } else if (handsTitleOriginal === "Hands Cupping Face") {
      handIntent.cupping = true;
    } else if (handsTitleOriginal === "Hands Holding Small Object" || 
               handsTitleOriginal === "Holding Skirt Fabric Lifting" ||
               handsTitleOriginal === "Hands Holding Book" ||
               handsTitleOriginal === "Hand Adjusting Clothing Natural" ||
               handsTitleOriginal === "Hands Gripping Surface") {
      handIntent.holding = true;
    } else if (handsTitleOriginal === "Hand Shielding Eyes Sun") {
      handIntent.shielding = true;
    } else if (handsTitleOriginal === "Hand Hip Gesturing") {
      handIntent.onHip = true;
    } else if (handsTitleOriginal === "Hand Reaching Toward Camera") {
      handIntent.raised = true;
    } else if (handsTitleOriginal === "Hands Loosely Clasped Together" ||
               handsTitleOriginal === "Hands Meditation Position") {
      handIntent.clasped = true;
    }
    
    // FALLBACK: Keyword matching for custom/package options
    const allHandsText = handsText + ' ' + armsText;
    if (!handIntent.touchingFace && !handIntent.touchingChin && !handIntent.touchingLips && 
        !handIntent.touchingHair && !handIntent.touchingHead && !handIntent.cupping) {
      if (allHandsText.includes('cupping face')) handIntent.cupping = true;
      else if (allHandsText.includes('touching face') || allHandsText.includes('face gently')) handIntent.touchingFace = true;
      else if (allHandsText.includes('chin') || allHandsText.includes('resting hand')) handIntent.touchingChin = true;
      else if (allHandsText.includes('lips') || allHandsText.includes('fingertips')) handIntent.touchingLips = true;
      else if (allHandsText.includes('hair') || allHandsText.includes('brushing')) handIntent.touchingHair = true;
      else if (allHandsText.includes('head resting')) handIntent.touchingHead = true;
    }
    if (!handIntent.onKnee && allHandsText.includes('knee')) handIntent.onKnee = true;
    if (!handIntent.onLap && allHandsText.includes('lap')) handIntent.onLap = true;
    if (!handIntent.onHip && allHandsText.includes('hip')) handIntent.onHip = true;
    if (!handIntent.inPocket && allHandsText.includes('pocket')) handIntent.inPocket = true;
    if (!handIntent.holding && (allHandsText.includes('holding') || allHandsText.includes('adjusting') || allHandsText.includes('gripping'))) handIntent.holding = true;
    if (!handIntent.folded && allHandsText.includes('folded')) handIntent.folded = true;
    if (!handIntent.behindBack && allHandsText.includes('behind')) handIntent.behindBack = true;
    if (!handIntent.raised && (allHandsText.includes('raised') || allHandsText.includes('extended') || allHandsText.includes('reaching'))) handIntent.raised = true;
    if (!handIntent.shielding && allHandsText.includes('shielding')) handIntent.shielding = true;
    if (!handIntent.atSides && (allHandsText.includes('at sides') || allHandsText.includes('sides relaxed'))) handIntent.atSides = true;
    
    /**
     * ===== ARM ANGLE COORDINATE SYSTEM =====
     * 
     * CRITICAL: Understanding this coordinate system is essential for correct pose rendering.
     * 
     * ARM ANGLE VALUES:
     * - Positive values (e.g., +25, +50): Arm goes OUTWARD (away from body center)
     * - Negative values (e.g., -15, -35): Arm goes INWARD (toward body center)
     * 
     * ELBOW ANGLE VALUES:
     * - Positive values: Forearm extends in the direction determined by arm angle
     * - Negative values: Forearm angles back/inward (used for behind-back poses)
     * 
     * COMMON PATTERNS:
     * - Arms at sides: Small positive values (10-15)
     * - Arms crossing body/meeting at center: Negative values (-5 to -30)
     * - Arms raised up: Large negative values (-35 to -55)
     * - Arms going outward: Positive values (30-70)
     * 
     * VALIDATION RULES:
     * - "folded", "crossed", "clasped", "behind back", "wrapped" → MUST use negative arm angles
     * - "at sides", "on hip", "on knee", "in pocket" → Typically positive arm angles
     * - "raised", "extended" → Can be negative (upward) or positive (outward)
     * 
     * When in doubt: If the pose description says arms come together, cross, or meet,
     * the arm angles MUST be negative.
     */
    
    // ===== STEP 4: Calculate arm positions based on intent + body position =====
    let leftArm = 25;
    let rightArm = 25;
    let leftElbow = 20;
    let rightElbow = 20;
    
    // SPECIAL CASE: Check for specific poses that need specific arm positions
    // "Standing Over-Shoulder" - one hand in pocket, other at side
    if (bodyTitleOriginal.includes('Over-Shoulder') || bodyTitleOriginal.includes('Over Shoulder')) {
      if (!handIntent.touchingFace && !handIntent.touchingHair && !handIntent.folded) {
        // Over-shoulder pose typically has one hand in pocket
        if (armsTitleOriginal.includes('Pocket') || handsTitleOriginal.includes('Pocket')) {
          handIntent.inPocket = true;
        } else {
          // Default: right hand in pocket for over-shoulder
          rightArm = 35;
          rightElbow = 95;
          leftArm = 12;
          leftElbow = 10;
        }
      }
    }
    
    // Priority 1: Face/Head touching - arms MUST bend up to reach face
    // These override other arm positions because hands have a specific target
      if (handIntent.cupping) {
        // Both hands cupping face - symmetrical pose
        leftArm = -45;  // Arms angled up
        rightArm = -45;
        leftElbow = 135; // Elbows bent sharply to bring hands to face
        rightElbow = 135;
        handsOpen = true;
      } else if (handIntent.touchingChin) {
        // Chin resting on hand - contemplative pose
        // One arm supports chin, other relaxed
        if (isSitting) {
          // When sitting, elbow can rest on knee
          rightArm = 45;    // Arm goes forward/down to knee
          rightElbow = 130; // Then bends up to chin
          leftArm = 35;     // Other arm relaxed on lap
          leftElbow = 25;
        } else {
          // Standing - arm comes up from below
          rightArm = -35;
          rightElbow = 145;
          leftArm = 20;
          leftElbow = 15;
        }
      } else if (handIntent.touchingLips) {
        // Fingertips to lips - delicate gesture
        rightArm = -40;
        rightElbow = 140;
        leftArm = 15;
        leftElbow = 10;
        handsOpen = true;
      } else if (handIntent.touchingHead) {
        // Head resting on hand - often sitting
        if (isSitting) {
          rightArm = 40;
          rightElbow = 125;
          leftArm = 35;
          leftElbow = 20;
        } else {
          rightArm = -30;
          rightElbow = 130;
          leftArm = 15;
          leftElbow = 10;
        }
    } else if (handIntent.touchingFace) {
        // General face touching
        rightArm = -35;
        rightElbow = 125;
        leftArm = 20;
        leftElbow = 15;
    }
    // Priority 2: Hair touching - arm reaches up to head level
    else if (handIntent.touchingHair) {
      // One hand brushing/touching hair
      rightArm = -55;   // Arm raised high
      rightElbow = 90;  // Elbow bent to bring hand to head
      leftArm = 15;     // Other arm relaxed
      leftElbow = 10;
      handsOpen = true;
    }
    // Priority 2.5: Shielding eyes from sun
    else if (handIntent.shielding) {
      // Hand raised to shield eyes
      rightArm = -50;   // Arm raised up
      rightElbow = 110; // Elbow bent to bring hand to forehead/eye level
      leftArm = 15;     // Other arm relaxed
      leftElbow = 10;
      handsOpen = true;
    }
    // Priority 3: Arms on knee - DEPENDS HEAVILY on body position
    else if (handIntent.onKnee) {
      if (isSitting) {
        if (legsCrossed) {
          // Cross-legged: knees are out to the sides and lower
          leftArm = 65;    // Arm reaches down and out
          rightArm = 70;
          leftElbow = 55;  // Elbow bends to rest on knee
          rightElbow = 50;
        } else if (isKneeUp) {
          // One knee up: arm rests on raised knee
          rightArm = 55;   // Arm reaches forward to knee
          rightElbow = 60; // Elbow bends around knee
          leftArm = 30;    // Other arm relaxed
          leftElbow = 20;
        } else {
          // Regular sitting: knees are forward, bent at ~90 degrees
          leftArm = 50;    // Arms reach forward/down to knees
          rightArm = 55;
          leftElbow = 70;  // Forearms rest on thighs
          rightElbow = 65;
        }
      } else if (isReclining) {
        // Reclining with knee up - arm drapes over raised knee
        rightArm = 75;
        rightElbow = 45;
        leftArm = 15;
        leftElbow = 10;
      } else {
        // Standing - no knees to rest on, redirect to thigh/hip area
        leftArm = 35;
        rightArm = 40;
        leftElbow = 45;
        rightElbow = 40;
      }
    }
    // Priority 4: Hands in lap - hands come INWARD to meet at center/lap
    else if (handIntent.onLap) {
      // Negative arm angles bring hands inward to meet in lap
      if (isSitting) {
        // Sitting: hands rest in lap - arms angle inward
        leftArm = -5;      // Slight inward angle
        rightArm = -5;
        leftElbow = 95;    // Forearms come together in lap
        rightElbow = 95;
      } else if (isReclining) {
        leftArm = -5;
        rightArm = -5;
        leftElbow = 70;
        rightElbow = 70;
      } else {
        // Standing: hands in front at waist level - meet at center
        leftArm = -5;
        rightArm = -5;
        leftElbow = 85;
        rightElbow = 85;
      }
    }
    // Priority 5: Arms folded/crossed - arms come across the chest
    else if (handIntent.folded) {
      // For folded arms: upper arms angle down slightly, forearms cross over chest
      // leftArm positive = arm goes left (outward), negative = goes right (inward toward body)
      // rightArm positive = arm goes right (outward), negative = goes left (inward toward body)
      // We want arms angling DOWN and INWARD
      leftArm = -15;     // Upper arm angles slightly inward
      rightArm = -15;    // Upper arm angles slightly inward
      leftElbow = 120;   // Forearm bends back across chest
      rightElbow = 120;
      // Adjust for body lean
      if (isLeaning) {
        leftArm = -10;
        rightArm = -20;
      }
    }
    // Priority 6: Hands on hips
    else if (handIntent.onHip) {
      leftArm = 50;
      rightArm = 50;
      leftElbow = 85;
      rightElbow = 85;
      // Adjust for sitting - hips are at different position
      if (isSitting) {
        leftArm = 60;
        rightArm = 60;
        leftElbow = 75;
        rightElbow = 75;
      }
    }
    // Priority 7: Arms raised/extended
    else if (handIntent.raised) {
      if (handIntent.oneArmOnly) {
        // One arm raised to the side, other relaxed at side
        rightArm = -50;    // Right arm raised up and out
        rightElbow = 15;   // Slight elbow bend
        leftArm = 12;      // Left arm relaxed at side
        leftElbow = 10;
      } else {
        // Both arms extended gracefully
      leftArm = -35;
      rightArm = -35;
      leftElbow = 20;
      rightElbow = 20;
      // More dramatic when standing
      if (!isSitting && !isReclining) {
        leftArm = -45;
        rightArm = -45;
      }
    }
    }
    // Priority 8: Arms behind back - arms go inward (behind body in 2D representation)
    else if (handIntent.behindBack) {
      // Negative values simulate arms going behind body in 2D representation
      // Negative arm angles make arms go inward toward center (simulating behind body)
      leftArm = -30;     // Arm angles inward
      rightArm = -30;    // Arm angles inward
      leftElbow = -40;   // Forearm angles further back/inward
      rightElbow = -40;
    }
    // Priority 9: Hand in pocket
    else if (handIntent.inPocket) {
      if (isSitting) {
        // Harder to reach pocket when sitting
        rightArm = 50;
        rightElbow = 85;
        leftArm = 25;
        leftElbow = 15;
      } else {
        rightArm = 35;
        rightElbow = 95;
        leftArm = 12;
        leftElbow = 10;
      }
    }
    // Priority 10: Holding/adjusting
    else if (handIntent.holding) {
      leftArm = 30;
      rightArm = 35;
      leftElbow = 70;
      rightElbow = 65;
      handsOpen = false;
      // Adjust for sitting
      if (isSitting) {
        leftArm = 40;
        rightArm = 45;
      }
    }
    // Priority 11: Arms wrapped around torso
    else if (handIntent.wrapped) {
      // Wrapped arm uses negative angle to go inward around torso
      // One arm wrapped around torso (goes INWARD), other gesturing or relaxed
      leftArm = -20;   // Wrapped arm angles inward toward body
      rightArm = 15;   // Other arm relaxed at side
      leftElbow = 110; // Forearm wraps across torso
      rightElbow = 12;
    }
    // Priority 12: Hands clasped together
    else if (handIntent.clasped) {
      // Negative arm angles bring hands together at center
      // Hands in prayer/meditation position or loosely clasped - hands meet at CENTER
      leftArm = -10;    // Arms angle slightly inward
      rightArm = -10;
      leftElbow = 100;  // Forearms come together in front
      rightElbow = 100;
      handsOpen = false;
      // Adjust for sitting - hands in front at chest level
      if (isSitting) {
        leftArm = -5;
        rightArm = -5;
        leftElbow = 110;
        rightElbow = 110;
      }
    }
    // Priority 13: Paw gesture (only when BodyPose is "Innocent" and no other hand intent)
    else if (isPawGesture && !handIntent.touchingFace && !handIntent.touchingHair && 
             !handIntent.onHip && !handIntent.inPocket && !handIntent.holding) {
      // "Innocent" paw gesture - hands curled up near face/chest like paws
      // Arms come INWARD and UP, with elbows bent to bring hands near face
      leftArm = -35;     // Arms angle inward and upward
      rightArm = -35;
      leftElbow = 130;   // Elbows bent sharply to bring hands up near face
      rightElbow = 130;
      handsOpen = false; // Curled paw hands
    }
    // Default: Relaxed at sides - adjusted for body position
    else if (handIntent.atSides) {
      if (isSitting) {
        leftArm = 35;
        rightArm = 35;
        leftElbow = 25;
        rightElbow = 25;
      } else if (isLeaning) {
        leftArm = 20;
        rightArm = 15;
        leftElbow = 15;
        rightElbow = 20;
      } else if (isReclining) {
        leftArm = 10;
        rightArm = 15;
        leftElbow = 20;
        rightElbow = 15;
      } else if (isWalking) {
        // Arms swing slightly opposite to legs
        leftArm = 20;
        rightArm = 10;
        leftElbow = 25;
        rightElbow = 15;
      } else if (isRelaxedStance) {
        // Relaxed but elegant standing
        leftArm = 15;
        rightArm = 18;
        leftElbow = 12;
        rightElbow = 15;
      } else if (isDelicateStance) {
        // Soft, delicate standing with subtle arm positioning
        leftArm = 18;
        rightArm = 20;
        leftElbow = 15;
        rightElbow = 18;
      } else {
        leftArm = 12;
        rightArm = 12;
        leftElbow = 10;
        rightElbow = 10;
      }
    }
    // Final fallback: if no hand intent detected, use default relaxed position
    else {
      // No specific hand intent - use relaxed default based on body position
      if (isSitting) {
        leftArm = 35;
        rightArm = 35;
        leftElbow = 25;
        rightElbow = 25;
      } else if (isLeaning) {
        leftArm = 20;
        rightArm = 15;
        leftElbow = 15;
        rightElbow = 20;
      } else if (isReclining) {
        leftArm = 10;
        rightArm = 15;
        leftElbow = 20;
        rightElbow = 15;
      } else if (isWalking) {
        leftArm = 20;
        rightArm = 10;
        leftElbow = 25;
        rightElbow = 15;
      } else if (isPawGesture) {
        // Paw gesture as fallback - hands up near face like paws
        leftArm = -35;
        rightArm = -35;
        leftElbow = 130;
        rightElbow = 130;
        handsOpen = false;
      } else {
        leftArm = 12;
        rightArm = 12;
        leftElbow = 10;
        rightElbow = 10;
      }
    }
    
    // ===== VALIDATION: Check arm angles match pose intent (development only) =====
    if (process.env.NODE_ENV === 'development') {
      const poseName = `${armsTitleOriginal || 'Unknown'} / ${handsTitleOriginal || 'Unknown'}`;
      const validation = validateArmAngles(handIntent, leftArm, rightArm, poseName);
      
      if (!validation.isValid) {
        console.warn('⚠️ ARM ANGLE VALIDATION WARNING:', validation.errors);
        console.warn('Expected direction:', getExpectedArmDirection(handIntent));
        console.warn('Current values:', { leftArm, rightArm, leftElbow, rightElbow });
      }
    }
    
    // ===== STEP 5: Head position - comprehensive handling of all HeadPosition options =====
    // headRotate: positive = tilted right/looking right, negative = looking up (when applied as rotation)
    // We'll also track headTilt for up/down and headTurn for left/right turn separately
    let headTilt = 0;  // Up/down: positive = looking down, negative = looking up
    let headTurn = 0;  // Left/right turn: positive = turned right
    
    // EXACT MATCH for HeadPosition titles (most reliable)
    if (headTitleOriginal === "Neutral Forward-Facing Position") {
      headRotate = 0;
      headTilt = 0;
    } else if (headTitleOriginal === "Relaxed Natural Position") {
      headRotate = 0;
      headTilt = 5; // Slight downward relaxed position
    } else if (headTitleOriginal === "Slightly Tilted One Side") {
      headRotate = 12; // Tilted to one side
    } else if (headTitleOriginal === "Tilted Forward Chin Tucked") {
      headRotate = 0;
      headTilt = 18; // Looking down with chin tucked
    } else if (headTitleOriginal === "Angled Catch Light Cheekbone") {
      headRotate = 15;
      headTurn = 20; // Angled for dramatic lighting
    } else if (headTitleOriginal === "Tipped Back Listening Distant") {
      headRotate = 0;
      headTilt = -20; // Looking up as if listening
    } else if (headTitleOriginal === "Held High Confident Bearing") {
      headRotate = 0;
      headTilt = -10; // Chin up, confident
    } else if (headTitleOriginal === "Tilted Back Looking Upward") {
      headRotate = 0;
      headTilt = -25; // Looking up toward sky
    } else if (headTitleOriginal === "Three-Quarter Profile Turn") {
      headRotate = 0;
      headTurn = 35; // Three-quarter turn
      lookingAway = true;
    } else if (headTitleOriginal === "Looking Over Shoulder Turned") {
      headRotate = 0;
      headTurn = 45; // Looking over shoulder
      lookingAway = true;
    } else if (headTitleOriginal === "Fully Turned Complete Profile") {
      headRotate = 0;
      headTurn = 55; // Full profile
      lookingAway = true;
    } else if (headTitleOriginal === "Resting Hand Shoulder") {
      headRotate = 15; // Head tilted resting
      headTilt = 10;
    }
    
    // FALLBACK: Keyword matching for custom/package options
    if (headTurn === 0 && headTilt === 0 && headRotate === 0) {
      if (headText.includes('profile') || headText.includes('fully turned')) {
        headTurn = 50;
        lookingAway = true;
      } else if (headText.includes('three-quarter') || headText.includes('turned')) {
        headTurn = 35;
        lookingAway = true;
      } else if (headText.includes('over shoulder') || headText.includes('looking over')) {
        headTurn = 45;
        lookingAway = true;
      } else if (headText.includes('upward') || headText.includes('up toward') || headText.includes('looking up')) {
        headTilt = -22;
      } else if (headText.includes('tipped back') || headText.includes('listening')) {
        headTilt = -18;
      } else if (headText.includes('chin tucked') || headText.includes('forward')) {
        headTilt = 15;
      } else if (headText.includes('tilted') || headText.includes('tilt')) {
        headRotate = 12;
      } else if (headText.includes('angled') || headText.includes('catch light')) {
        headRotate = 15;
        headTurn = 15;
      } else if (headText.includes('high') || headText.includes('confident')) {
        headTilt = -8;
      } else if (headText.includes('resting') || headText.includes('shoulder')) {
        headRotate = 15;
        headTilt = 8;
      }
    }
    
    // Check specific BodyPose titles that affect head position
    if (bodyTitleOriginal.includes('Over-Shoulder') || bodyTitleOriginal.includes('Over Shoulder')) {
      headTurn = Math.max(headTurn, 40);
      lookingAway = true;
    } else if (bodyTitleOriginal.includes('Off-Camera') || bodyText.includes('off-camera') || 
               bodyText.includes('off camera')) {
      headTurn = Math.max(headTurn, 25);
      lookingAway = true;
    } else if (bodyText.includes('contemplative')) {
      headRotate = headRotate || 12;
    } else if (bodyText.includes('gaze upward')) {
      headTilt = Math.min(headTilt, -12);
    }
    
    // Head adjusts based on what hands are doing
    if (handIntent.touchingChin || handIntent.touchingHead) {
      headRotate += 12; // Head leans into the supporting hand
      headTilt += 5;
    } else if (handIntent.touchingLips) {
      headRotate += 5;
    } else if (handIntent.touchingHair) {
      headRotate -= 8; // Slight tilt away from the hand touching hair
    }
    
    // Combine headTurn into headRotate for the visual (simplified 2D representation)
    // The head rotation shows the turn effect
    headRotate += headTurn * 0.3;
    
    // ===== STEP 6: Torso adjustments - EXACT MATCH for all 13 options =====
    // Torso category ALWAYS takes priority over BodyPose-based initial value
    // 1. "Upright Composed Posture" - torso = 0 (neutral)
    // 2. "Straight Elongated Upper Body" - torso = 0 (neutral)
    // 3. "Relaxed Natural Spine Curve" - torso = 5 (slight forward)
    // 4. "Curved Back Soft Silhouette" - torso = 8 (forward curve)
    // 5. "Subtle Slouch" - torso = 12 (forward slouch)
    // 6. "Leaning Weight Shifted" - torso = -10 (leaning back/against)
    // 7. "Hip Shifted" - torso = 0 (hip shift, not torso rotation)
    // 8. "Twisted Over Shoulder" - torso = 15 (twist for over-shoulder)
    // 9. "Three-Quarter Turn Away" - torso = 10 (turn away)
    // 10. "Profile Natural Curves" - torso = 5 (slight turn)
    // 11. "Hunched Forward Contemplative" - torso = 15 (forward hunch)
    // 12. "Leaning Forward Engaged" - torso = 8 (forward lean)
    // 13. "Chest Forward Confident" - torso = -5 (back arch)
    
    // Check if Torso category has a selection - if so, it takes priority
    let torsoOverrideApplied = false;
    
    if (torsoTitleOriginal === "Upright Composed Posture" ||
        torsoTitleOriginal === "Straight Elongated Upper Body") {
      torso = 0; // Reset to neutral - completely upright
      torsoOverrideApplied = true;
    } else if (torsoTitleOriginal === "Relaxed Natural Spine Curve") {
      torso = 5; // Slight forward curve
      torsoOverrideApplied = true;
    } else if (torsoTitleOriginal === "Curved Back Soft Silhouette") {
      torso = 8; // More pronounced forward curve
      torsoOverrideApplied = true;
    } else if (torsoTitleOriginal === "Subtle Slouch") {
      torso = 12; // Forward slouch
      torsoOverrideApplied = true;
      // Slouching affects arm positions slightly
      leftArm += 5;
      rightArm += 5;
    } else if (torsoTitleOriginal === "Leaning Weight Shifted") {
      torso = -10; // Leaning back/against something
      torsoOverrideApplied = true;
    } else if (torsoTitleOriginal === "Hip Shifted") {
      // Hip shift doesn't change torso rotation, but affects stance
      torso = 0; // Keep neutral torso
      stance += 3;
      torsoOverrideApplied = true;
    } else if (torsoTitleOriginal === "Twisted Over Shoulder") {
      torso = 15; // Twist for over-shoulder look
      torsoOverrideApplied = true;
    } else if (torsoTitleOriginal === "Three-Quarter Turn Away") {
      torso = 10; // Turn away from camera
      torsoOverrideApplied = true;
    } else if (torsoTitleOriginal === "Profile Natural Curves") {
      torso = 5; // Slight turn to profile
      torsoOverrideApplied = true;
    } else if (torsoTitleOriginal === "Hunched Forward Contemplative") {
      torso = 15; // Forward hunch
      torsoOverrideApplied = true;
    } else if (torsoTitleOriginal === "Leaning Forward Engaged") {
      torso = 8; // Forward lean
      torsoOverrideApplied = true;
    } else if (torsoTitleOriginal === "Chest Forward Confident") {
      torso = -5; // Back arch (chest forward)
      torsoOverrideApplied = true;
    }
    
    // Fallback keyword matching - only if no exact match was found
    if (!torsoOverrideApplied && torsoTitleOriginal) {
      if (torsoText.includes('upright') || torsoText.includes('straight') || torsoText.includes('composed')) {
        torso = 0; // Reset to neutral
      } else if (torsoText.includes('twist') || torsoText.includes('turned')) {
        torso = 10; // Set absolute value, don't add
      } else if (torsoText.includes('lean') && torsoText.includes('back')) {
        torso = -10; // Leaning back
      } else if (torsoText.includes('lean') && torsoText.includes('forward')) {
        torso = 8; // Leaning forward
      } else if (torsoText.includes('slouch') || torsoText.includes('hunch')) {
        torso = 12; // Set absolute value
        leftArm += 5;
        rightArm += 5;
      } else if (torsoText.includes('arch') || (torsoText.includes('curve') && torsoText.includes('back'))) {
        torso = -5; // Back arch
      } else if (torsoText.includes('curve') || torsoText.includes('relaxed')) {
        torso = 5; // Slight forward curve
      }
    }
    
    // ===== STEP 7: Legs - consider body pose =====
    // EXACT MATCH for Legs titles (15 total options)
    // Update legsCrossed based on specific leg positions
    if (legsTitleOriginal === "Legs Crossed At Knee" ||
        legsTitleOriginal === "Crossed Legs Positioned Side" ||
        legsTitleOriginal === "Ankles Crossed" ||
        legsTitleOriginal === "One Ankle Crossed Over" ||
        legsTitleOriginal === "Standing Ankle Crossed Over") {
      legsCrossed = true;
    }
    // legsCrossed already set above, but ensure it's correct
    if (legsText.includes('apart') || legsText.includes('wide') || legsText.includes('stable')) {
      stance = isSitting ? 5 : 10;
    } else if (legsText.includes('together') || legsText.includes('parallel')) {
      stance = 0;
    }
    if (legsText.includes('bent') || legsText.includes('up')) {
      isKneeUp = true;
    }
    
    // ===== STEP 8: Feet - EXACT MATCH for all 10 options =====
    // 1. "Both Feet Flat Ground" - feetPointed = false
    // 2. "Feet Positioned Naturally Leaning" - feetPointed = false
    // 3. "Standing Ankle Crossed Over" - feetPointed = false
    // 4. "One Foot Pointed Ballet-Like" - feetPointed = true
    // 5. "Toes Pointed Downward Relaxed" - feetPointed = true
    // 6. "Feet Turned Slightly Inward" - feetPointed = false
    // 7. "Feet Tucked Under Body" - feetPointed = false (sitting)
    // 8. "Feet Natural Mid-Step Motion" - feetPointed = false, isWalking = true
    // 9. "Barefoot Walking Surf Water" - feetPointed = false, isWalking = true
    // 10. "Feet Dangling Elevated Surface" - feetPointed = false
    
    if (feetTitleOriginal === "One Foot Pointed Ballet-Like" ||
        feetTitleOriginal === "Toes Pointed Downward Relaxed") {
      feetPointed = true;
    } else if (feetTitleOriginal === "Feet Natural Mid-Step Motion" ||
               feetTitleOriginal === "Barefoot Walking Surf Water") {
      stance = 5;
      isWalking = true;
      feetPointed = false;
    } else {
      // All other feet options: flat or natural position
      feetPointed = false;
    }
    
    // Fallback keyword matching
    if (!feetPointed && (feetText.includes('point') || feetText.includes('ballet') || feetText.includes('toe'))) {
      feetPointed = true;
    }
    
    // ===== STEP 9: Hands visual state =====
    if (handsText.includes('fist') || handsText.includes('closed') || handsText.includes('clenched') || 
        handIntent.holding) {
      handsOpen = false;
    }
    
    // ===== STEP 10: FACIAL EXPRESSION - Eyes and Mouth =====
    // Expression state: determines eye and mouth shapes on the figure
    let eyeState = 'normal'; // normal, happy, closed, halfClosed, wide, intense, wistful, downcast
    let mouthState = 'neutral'; // neutral, smile, wideSmile, laugh, serious, slight, pout, open
    let eyebrowState = 'neutral'; // neutral, raised, furrowed, relaxed
    
    // EXACT MATCH for FacialExpression titles
    if (expressionTitleOriginal === "Genuine Laugh Unguarded Joy") {
      eyeState = 'happy'; // Crescent eyes
      mouthState = 'laugh';
      eyebrowState = 'raised';
    } else if (expressionTitleOriginal === "Natural Grace Carefree Happiness") {
      eyeState = 'happy';
      mouthState = 'smile';
    } else if (expressionTitleOriginal === "Playful Expressive Fun") {
      eyeState = 'wide';
      mouthState = 'wideSmile';
      eyebrowState = 'raised';
    } else if (expressionTitleOriginal === "Serene Calm Thoughtful") {
      eyeState = 'halfClosed';
      mouthState = 'slight';
    } else if (expressionTitleOriginal === "Relaxed Unaware Lost Thought") {
      eyeState = 'normal';
      mouthState = 'neutral';
      eyebrowState = 'relaxed';
    } else if (expressionTitleOriginal === "Serious Regal Presence") {
      eyeState = 'intense';
      mouthState = 'serious';
      eyebrowState = 'furrowed';
    } else if (expressionTitleOriginal === "Warm Friendly Approachable") {
      eyeState = 'normal';
      mouthState = 'smile';
    } else if (expressionTitleOriginal === "Soft but intelligent expression") {
      eyeState = 'normal';
      mouthState = 'slight';
    } else if (expressionTitleOriginal === "Contemplative Air Soft Mystery") {
      eyeState = 'halfClosed';
      mouthState = 'pout';
    } else if (expressionTitleOriginal === "Gentle Introspection") {
      eyeState = 'downcast';
      mouthState = 'neutral';
    } else if (expressionTitleOriginal === "Dreamy faraway look") {
      eyeState = 'halfClosed';
      mouthState = 'neutral';
      eyebrowState = 'relaxed';
    } else if (expressionTitleOriginal === "Wistful Expression") {
      eyeState = 'wistful';
      mouthState = 'slight';
    } else if (expressionTitleOriginal === "Half-Challenging Stare") {
      eyeState = 'intense';
      mouthState = 'slight';
      eyebrowState = 'furrowed';
    } else if (expressionTitleOriginal === "Direct Intense Gaze") {
      eyeState = 'intense';
      mouthState = 'neutral';
    } else if (expressionTitleOriginal === "Relaxed Confident Contemplative Introspection") {
      eyeState = 'normal';
      mouthState = 'slight';
      eyebrowState = 'relaxed';
    } else if (expressionTitleOriginal === "Captivating mysterious gaze") {
      eyeState = 'halfClosed';
      mouthState = 'pout';
    } else if (expressionTitleOriginal === "Mysterious and enigmatic allure") {
      eyeState = 'halfClosed';
      mouthState = 'slight';
    } else if (expressionTitleOriginal === "Intimate knowing expression") {
      eyeState = 'halfClosed';
      mouthState = 'smile';
    } else if (expressionTitleOriginal === "Vulnerable Exposed Emotional State") {
      eyeState = 'wide';
      mouthState = 'neutral';
      eyebrowState = 'raised';
    }
    
    // FALLBACK: Keyword matching for expressions
    if (eyeState === 'normal' && mouthState === 'neutral') {
      // Check expression keywords
      if (expressionText.includes('laugh') || expressionText.includes('joy') || expressionText.includes('unguarded')) {
        eyeState = 'happy';
        mouthState = 'laugh';
      } else if (expressionText.includes('happy') || expressionText.includes('carefree')) {
        eyeState = 'happy';
        mouthState = 'smile';
      } else if (expressionText.includes('playful') || expressionText.includes('fun')) {
        eyeState = 'wide';
        mouthState = 'wideSmile';
      } else if (expressionText.includes('serene') || expressionText.includes('calm') || expressionText.includes('thoughtful')) {
        eyeState = 'halfClosed';
        mouthState = 'slight';
      } else if (expressionText.includes('serious') || expressionText.includes('regal')) {
        eyeState = 'intense';
        mouthState = 'serious';
      } else if (expressionText.includes('warm') || expressionText.includes('friendly')) {
        mouthState = 'smile';
      } else if (expressionText.includes('contemplative') || expressionText.includes('mystery')) {
        eyeState = 'halfClosed';
        mouthState = 'pout';
      } else if (expressionText.includes('introspection') || expressionText.includes('gentle')) {
        eyeState = 'downcast';
      } else if (expressionText.includes('dreamy') || expressionText.includes('faraway')) {
        eyeState = 'halfClosed';
      } else if (expressionText.includes('wistful') || expressionText.includes('melancholy')) {
        eyeState = 'wistful';
        mouthState = 'slight';
      } else if (expressionText.includes('challenging') || expressionText.includes('intense') || expressionText.includes('direct')) {
        eyeState = 'intense';
      } else if (expressionText.includes('vulnerable') || expressionText.includes('exposed')) {
        eyeState = 'wide';
      } else if (expressionText.includes('mysterious') || expressionText.includes('enigmatic') || expressionText.includes('captivating')) {
        eyeState = 'halfClosed';
        mouthState = 'pout';
      } else if (expressionText.includes('knowing') || expressionText.includes('intimate')) {
        eyeState = 'halfClosed';
        mouthState = 'smile';
      }
    }
    
    // Override from Eyes category if specific
    if (eyesTitleOriginal.includes('Closed') || eyesText.includes('closed')) {
      eyeState = 'closed';
    } else if (eyesTitleOriginal.includes('Half-Closed') || eyesText.includes('half-closed') || eyesText.includes('sultry')) {
      eyeState = 'halfClosed';
    } else if (eyesTitleOriginal.includes('Wide') || eyesText.includes('wide')) {
      eyeState = 'wide';
    } else if (eyesTitleOriginal.includes('Sparkling') || eyesText.includes('sparkling') || eyesText.includes('joy') || eyesText.includes('laughter')) {
      eyeState = 'happy';
    } else if (eyesTitleOriginal.includes('Intense') || eyesTitleOriginal.includes('Piercing') || eyesText.includes('intense') || eyesText.includes('piercing')) {
      eyeState = 'intense';
    } else if (eyesTitleOriginal.includes('Lowered') || eyesTitleOriginal.includes('Downward') || eyesText.includes('lowered') || eyesText.includes('downward') || eyesText.includes('shyly')) {
      eyeState = 'downcast';
    } else if (eyesTitleOriginal.includes('Wistful') || eyesText.includes('wistful')) {
      eyeState = 'wistful';
    }
    
    // Override from Mouth category if specific
    if (mouthTitleOriginal.includes('Smile') || mouthTitleOriginal.includes('Smiling')) {
      if (mouthTitleOriginal.includes('Warm') || mouthTitleOriginal.includes('Genuine') || mouthText.includes('teeth')) {
        mouthState = 'wideSmile';
      } else if (mouthTitleOriginal.includes('Soft') || mouthTitleOriginal.includes('Subtle') || mouthTitleOriginal.includes('Slight')) {
        mouthState = 'slight';
      } else {
        mouthState = 'smile';
      }
    } else if (mouthTitleOriginal.includes('Serious') || mouthTitleOriginal.includes('Pressed') || mouthText.includes('serious') || mouthText.includes('pressed')) {
      mouthState = 'serious';
    } else if (mouthTitleOriginal.includes('Open') || mouthTitleOriginal.includes('Parted') || mouthText.includes('open') || mouthText.includes('parted')) {
      mouthState = 'open';
    } else if (mouthTitleOriginal.includes('Pout') || mouthText.includes('pout')) {
      mouthState = 'pout';
    } else if (mouthTitleOriginal.includes('Smirk') || mouthText.includes('smirk')) {
      mouthState = 'slight';
    }
    
    // ===== STEP 8: Body Size / Body Fat Percentage - affects figure dimensions =====
    // Calculate scale factor based on body fat percentage
    // Base scale is 1.0 for average (18-22%)
    let bodyScale = 1.0; // Default to average
    let shoulderWidthScale = 1.0;
    let hipWidthScale = 1.0;
    let torsoWidthScale = 1.0;
    
    if (bodySizeTitleOriginal === "Athletic Lean (8-12% Body Fat)") {
      bodyScale = 0.85; // Smaller, leaner
      shoulderWidthScale = 0.9; // Narrower shoulders
      hipWidthScale = 0.8; // Narrower hips
      torsoWidthScale = 0.85;
    } else if (bodySizeTitleOriginal === "Fit Toned (13-17% Body Fat)") {
      bodyScale = 0.92; // Slightly smaller, toned
      shoulderWidthScale = 0.95;
      hipWidthScale = 0.88;
      torsoWidthScale = 0.92;
    } else if (bodySizeTitleOriginal === "Average Healthy (18-22% Body Fat)") {
      bodyScale = 1.0; // Average - baseline
      shoulderWidthScale = 1.0;
      hipWidthScale = 1.0;
      torsoWidthScale = 1.0;
    } else if (bodySizeTitleOriginal === "Curvy Soft (23-27% Body Fat)") {
      bodyScale = 1.12; // Larger, curvier
      shoulderWidthScale = 1.05;
      hipWidthScale = 1.2; // Wider hips
      torsoWidthScale = 1.1;
    } else if (bodySizeTitleOriginal === "Full Figured (28-32% Body Fat)") {
      bodyScale = 1.25; // Larger, fuller
      shoulderWidthScale = 1.1;
      hipWidthScale = 1.35; // Much wider hips
      torsoWidthScale = 1.2;
    } else if (bodySizeTitleOriginal === "Plus Size (33%+ Body Fat)") {
      bodyScale = 1.4; // Largest
      shoulderWidthScale = 1.15;
      hipWidthScale = 1.5; // Widest hips
      torsoWidthScale = 1.3;
    }
    
    return { 
      head: headRotate, 
      headTilt,
      headTurn,
      torso, 
      leftArm, 
      rightArm,
      leftElbow,
      rightElbow,
      stance, 
      isSitting, 
      isLeaning, 
      isReclining,
      isWalking,
      isKneeUp,
      legsCrossed,
      lookingAway,
      handsOpen,
      feetPointed,
      legsBent,
      // Facial expression states
      eyeState,
      mouthState,
      eyebrowState,
      // Body size scaling
      bodyScale,
      shoulderWidthScale,
      hipWidthScale,
      torsoWidthScale
    };
  }, [selections, categories]);

  const transition = { 
    type: 'spring', 
    stiffness: 80, 
    damping: 20 
  };

  // Figure measurements - adjust for pose type
  const { 
    isSitting, isLeaning, isReclining, isWalking, isKneeUp, legsCrossed, 
    lookingAway, handsOpen, feetPointed, legsBent,
    headTilt, headTurn, eyeState, mouthState, eyebrowState,
    bodyScale, shoulderWidthScale, hipWidthScale, torsoWidthScale
  } = poseVariant;
  
  
  // Joint size - increased for better visibility and easier clicking
  const jointSize = 6; // Visual size (increased from 4)
  const jointHitSize = 12; // Clickable hit area (much larger for easier interaction)
  
  // Accent color for interactive joints
  const jointColor = categoryColors?.['BodyPose'] || '#10b981';

  // Get accent color from categoryColors - use it to tint the figure based on pose
  const accentColor = categoryColors?.['BodyPose'] || '#10b981';
  const baseStroke = 'rgba(255, 255, 255, 0.35)';
  // Subtly tint the figure with accent color when in non-standing pose
  const strokeColor = (isSitting || isLeaning || isReclining) 
    ? `${accentColor}99` // 60% opacity accent 
    : baseStroke;
  
  // Adjust vertical positions based on pose
  let headY = isSitting ? 80 : isReclining ? 120 : 45;
  // Apply body scale to head size
  const headSize = 28 * bodyScale;
  let neckY = headY + headSize + 8;
  let shoulderY = neckY + 15;
  // Apply body scale to torso length
  let torsoLength = (isSitting ? 80 : 100) * bodyScale;
  let torsoBottom = shoulderY + torsoLength;
  let hipY = torsoBottom + 5;
  // Apply body scale to leg length
  let legLength = (isSitting ? 80 : 140) * bodyScale;
  
  // Apply body scale to widths
  const shoulderWidth = 30 * shoulderWidthScale;
  const hipWidth = 20 * hipWidthScale;
  const torsoWidth = 15 * torsoWidthScale;

  // Leg angles for different poses
  let leftLegAngle = 0;
  let rightLegAngle = 0;
  
  if (isSitting) {
    if (legsCrossed) {
      // Crossed legs - one over the other, angled to the side
      leftLegAngle = 85;   // More horizontal
      rightLegAngle = 60;  // Lower leg
    } else if (isKneeUp) {
      // One knee drawn up (for arm resting on knee)
      leftLegAngle = 75;   // Lower leg more horizontal
      rightLegAngle = 45;  // Right knee drawn up more
    } else {
      leftLegAngle = 70;  // Legs bent forward
      rightLegAngle = 75;
    }
  } else if (isReclining && isKneeUp) {
    // Reclining with one knee up
    rightLegAngle = 35;  // Knee bent up
    leftLegAngle = 10;   // Other leg more extended
  }

  // Click handler for body parts
  const handlePartClick = (category) => {
    if (onPartClick) {
      onPartClick(category);
    }
  };

  // Hover styles for interactive parts
  const getInteractiveProps = (category) => ({
    style: { 
      cursor: onPartClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease'
    },
    onMouseEnter: () => setHoveredPart(category),
    onMouseLeave: () => setHoveredPart(null),
    onClick: () => handlePartClick(category)
  });

  // Get highlight color when hovered
  const getPartColor = (category, defaultColor) => {
    if (hoveredPart === category) {
      return categoryColors?.[category] || '#10b981';
    }
    return defaultColor;
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
    >
      <defs>
        <clipPath id="figureClip">
          <rect x="0" y="0" width={width} height={height} />
        </clipPath>
      </defs>
      {/* Main figure group */}
      <motion.g
        animate={{ 
          x: poseVariant.stance,
          rotate: isReclining ? -45 : isLeaning ? -8 : 0
        }}
        transition={transition}
        style={{ transformOrigin: `${centerX}px ${height / 2}px` }}
        clipPath="url(#figureClip)"
      >
        {/* Head - Click to edit HeadPosition - includes facial expressions */}
        <motion.g
          animate={{ 
            rotate: poseVariant.head,
            y: headTilt * 0.3 // Subtle vertical offset for head tilt effect
          }}
          transition={transition}
          style={{ transformOrigin: `${centerX}px ${headY}px` }}
          {...getInteractiveProps('HeadPosition')}
        >
          {/* Head circle */}
          <circle
            cx={centerX}
            cy={headY}
            r={headSize}
            fill={hoveredPart === 'HeadPosition' ? 'rgba(255,255,255,0.1)' : 'none'}
            stroke={getPartColor('HeadPosition', strokeColor)}
            strokeWidth={hoveredPart === 'HeadPosition' ? 3 : 2}
          />
          
          {/* FACIAL EXPRESSION GROUP - Click to edit FacialExpression */}
          <g {...getInteractiveProps('FacialExpression')}>
            {/* Eye positions adjusted for head turn */}
            {(() => {
              const eyeY = headY - 5;
              const leftEyeX = centerX - 8 + (lookingAway ? 4 : 0) + (headTurn || 0) * 0.1;
              const rightEyeX = centerX + 8 + (lookingAway ? 6 : 0) + (headTurn || 0) * 0.1;
              const eyeColor = categoryColors?.['FacialExpression'] || accentColor;
              
              // Render eyes based on eyeState
              const renderEye = (x, isRight) => {
                const eyeScale = isRight && lookingAway ? 0.8 : 1;
                const eyeOpacity = isRight && lookingAway ? 0.5 : 0.85;
                
                // Base eye element
                let eyeElement;
                switch (eyeState) {
                  case 'happy':
                    // Crescent eyes (happy/laughing)
                    eyeElement = (
                      <motion.path
                        d={`M ${x - 4 * eyeScale} ${eyeY} Q ${x} ${eyeY - 5 * eyeScale} ${x + 4 * eyeScale} ${eyeY}`}
                        fill="none"
                        stroke={eyeColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity={eyeOpacity}
                        animate={{ pathLength: 1 }}
                        transition={transition}
                      />
                    );
                    break;
                  case 'closed':
                    // Closed eyes (horizontal line)
                    eyeElement = (
                      <motion.line
                        x1={x - 4 * eyeScale}
                        y1={eyeY}
                        x2={x + 4 * eyeScale}
                        y2={eyeY}
                        stroke={eyeColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity={eyeOpacity}
                      />
                    );
                    break;
                  case 'halfClosed':
                    // Half-closed eyes (smaller, slightly drooped)
                    eyeElement = (
                      <motion.ellipse
                        cx={x}
                        cy={eyeY + 1}
                        rx={3 * eyeScale}
                        ry={1.5 * eyeScale}
                        fill={eyeColor}
                        opacity={eyeOpacity * 0.8}
                      />
                    );
                    break;
                  case 'wide':
                    // Wide eyes (larger circles)
                    eyeElement = (
                      <motion.circle
                        cx={x}
                        cy={eyeY}
                        r={4 * eyeScale}
                        fill={eyeColor}
                        opacity={eyeOpacity}
                      />
                    );
                    break;
                  case 'intense':
                    // Intense eyes (smaller, focused)
                    eyeElement = (
                      <>
                        <motion.circle
                          cx={x}
                          cy={eyeY}
                          r={3 * eyeScale}
                          fill={eyeColor}
                          opacity={eyeOpacity}
                        />
                        <motion.circle
                          cx={x}
                          cy={eyeY}
                          r={1.5 * eyeScale}
                          fill="rgba(255,255,255,0.5)"
                        />
                      </>
                    );
                    break;
                  case 'downcast':
                    // Downcast eyes (looking down)
                    eyeElement = (
                      <motion.ellipse
                        cx={x}
                        cy={eyeY + 2}
                        rx={2.5 * eyeScale}
                        ry={2 * eyeScale}
                        fill={eyeColor}
                        opacity={eyeOpacity * 0.7}
                      />
                    );
                    break;
                  case 'wistful':
                    // Wistful eyes (slightly larger, upward looking)
                    eyeElement = (
                      <motion.ellipse
                        cx={x}
                        cy={eyeY - 1}
                        rx={3 * eyeScale}
                        ry={2.5 * eyeScale}
                        fill={eyeColor}
                        opacity={eyeOpacity * 0.75}
                      />
                    );
                    break;
                  default: // 'normal'
                    eyeElement = (
                      <motion.circle
                        cx={x}
                        cy={eyeY}
                        r={3 * eyeScale}
                        fill={eyeColor}
                        opacity={eyeOpacity}
                        animate={{ opacity: [eyeOpacity * 0.7, eyeOpacity, eyeOpacity * 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    );
                }
                
                // Add sparkle effects when aesthetic filter is active
                if (showAestheticFilter && eyeState !== 'closed') {
                  return (
                    <g>
                      {eyeElement}
                      {/* Sparkle effect at eye position */}
                      <motion.g
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [0, 1.2, 1, 1.2, 1],
                          opacity: [0, 1, 0.8, 1, 0.8]
                        }}
                        transition={{ 
                          delay: 0.5, 
                          duration: 0.6,
                          repeat: Infinity,
                          repeatDelay: 2,
                          repeatType: 'reverse'
                        }}
                      >
                        {/* Main sparkle circle */}
                        <circle
                          cx={x}
                          cy={eyeY}
                          r="2"
                          fill="rgba(255, 255, 255, 0.9)"
                          opacity="0.9"
                        >
                          <animate
                            attributeName="r"
                            values="2;3;2"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* Cross sparkle lines */}
                        <line
                          x1={x}
                          y1={eyeY - 4}
                          x2={x}
                          y2={eyeY + 4}
                          stroke="rgba(255, 255, 255, 0.9)"
                          strokeWidth="0.5"
                          opacity="0.9"
                        />
                        <line
                          x1={x - 4}
                          y1={eyeY}
                          x2={x + 4}
                          y2={eyeY}
                          stroke="rgba(255, 255, 255, 0.9)"
                          strokeWidth="0.5"
                          opacity="0.9"
                        />
                        {/* Diagonal sparkle lines */}
                        <line
                          x1={x - 3}
                          y1={eyeY - 3}
                          x2={x + 3}
                          y2={eyeY + 3}
                          stroke="rgba(255, 255, 255, 0.7)"
                          strokeWidth="0.4"
                          opacity="0.7"
                        />
                        <line
                          x1={x - 3}
                          y1={eyeY + 3}
                          x2={x + 3}
                          y2={eyeY - 3}
                          stroke="rgba(255, 255, 255, 0.7)"
                          strokeWidth="0.4"
                          opacity="0.7"
                        />
                        {/* Glow effect */}
                        <circle
                          cx={x}
                          cy={eyeY}
                          r="4"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.4)"
                          strokeWidth="1"
                          opacity="0.6"
                        >
                          <animate
                            attributeName="r"
                            values="4;6;4"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.6;0.3;0.6"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </motion.g>
                    </g>
                  );
                }
                
                return eyeElement;
              };
              
              // Render mouth based on mouthState
              const mouthY = headY + 8;
              const mouthColor = strokeColor;
              
              const renderMouth = () => {
                switch (mouthState) {
                  case 'smile':
                    return (
                      <motion.path
                        d={`M ${centerX - 6} ${mouthY} Q ${centerX} ${mouthY + 5} ${centerX + 6} ${mouthY}`}
                        fill="none"
                        stroke={mouthColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    );
                  case 'wideSmile':
                    return (
                      <motion.path
                        d={`M ${centerX - 8} ${mouthY - 1} Q ${centerX} ${mouthY + 7} ${centerX + 8} ${mouthY - 1}`}
                        fill="none"
                        stroke={mouthColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    );
                  case 'laugh':
                    return (
                      <>
                        <motion.path
                          d={`M ${centerX - 8} ${mouthY - 2} Q ${centerX} ${mouthY + 8} ${centerX + 8} ${mouthY - 2}`}
                          fill="none"
                          stroke={mouthColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <motion.ellipse
                          cx={centerX}
                          cy={mouthY + 2}
                          rx={5}
                          ry={3}
                          fill="rgba(255,255,255,0.1)"
                          stroke={mouthColor}
                          strokeWidth="0.5"
                        />
                      </>
                    );
                  case 'serious':
                    return (
                      <motion.line
                        x1={centerX - 5}
                        y1={mouthY + 1}
                        x2={centerX + 5}
                        y2={mouthY + 1}
                        stroke={mouthColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    );
                  case 'slight':
                    return (
                      <motion.path
                        d={`M ${centerX - 4} ${mouthY} Q ${centerX} ${mouthY + 2.5} ${centerX + 4} ${mouthY}`}
                        fill="none"
                        stroke={mouthColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    );
                  case 'pout':
                    return (
                      <motion.path
                        d={`M ${centerX - 4} ${mouthY + 2} Q ${centerX} ${mouthY - 1} ${centerX + 4} ${mouthY + 2}`}
                        fill="none"
                        stroke={mouthColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    );
                  case 'open':
                    return (
                      <motion.ellipse
                        cx={centerX}
                        cy={mouthY + 1}
                        rx={4}
                        ry={3}
                        fill="rgba(0,0,0,0.3)"
                        stroke={mouthColor}
                        strokeWidth="1.5"
                      />
                    );
                  default: // 'neutral'
                    return (
                      <motion.line
                        x1={centerX - 4}
                        y1={mouthY}
                        x2={centerX + 4}
                        y2={mouthY}
                        stroke={mouthColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    );
                }
              };
              
              // Optional eyebrows for certain expressions
              const renderEyebrows = () => {
                if (eyebrowState === 'neutral') return null;
                
                const browY = eyeY - 7;
                const browColor = strokeColor;
                
                switch (eyebrowState) {
                  case 'raised':
                    return (
                      <>
                        <motion.path
                          d={`M ${leftEyeX - 5} ${browY + 1} Q ${leftEyeX} ${browY - 2} ${leftEyeX + 5} ${browY + 1}`}
                          fill="none"
                          stroke={browColor}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <motion.path
                          d={`M ${rightEyeX - 5} ${browY + 1} Q ${rightEyeX} ${browY - 2} ${rightEyeX + 5} ${browY + 1}`}
                          fill="none"
                          stroke={browColor}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </>
                    );
                  case 'furrowed':
                    return (
                      <>
                        <motion.line
                          x1={leftEyeX - 4}
                          y1={browY}
                          x2={leftEyeX + 4}
                          y2={browY + 2}
                          stroke={browColor}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <motion.line
                          x1={rightEyeX - 4}
                          y1={browY + 2}
                          x2={rightEyeX + 4}
                          y2={browY}
                          stroke={browColor}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </>
                    );
                  case 'relaxed':
                    return (
                      <>
                        <motion.line
                          x1={leftEyeX - 4}
                          y1={browY + 1}
                          x2={leftEyeX + 4}
                          y2={browY}
                          stroke={browColor}
                          strokeWidth="1"
                          strokeLinecap="round"
                          opacity={0.5}
                        />
                        <motion.line
                          x1={rightEyeX - 4}
                          y1={browY}
                          x2={rightEyeX + 4}
                          y2={browY + 1}
                          stroke={browColor}
                          strokeWidth="1"
                          strokeLinecap="round"
                          opacity={0.5}
                        />
                      </>
                    );
                  default:
                    return null;
                }
              };
              
              return (
                <>
                  {/* Left eye */}
                  {renderEye(leftEyeX, false)}
                  {/* Right eye */}
                  {renderEye(rightEyeX, true)}
                  {/* Mouth */}
                  {renderMouth()}
                  {/* Eyebrows */}
                  {renderEyebrows()}
                </>
              );
            })()}
          </g>
        </motion.g>

        {/* Neck */}
        <line
          x1={centerX}
          y1={headY + headSize}
          x2={centerX}
          y2={shoulderY}
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Torso - Click to edit Torso */}
        <motion.g
          animate={{ rotate: poseVariant.torso }}
          transition={transition}
          style={{ transformOrigin: `${centerX}px ${shoulderY}px` }}
          {...getInteractiveProps('Torso')}
        >
          {/* Shoulders */}
          <line
            x1={centerX - shoulderWidth}
            y1={shoulderY}
            x2={centerX + shoulderWidth}
            y2={shoulderY}
            stroke={getPartColor('Torso', strokeColor)}
            strokeWidth={hoveredPart === 'Torso' ? 3 : 2}
            strokeLinecap="round"
          />
          
          {/* Spine */}
          <line
            x1={centerX}
            y1={shoulderY}
            x2={centerX}
            y2={torsoBottom}
            stroke={getPartColor('Torso', strokeColor)}
            strokeWidth={hoveredPart === 'Torso' ? 3 : 2}
            strokeLinecap="round"
          />

          {/* Hips */}
          <line
            x1={centerX - hipWidth}
            y1={hipY}
            x2={centerX + hipWidth}
            y2={hipY}
            stroke={getPartColor('Torso', strokeColor)}
            strokeWidth={hoveredPart === 'Torso' ? 3 : 2}
            strokeLinecap="round"
          />
        </motion.g>

        {/* Shoulder joints */}
        <g>
          <circle
            cx={centerX - shoulderWidth}
            cy={shoulderY}
            r={jointHitSize}
            fill="transparent"
            stroke="none"
            style={{ cursor: onPartClick ? 'pointer' : 'default' }}
            {...getInteractiveProps('Arms')}
          />
          <circle cx={centerX - shoulderWidth} cy={shoulderY} r={jointSize} fill={strokeColor} />
        </g>
        <g>
          <circle
            cx={centerX + shoulderWidth}
            cy={shoulderY}
            r={jointHitSize}
            fill="transparent"
            stroke="none"
            style={{ cursor: onPartClick ? 'pointer' : 'default' }}
            {...getInteractiveProps('Arms')}
          />
          <circle cx={centerX + shoulderWidth} cy={shoulderY} r={jointSize} fill={strokeColor} />
        </g>

        {/* Left Arm - Click to edit Arms */}
        <motion.g {...getInteractiveProps('Arms')}>
          <motion.line
            x1={centerX - shoulderWidth}
            y1={shoulderY}
            animate={{
              x2: centerX - shoulderWidth - Math.sin(poseVariant.leftArm * Math.PI / 180) * 35 * bodyScale,
              y2: shoulderY + Math.cos(poseVariant.leftArm * Math.PI / 180) * 35 * bodyScale
            }}
            transition={transition}
            stroke={getPartColor('Arms', strokeColor)}
            strokeWidth={hoveredPart === 'Arms' ? 3 : 2}
            strokeLinecap="round"
          />
          {/* Left Elbow joint */}
          <g>
            <circle
              cx={centerX - shoulderWidth - Math.sin(poseVariant.leftArm * Math.PI / 180) * 35 * bodyScale}
              cy={shoulderY + Math.cos(poseVariant.leftArm * Math.PI / 180) * 35 * bodyScale}
              r={jointHitSize}
              fill="transparent"
              stroke="none"
              style={{ cursor: onPartClick ? 'pointer' : 'default' }}
              {...getInteractiveProps('Arms')}
            />
            <motion.circle
              animate={{
                cx: centerX - shoulderWidth - Math.sin(poseVariant.leftArm * Math.PI / 180) * 35 * bodyScale,
                cy: shoulderY + Math.cos(poseVariant.leftArm * Math.PI / 180) * 35 * bodyScale
              }}
              r={jointSize}
              fill={hoveredPart === 'Arms' ? getPartColor('Arms', accentColor) : accentColor}
              opacity={hoveredPart === 'Arms' ? 1 : 0.7}
              transition={transition}
            />
          </g>
          {/* Left Forearm */}
          <motion.line
            animate={{
              x1: centerX - shoulderWidth - Math.sin(poseVariant.leftArm * Math.PI / 180) * 35 * bodyScale,
              y1: shoulderY + Math.cos(poseVariant.leftArm * Math.PI / 180) * 35 * bodyScale,
              x2: centerX - shoulderWidth - Math.sin(poseVariant.leftArm * Math.PI / 180) * 35 * bodyScale - Math.sin((poseVariant.leftArm + poseVariant.leftElbow) * Math.PI / 180) * 35 * bodyScale,
              y2: shoulderY + Math.cos(poseVariant.leftArm * Math.PI / 180) * 35 * bodyScale + Math.cos((poseVariant.leftArm + poseVariant.leftElbow) * Math.PI / 180) * 35 * bodyScale
            }}
            transition={transition}
            stroke={getPartColor('Arms', strokeColor)}
            strokeWidth={hoveredPart === 'Arms' ? 3 : 2}
            strokeLinecap="round"
          />
          {/* Left Hand - Click to edit Hands */}
          <motion.circle
            {...getInteractiveProps('Hands')}
            animate={{
              cx: centerX - shoulderWidth - Math.sin(poseVariant.leftArm * Math.PI / 180) * 35 * bodyScale - Math.sin((poseVariant.leftArm + poseVariant.leftElbow) * Math.PI / 180) * 35 * bodyScale,
              cy: shoulderY + Math.cos(poseVariant.leftArm * Math.PI / 180) * 35 * bodyScale + Math.cos((poseVariant.leftArm + poseVariant.leftElbow) * Math.PI / 180) * 35 * bodyScale
            }}
            r={hoveredPart === 'Hands' ? 8 : (handsOpen ? 6 : 5)}
            fill={hoveredPart === 'Hands' ? getPartColor('Hands', 'rgba(255,255,255,0.2)') : (handsOpen ? 'none' : strokeColor)}
            stroke={getPartColor('Hands', strokeColor)}
            strokeWidth={hoveredPart === 'Hands' ? 3 : 2}
            transition={transition}
          />
        </motion.g>

        {/* Right Arm - Click to edit Arms */}
        <motion.g {...getInteractiveProps('Arms')}>
          <motion.line
            x1={centerX + shoulderWidth}
            y1={shoulderY}
            animate={{
              x2: centerX + shoulderWidth + Math.sin(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale,
              y2: shoulderY + Math.cos(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale
            }}
            transition={transition}
            stroke={getPartColor('Arms', strokeColor)}
            strokeWidth={hoveredPart === 'Arms' ? 3 : 2}
            strokeLinecap="round"
          />
          {/* Right Elbow joint */}
          <g>
            <circle
              cx={centerX + shoulderWidth + Math.sin(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale}
              cy={shoulderY + Math.cos(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale}
              r={jointHitSize}
              fill="transparent"
              stroke="none"
              style={{ cursor: onPartClick ? 'pointer' : 'default' }}
              {...getInteractiveProps('Arms')}
            />
            <motion.circle
              animate={{
                cx: centerX + shoulderWidth + Math.sin(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale,
                cy: shoulderY + Math.cos(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale
              }}
              r={jointSize}
              fill={hoveredPart === 'Arms' ? getPartColor('Arms', accentColor) : accentColor}
              opacity={hoveredPart === 'Arms' ? 1 : 0.7}
              transition={transition}
            />
          </g>
          {/* Right Forearm */}
          <motion.line
            animate={{
              x1: centerX + shoulderWidth + Math.sin(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale,
              y1: shoulderY + Math.cos(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale,
              x2: centerX + shoulderWidth + Math.sin(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale + Math.sin((poseVariant.rightArm + poseVariant.rightElbow) * Math.PI / 180) * 35 * bodyScale,
              y2: shoulderY + Math.cos(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale + Math.cos((poseVariant.rightArm + poseVariant.rightElbow) * Math.PI / 180) * 35 * bodyScale
            }}
            transition={transition}
            stroke={getPartColor('Arms', strokeColor)}
            strokeWidth={hoveredPart === 'Arms' ? 3 : 2}
            strokeLinecap="round"
          />
          {/* Right Hand - Click to edit Hands */}
          <motion.circle
            {...getInteractiveProps('Hands')}
            animate={{
              cx: centerX + shoulderWidth + Math.sin(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale + Math.sin((poseVariant.rightArm + poseVariant.rightElbow) * Math.PI / 180) * 35 * bodyScale,
              cy: shoulderY + Math.cos(poseVariant.rightArm * Math.PI / 180) * 35 * bodyScale + Math.cos((poseVariant.rightArm + poseVariant.rightElbow) * Math.PI / 180) * 35 * bodyScale
            }}
            r={hoveredPart === 'Hands' ? 8 : (handsOpen ? 6 : 5)}
            fill={hoveredPart === 'Hands' ? getPartColor('Hands', 'rgba(255,255,255,0.2)') : (handsOpen ? 'none' : strokeColor)}
            stroke={getPartColor('Hands', strokeColor)}
            strokeWidth={hoveredPart === 'Hands' ? 3 : 2}
            transition={transition}
          />
        </motion.g>

        {/* Hip joints - Click to edit Legs */}
        <g {...getInteractiveProps('Legs')}>
          <circle cx={centerX - hipWidth} cy={hipY} r={jointHitSize} fill="transparent" stroke="none" />
          <circle cx={centerX + hipWidth} cy={hipY} r={jointHitSize} fill="transparent" stroke="none" />
          <circle cx={centerX - hipWidth} cy={hipY} r={jointSize} fill={getPartColor('Legs', strokeColor)} />
          <circle cx={centerX + hipWidth} cy={hipY} r={jointSize} fill={getPartColor('Legs', strokeColor)} />
        </g>

        {/* Legs - different rendering for sitting vs standing - Click to edit Legs */}
        <g {...getInteractiveProps('Legs')}>
        {isSitting ? (
          legsCrossed ? (
            <>
              {/* Crossed legs - left leg crosses over to the right side */}
              {/* Left thigh - goes across to the right */}
              <motion.line
                x1={centerX - 10}
                y1={hipY}
                animate={{
                  x2: centerX + 35,
                  y2: hipY + 30
                }}
                transition={transition}
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Left Knee */}
              <g>
                <circle
                  cx={centerX + 35}
                  cy={hipY + 30}
                  r={jointHitSize}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: onPartClick ? 'pointer' : 'default' }}
                  {...getInteractiveProps('Legs')}
                />
                <motion.circle
                  cx={centerX + 35}
                  cy={hipY + 30}
                  r={jointSize}
                  fill={accentColor}
                  opacity={0.7}
                />
              </g>
              {/* Left lower leg - hangs down from crossed position */}
              <motion.line
                animate={{
                  x1: centerX + 35,
                  y1: hipY + 30,
                  x2: centerX + 25,
                  y2: hipY + 75
                }}
                transition={transition}
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Left Foot */}
              <g>
                <circle
                  cx={centerX + 25}
                  cy={hipY + 80}
                  r={jointHitSize}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: onPartClick ? 'pointer' : 'default' }}
                  {...getInteractiveProps('Feet')}
                />
                <motion.ellipse
                  cx={centerX + 25}
                  cy={hipY + 80}
                  rx={feetPointed ? 3 : 6}
                  ry={feetPointed ? 6 : 3}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2"
                />
              </g>
              
              {/* Right thigh - goes out to the side */}
              <motion.line
                x1={centerX + 10}
                y1={hipY}
                animate={{
                  x2: centerX + 50,
                  y2: hipY + 45
                }}
                transition={transition}
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Right Knee */}
              <g>
                <circle
                  cx={centerX + 50}
                  cy={hipY + 45}
                  r={jointHitSize}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: onPartClick ? 'pointer' : 'default' }}
                  {...getInteractiveProps('Legs')}
                />
                <motion.circle
                  cx={centerX + 50}
                  cy={hipY + 45}
                  r={jointSize}
                  fill={accentColor}
                  opacity={0.7}
                />
              </g>
              {/* Right lower leg - hangs down */}
              <motion.line
                animate={{
                  x1: centerX + 50,
                  y1: hipY + 45,
                  x2: centerX + 40,
                  y2: hipY + 85
                }}
                transition={transition}
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Right Foot */}
              <g>
                <circle
                  cx={centerX + 40}
                  cy={hipY + 90}
                  r={jointHitSize}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: onPartClick ? 'pointer' : 'default' }}
                  {...getInteractiveProps('Feet')}
                />
                <motion.ellipse
                  cx={centerX + 40}
                  cy={hipY + 90}
                  rx={feetPointed ? 3 : 6}
                  ry={feetPointed ? 6 : 3}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2"
                />
              </g>
            </>
          ) : (
            <>
              {/* Regular sitting - legs bent forward with knees and feet */}
              {/* Left Thigh */}
              <motion.line
                x1={centerX - 15}
                y1={hipY}
                animate={{
                  x2: centerX - 15 + Math.cos(leftLegAngle * Math.PI / 180) * 50,
                  y2: hipY + Math.sin(leftLegAngle * Math.PI / 180) * 50
                }}
                transition={transition}
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Left Knee */}
              <g>
                <motion.circle
                  animate={{
                    cx: centerX - 15 + Math.cos(leftLegAngle * Math.PI / 180) * 50,
                    cy: hipY + Math.sin(leftLegAngle * Math.PI / 180) * 50
                  }}
                  r={jointHitSize}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: onPartClick ? 'pointer' : 'default' }}
                  {...getInteractiveProps('Legs')}
                  transition={transition}
                />
                <motion.circle
                  animate={{
                    cx: centerX - 15 + Math.cos(leftLegAngle * Math.PI / 180) * 50,
                    cy: hipY + Math.sin(leftLegAngle * Math.PI / 180) * 50
                  }}
                  r={jointSize}
                  fill={accentColor}
                  opacity={0.7}
                  transition={transition}
                />
              </g>
              {/* Left Calf */}
              <motion.line
                animate={{
                  x1: centerX - 15 + Math.cos(leftLegAngle * Math.PI / 180) * 50,
                  y1: hipY + Math.sin(leftLegAngle * Math.PI / 180) * 50,
                  x2: centerX - 15 + Math.cos(leftLegAngle * Math.PI / 180) * 50 - 10,
                  y2: hipY + Math.sin(leftLegAngle * Math.PI / 180) * 50 + 45
                }}
                transition={transition}
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Left Foot */}
              <g>
                <motion.circle
                  animate={{
                    cx: centerX - 15 + Math.cos(leftLegAngle * Math.PI / 180) * 50 - 10,
                    cy: hipY + Math.sin(leftLegAngle * Math.PI / 180) * 50 + 50
                  }}
                  r={jointHitSize}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: onPartClick ? 'pointer' : 'default' }}
                  {...getInteractiveProps('Feet')}
                  transition={transition}
                />
                <motion.ellipse
                  animate={{
                    cx: centerX - 15 + Math.cos(leftLegAngle * Math.PI / 180) * 50 - 10,
                    cy: hipY + Math.sin(leftLegAngle * Math.PI / 180) * 50 + 50,
                    rx: feetPointed ? 3 : 6,
                    ry: feetPointed ? 6 : 3
                  }}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2"
                  transition={transition}
                />
              </g>
              
              {/* Right Thigh */}
              <motion.line
                x1={centerX + 15}
                y1={hipY}
                animate={{
                  x2: centerX + 15 + Math.cos(rightLegAngle * Math.PI / 180) * 50,
                  y2: hipY + Math.sin(rightLegAngle * Math.PI / 180) * 50
                }}
                transition={transition}
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Right Knee */}
              <g>
                <motion.circle
                  animate={{
                    cx: centerX + 15 + Math.cos(rightLegAngle * Math.PI / 180) * 50,
                    cy: hipY + Math.sin(rightLegAngle * Math.PI / 180) * 50
                  }}
                  r={jointHitSize}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: onPartClick ? 'pointer' : 'default' }}
                  {...getInteractiveProps('Legs')}
                  transition={transition}
                />
                <motion.circle
                  animate={{
                    cx: centerX + 15 + Math.cos(rightLegAngle * Math.PI / 180) * 50,
                    cy: hipY + Math.sin(rightLegAngle * Math.PI / 180) * 50
                  }}
                  r={jointSize}
                  fill={accentColor}
                  opacity={0.7}
                  transition={transition}
                />
              </g>
              {/* Right Calf */}
              <motion.line
                animate={{
                  x1: centerX + 15 + Math.cos(rightLegAngle * Math.PI / 180) * 50,
                  y1: hipY + Math.sin(rightLegAngle * Math.PI / 180) * 50,
                  x2: centerX + 15 + Math.cos(rightLegAngle * Math.PI / 180) * 50 + 5,
                  y2: hipY + Math.sin(rightLegAngle * Math.PI / 180) * 50 + 45
                }}
                transition={transition}
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Right Foot */}
              <g>
                <motion.circle
                  animate={{
                    cx: centerX + 15 + Math.cos(rightLegAngle * Math.PI / 180) * 50 + 5,
                    cy: hipY + Math.sin(rightLegAngle * Math.PI / 180) * 50 + 50
                  }}
                  r={jointHitSize}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: onPartClick ? 'pointer' : 'default' }}
                  {...getInteractiveProps('Feet')}
                  transition={transition}
                />
                <motion.ellipse
                  animate={{
                    cx: centerX + 15 + Math.cos(rightLegAngle * Math.PI / 180) * 50 + 5,
                    cy: hipY + Math.sin(rightLegAngle * Math.PI / 180) * 50 + 50,
                    rx: feetPointed ? 3 : 6,
                    ry: feetPointed ? 6 : 3
                  }}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2"
                  transition={transition}
                />
              </g>
            </>
          )
        ) : (
          <>
            {/* Standing/Leaning: Legs with knees */}
            {/* Left Thigh */}
            <line
              x1={centerX - hipWidth}
              y1={hipY}
              x2={centerX - hipWidth * 1.1}
              y2={hipY + legLength * 0.5}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Left Knee joint */}
            <g>
              <motion.circle
                cx={centerX - hipWidth * 1.1}
                cy={hipY + legLength * 0.5}
                r={jointHitSize}
                fill="transparent"
                stroke="none"
                style={{ cursor: onPartClick ? 'pointer' : 'default' }}
                {...getInteractiveProps('Legs')}
                animate={{ 
                  cy: legsBent ? hipY + legLength * 0.45 : hipY + legLength * 0.5 
                }}
                transition={transition}
              />
              <motion.circle
                cx={centerX - hipWidth * 1.1}
                cy={hipY + legLength * 0.5}
                r={jointSize}
                fill={accentColor}
                opacity={0.7}
                animate={{ 
                  cy: legsBent ? hipY + legLength * 0.45 : hipY + legLength * 0.5 
                }}
                transition={transition}
              />
            </g>
            {/* Left Calf */}
            <motion.line
              x1={centerX - hipWidth * 1.1}
              y1={hipY + legLength * 0.5}
              animate={{
                x2: legsBent ? centerX - 30 : centerX - 25,
                y2: hipY + legLength
              }}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              transition={transition}
            />
            {/* Left Foot */}
            <g>
              <motion.circle
                animate={{
                  cx: legsBent ? centerX - hipWidth * 1.5 : centerX - hipWidth * 1.25,
                  cy: hipY + legLength + 5
                }}
                r={jointHitSize}
                fill="transparent"
                stroke="none"
                style={{ cursor: onPartClick ? 'pointer' : 'default' }}
                {...getInteractiveProps('Feet')}
                transition={transition}
              />
              <motion.ellipse
                animate={{
                  cx: legsBent ? centerX - hipWidth * 1.5 : centerX - hipWidth * 1.25,
                  cy: hipY + legLength + 5,
                  rx: feetPointed ? 4 : 8,
                  ry: feetPointed ? 8 : 4
                }}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                transition={transition}
              />
            </g>
            
            {/* Right Thigh */}
            <line
              x1={centerX + hipWidth}
              y1={hipY}
              x2={centerX + hipWidth * 1.1}
              y2={hipY + legLength * 0.5}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Right Knee joint */}
            <g>
              <motion.circle
                cx={centerX + hipWidth * 1.1}
                cy={hipY + legLength * 0.5}
                r={jointHitSize}
                fill="transparent"
                stroke="none"
                style={{ cursor: onPartClick ? 'pointer' : 'default' }}
                {...getInteractiveProps('Legs')}
                animate={{ 
                  cy: legsBent ? hipY + legLength * 0.45 : hipY + legLength * 0.5 
                }}
                transition={transition}
              />
              <motion.circle
                cx={centerX + hipWidth * 1.1}
                cy={hipY + legLength * 0.5}
                r={jointSize}
                fill={accentColor}
                opacity={0.7}
                animate={{ 
                  cy: legsBent ? hipY + legLength * 0.45 : hipY + legLength * 0.5 
                }}
                transition={transition}
              />
            </g>
            {/* Right Calf */}
            <motion.line
              x1={centerX + hipWidth * 1.1}
              y1={hipY + legLength * 0.5}
              animate={{
                x2: legsBent ? centerX + hipWidth * 1.5 : centerX + hipWidth * 1.25,
                y2: hipY + legLength
              }}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              transition={transition}
            />
            {/* Right Foot */}
            <g>
              <motion.circle
                animate={{
                  cx: legsBent ? centerX + hipWidth * 1.5 : centerX + hipWidth * 1.25,
                  cy: hipY + legLength + 5
                }}
                r={jointHitSize}
                fill="transparent"
                stroke="none"
                style={{ cursor: onPartClick ? 'pointer' : 'default' }}
                {...getInteractiveProps('Feet')}
                transition={transition}
              />
              <motion.ellipse
                animate={{
                  cx: legsBent ? centerX + hipWidth * 1.5 : centerX + hipWidth * 1.25,
                  cy: hipY + legLength + 5,
                  rx: feetPointed ? 4 : 8,
                  ry: feetPointed ? 8 : 4
                }}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                transition={transition}
              />
            </g>
          </>
        )}
        </g>
      </motion.g>
    </svg>
  );
};

export default FigureCanvas;
