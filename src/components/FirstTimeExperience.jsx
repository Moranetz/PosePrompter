import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Copy, Check, X } from 'lucide-react';

const ONBOARDING_KEY = 'poseprompt_onboarding_complete';

// ─── Pose Figure Canvas ────────────────────────────────────────────────────────
// A minimal, elegant line-art figure drawn on canvas that responds to selections.
// Inspired by artist mannequins / fashion illustration croquis.

const FIGURE_POSES = {
  default: {
    head: { x: 200, y: 60, radius: 22 },
    neck: { x: 200, y: 82 },
    shoulderL: { x: 168, y: 105 },
    shoulderR: { x: 232, y: 105 },
    torso: { x: 200, y: 170 },
    hipL: { x: 182, y: 195 },
    hipR: { x: 218, y: 195 },
    elbowL: { x: 148, y: 152 },
    elbowR: { x: 252, y: 152 },
    handL: { x: 140, y: 200 },
    handR: { x: 260, y: 200 },
    kneeL: { x: 178, y: 268 },
    kneeR: { x: 222, y: 268 },
    footL: { x: 170, y: 340 },
    footR: { x: 230, y: 340 },
  },
  confident: {
    head: { x: 200, y: 55, radius: 22 },
    neck: { x: 200, y: 77 },
    shoulderL: { x: 162, y: 100 },
    shoulderR: { x: 238, y: 100 },
    torso: { x: 200, y: 165 },
    hipL: { x: 178, y: 192 },
    hipR: { x: 222, y: 192 },
    elbowL: { x: 142, y: 150 },
    elbowR: { x: 258, y: 150 },
    handL: { x: 145, y: 195 },
    handR: { x: 255, y: 195 },
    kneeL: { x: 172, y: 265 },
    kneeR: { x: 228, y: 265 },
    footL: { x: 160, y: 340 },
    footR: { x: 240, y: 340 },
  },
  relaxed: {
    head: { x: 195, y: 62, radius: 22 },
    neck: { x: 197, y: 84 },
    shoulderL: { x: 166, y: 108 },
    shoulderR: { x: 230, y: 104 },
    torso: { x: 198, y: 172 },
    hipL: { x: 184, y: 198 },
    hipR: { x: 216, y: 195 },
    elbowL: { x: 144, y: 158 },
    elbowR: { x: 256, y: 142 },
    handL: { x: 135, y: 208 },
    handR: { x: 265, y: 180 },
    kneeL: { x: 178, y: 272 },
    kneeR: { x: 224, y: 264 },
    footL: { x: 168, y: 340 },
    footR: { x: 238, y: 340 },
  },
  dramatic: {
    head: { x: 190, y: 58, radius: 22 },
    neck: { x: 193, y: 80 },
    shoulderL: { x: 160, y: 104 },
    shoulderR: { x: 234, y: 100 },
    torso: { x: 202, y: 168 },
    hipL: { x: 190, y: 196 },
    hipR: { x: 220, y: 190 },
    elbowL: { x: 132, y: 140 },
    elbowR: { x: 270, y: 130 },
    handL: { x: 110, y: 170 },
    handR: { x: 290, y: 108 },
    kneeL: { x: 182, y: 270 },
    kneeR: { x: 230, y: 258 },
    footL: { x: 174, y: 340 },
    footR: { x: 248, y: 340 },
  },
};

function lerpPoint(a, b, t) {
  const result = {};
  for (const key in a) {
    if (typeof a[key] === 'object') {
      result[key] = {};
      for (const sub in a[key]) {
        result[key][sub] = a[key][sub] + (b[key][sub] - a[key][sub]) * t;
      }
    } else {
      result[key] = a[key] + (b[key] - a[key]) * t;
    }
  }
  return result;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const PoseFigureCanvas = ({ pose = 'default', accentColor = 'rgba(255,255,255,0.5)', glowColor = null, lightingStyle = null, aestheticStyle = null, backgroundStyle = null }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const currentPoseRef = useRef(FIGURE_POSES.default);
  const targetPoseRef = useRef(FIGURE_POSES.default);
  const progressRef = useRef(1);
  const breathRef = useRef(0);

  useEffect(() => {
    targetPoseRef.current = FIGURE_POSES[pose] || FIGURE_POSES.default;
    progressRef.current = 0;
  }, [pose]);

  const drawFigure = useCallback((ctx, points, breath, width, height) => {
    ctx.clearRect(0, 0, width, height);

    // Subtle breath offset
    const bOff = Math.sin(breath) * 2;

    // ─── Background environment ───
    if (backgroundStyle === 'garden') {
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(30, height);
      ctx.quadraticCurveTo(40, 280, 55, 200);
      ctx.quadraticCurveTo(50, 140, 70, 80);
      ctx.stroke();
      [[50,180],[60,130],[45,230]].forEach(([lx,ly]) => {
        ctx.beginPath();
        ctx.ellipse(lx, ly, 12, 6, -0.5 + Math.sin(breath*0.5)*0.1, 0, Math.PI*2);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(370, height);
      ctx.quadraticCurveTo(360, 260, 345, 180);
      ctx.quadraticCurveTo(350, 110, 330, 60);
      ctx.stroke();
      [[350,200],[340,140],[355,260]].forEach(([lx,ly]) => {
        ctx.beginPath();
        ctx.ellipse(lx, ly, 12, 6, 0.5 - Math.sin(breath*0.5)*0.1, 0, Math.PI*2);
        ctx.stroke();
      });
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = '#a855f7';
      for (let i = 0; i < 5; i++) {
        const wx = 60 + i * 70;
        ctx.beginPath();
        ctx.moveTo(wx, 0);
        ctx.quadraticCurveTo(wx + 10, 30 + Math.sin(breath + i)*3, wx + 5, 50 + Math.sin(breath*0.7 + i)*4);
        ctx.stroke();
      }
      ctx.restore();
    } else if (backgroundStyle === 'coastal') {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 120); ctx.lineTo(width, 118); ctx.stroke();
      ctx.globalAlpha = 0.04;
      for (let w = 0; w < 4; w++) {
        ctx.beginPath();
        const wy = 135 + w * 25;
        for (let x = 0; x < width; x += 5) {
          const y = wy + Math.sin((x * 0.03) + breath + w * 1.5) * (3 + w);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 350); ctx.quadraticCurveTo(100, 340, 200, 345);
      ctx.quadraticCurveTo(300, 350, width, 338); ctx.stroke();
      ctx.restore();
    } else if (backgroundStyle === 'studio') {
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = 'rgba(255,255,255,1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 30, 60, 120);
      ctx.beginPath(); ctx.moveTo(50, 30); ctx.lineTo(50, 150); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(20, 90); ctx.lineTo(80, 90); ctx.stroke();
      ctx.strokeRect(320, 30, 60, 120);
      ctx.beginPath(); ctx.moveTo(350, 30); ctx.lineTo(350, 150); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(320, 90); ctx.lineTo(380, 90); ctx.stroke();
      ctx.globalAlpha = 0.04;
      ctx.beginPath(); ctx.moveTo(0, 355); ctx.lineTo(width, 355); ctx.stroke();
      ctx.globalAlpha = 0.03;
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.fillRect(22, 32, 56, 116);
      ctx.fillRect(322, 32, 56, 116);
      ctx.restore();
    }

    // ─── Aesthetic color treatment ───
    if (aestheticStyle === 'timeless') {
      const grd = ctx.createRadialGradient(200, 150, 40, 200, 180, 220);
      grd.addColorStop(0, 'rgba(245, 158, 11, 0.07)');
      grd.addColorStop(0.6, 'rgba(245, 158, 11, 0.03)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, width, height);
    } else if (aestheticStyle === 'indie') {
      ctx.save();
      ctx.globalAlpha = 0.035;
      for (let i = 0; i < 120; i++) {
        const gx = Math.random() * width;
        const gy = Math.random() * height;
        const gs = 0.5 + Math.random() * 1.5;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';
        ctx.fillRect(gx, gy, gs, gs);
      }
      ctx.restore();
      const vig = ctx.createRadialGradient(200, 190, 80, 200, 190, 250);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, 'rgba(139, 69, 19, 0.06)');
      ctx.fillStyle = vig; ctx.fillRect(0, 0, width, height);
    } else if (aestheticStyle === 'ethereal') {
      const g1 = ctx.createRadialGradient(140, 120, 20, 140, 120, 150);
      g1.addColorStop(0, 'rgba(168, 85, 247, 0.06)'); g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, width, height);
      const g2 = ctx.createRadialGradient(280, 200, 20, 280, 200, 140);
      g2.addColorStop(0, 'rgba(236, 72, 153, 0.04)'); g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.globalAlpha = 0.06;
      for (let i = 0; i < 12; i++) {
        const px = 50 + (i * 31) % 300;
        const py = 40 + (i * 47) % 300 + Math.sin(breath * 0.5 + i) * 8;
        ctx.beginPath();
        ctx.fillStyle = i % 3 === 0 ? '#a855f7' : i % 3 === 1 ? '#ec4899' : '#06b6d4';
        ctx.arc(px, py, 1 + (i % 3), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    // ─── Lighting overlays ───
    if (lightingStyle === 'golden') {
      const grd = ctx.createLinearGradient(0, 0, width, height);
      grd.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
      grd.addColorStop(0.5, 'rgba(245, 158, 11, 0.03)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, width, height);
    } else if (lightingStyle === 'dramatic') {
      const grd = ctx.createLinearGradient(width, 0, 0, height);
      grd.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
      grd.addColorStop(0.3, 'transparent');
      grd.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
      grd.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, width, height);
    } else if (lightingStyle === 'soft') {
      const grd = ctx.createRadialGradient(200, 100, 40, 200, 200, 200);
      grd.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, width, height);
    }

    // ─── Figure line color based on aesthetic ───
    let figureCol = accentColor;
    if (aestheticStyle === 'timeless') {
      const m = accentColor.match(/[\d.]+/g);
      figureCol = m ? `rgba(255, 230, 180, ${Math.min(parseFloat(m[3] || 0.5) + 0.1, 1)})` : accentColor;
    } else if (aestheticStyle === 'indie') {
      const m = accentColor.match(/[\d.]+/g);
      figureCol = m ? `rgba(220, 200, 180, ${Math.min(parseFloat(m[3] || 0.5) + 0.05, 1)})` : accentColor;
    } else if (aestheticStyle === 'ethereal') {
      const m = accentColor.match(/[\d.]+/g);
      figureCol = m ? `rgba(200, 180, 255, ${Math.min(parseFloat(m[3] || 0.5) + 0.1, 1)})` : accentColor;
    }

    const p = {
      head: { x: points.head.x, y: points.head.y + bOff * 0.3, radius: points.head.radius },
      neck: { x: points.neck.x, y: points.neck.y + bOff * 0.25 },
      shoulderL: { x: points.shoulderL.x, y: points.shoulderL.y + bOff * 0.15 },
      shoulderR: { x: points.shoulderR.x, y: points.shoulderR.y + bOff * 0.15 },
      torso: { x: points.torso.x, y: points.torso.y },
      hipL: { x: points.hipL.x, y: points.hipL.y },
      hipR: { x: points.hipR.x, y: points.hipR.y },
      elbowL: { x: points.elbowL.x, y: points.elbowL.y + bOff * 0.08 },
      elbowR: { x: points.elbowR.x, y: points.elbowR.y + bOff * 0.08 },
      handL: { x: points.handL.x, y: points.handL.y + bOff * 0.04 },
      handR: { x: points.handR.x, y: points.handR.y + bOff * 0.04 },
      kneeL: { x: points.kneeL.x, y: points.kneeL.y },
      kneeR: { x: points.kneeR.x, y: points.kneeR.y },
      footL: { x: points.footL.x, y: points.footL.y },
      footR: { x: points.footR.x, y: points.footR.y },
    };

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw shadow/reflection
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = figureCol;
    ctx.beginPath();
    ctx.ellipse(p.torso.x, 355, 50, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- Draw body lines ---
    const drawLimb = (from, to, lineWidth = 2.2) => {
      ctx.beginPath();
      ctx.strokeStyle = figureCol;
      ctx.lineWidth = lineWidth;
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    };

    const drawCurvedLimb = (from, cp, to, lineWidth = 2.2) => {
      ctx.beginPath();
      ctx.strokeStyle = figureCol;
      ctx.lineWidth = lineWidth;
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(cp.x, cp.y, to.x, to.y);
      ctx.stroke();
    };

    // Torso (curved for elegance)
    const torsoMid = {
      x: (p.shoulderL.x + p.shoulderR.x) / 2,
      y: (p.neck.y + p.torso.y) / 2
    };
    drawCurvedLimb(p.neck, { x: torsoMid.x - 2, y: torsoMid.y }, p.torso, 2.5);

    // Shoulders
    drawCurvedLimb(p.shoulderL, { x: p.neck.x, y: p.shoulderL.y - 4 }, p.shoulderR, 2.2);

    // Hip line
    drawCurvedLimb(p.hipL, { x: p.torso.x, y: p.hipL.y + 2 }, p.hipR, 2.2);

    // Torso to hips
    drawLimb(p.torso, { x: (p.hipL.x + p.hipR.x) / 2, y: (p.hipL.y + p.hipR.y) / 2 }, 2.2);

    // Arms
    drawLimb(p.shoulderL, p.elbowL, 2);
    drawLimb(p.elbowL, p.handL, 1.8);
    drawLimb(p.shoulderR, p.elbowR, 2);
    drawLimb(p.elbowR, p.handR, 1.8);

    // Legs
    drawLimb(p.hipL, p.kneeL, 2.2);
    drawLimb(p.kneeL, p.footL, 2);
    drawLimb(p.hipR, p.kneeR, 2.2);
    drawLimb(p.kneeR, p.footR, 2);

    // Joints as small circles
    const drawJoint = (point, r = 3) => {
      ctx.beginPath();
      ctx.fillStyle = figureCol;
      ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    [p.shoulderL, p.shoulderR, p.elbowL, p.elbowR, p.hipL, p.hipR, p.kneeL, p.kneeR].forEach(
      pt => drawJoint(pt, 2.5)
    );
    [p.handL, p.handR, p.footL, p.footR].forEach(pt => drawJoint(pt, 2));

    // Head
    ctx.beginPath();
    ctx.strokeStyle = figureCol;
    ctx.lineWidth = 2.2;
    ctx.arc(p.head.x, p.head.y, p.head.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle face line (tilt indicator)
    const faceTilt = (p.head.x - 200) * 0.04;
    ctx.beginPath();
    ctx.strokeStyle = figureCol;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.4;
    // Eye line
    ctx.moveTo(p.head.x - 8, p.head.y - 3 + faceTilt);
    ctx.lineTo(p.head.x + 8, p.head.y - 3 - faceTilt);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Neck
    drawLimb(
      { x: p.head.x, y: p.head.y + p.head.radius },
      p.neck,
      2
    );

  }, [accentColor, glowColor, lightingStyle, aestheticStyle, backgroundStyle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr;
    canvas.height = 380 * dpr;
    ctx.scale(dpr, dpr);

    let running = true;
    const animate = () => {
      if (!running) return;
      breathRef.current += 0.02;

      if (progressRef.current < 1) {
        progressRef.current = Math.min(1, progressRef.current + 0.025);
        const t = easeInOutCubic(progressRef.current);
        currentPoseRef.current = lerpPoint(currentPoseRef.current, targetPoseRef.current, t);
      } else {
        currentPoseRef.current = targetPoseRef.current;
      }

      drawFigure(ctx, currentPoseRef.current, breathRef.current, 400, 380);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [drawFigure]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', maxWidth: '400px', height: 'auto', aspectRatio: '400/380' }}
    />
  );
};


// ─── Mini Demo Data ─────────────────────────────────────────────────────────────
// Real categories from the tool, curated for a compelling first impression.

const demoCategories = [
  {
    key: 'pose',
    label: 'Pose',
    color: '#10b981',
    options: [
      { id: 'confident', label: 'Confident Stance', figurePose: 'confident', prompt: 'shoulders back, commanding presence, subtle power stance, one foot slightly forward' },
      { id: 'relaxed', label: 'Relaxed Lean', figurePose: 'relaxed', prompt: 'leaning against surface, one leg slightly bent, hip shifted, elegant S-curve' },
      { id: 'dramatic', label: 'Dramatic Gesture', figurePose: 'dramatic', prompt: 'back half-turned, looking over shoulder, one hand raised, dynamic tension' },
    ]
  },
  {
    key: 'lighting',
    label: 'Lighting',
    color: '#f59e0b',
    options: [
      { id: 'golden', label: 'Golden Hour', lightingStyle: 'golden', prompt: 'warm directional golden hour light, soft glow, elongated shadows, romantic ethereal radiance' },
      { id: 'dramatic', label: 'Hard Light', lightingStyle: 'dramatic', prompt: 'dramatic directional hard light, high-contrast, sharp shadows, theatrical' },
      { id: 'soft', label: 'Soft Diffused', lightingStyle: 'soft', prompt: 'soft diffused natural window light, gentle luminous glow, minimal shadows, dreamlike quality' },
    ]
  },
  {
    key: 'aesthetic',
    label: 'Aesthetic',
    color: '#a855f7',
    options: [
      { id: 'timeless', label: 'Timeless Elegance', prompt: 'sophisticated timeless elegance, classic Hollywood portrait, serene understated luxury' },
      { id: 'indie', label: 'Indie Film', prompt: 'raw indie film warmth, candid documentary feel, analog grain, authentic moment' },
      { id: 'ethereal', label: 'Ethereal Dream', prompt: 'ethereal softness, dreamy pastels, curated cool, gentle otherworldly glow' },
    ]
  },
  {
    key: 'background',
    label: 'Background',
    color: '#06b6d4',
    options: [
      { id: 'garden', label: 'Estate Garden', prompt: 'lush estate garden, cascading wisteria, romantic stone terraces, theatrical topiary' },
      { id: 'coastal', label: 'Coastal', prompt: 'private beach, weathered grey fence, sand dunes, soft mist over water' },
      { id: 'studio', label: 'Minimalist Interior', prompt: 'minimalist interior, high ceilings, large windows, sheer curtains, polished floors' },
    ]
  },
];


// ─── First Time Experience ──────────────────────────────────────────────────────

const FirstTimeExperience = ({ onComplete, onSkip }) => {
  const [selections, setSelections] = useState({});
  const [isExiting, setIsExiting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (completed === 'true') {
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (categoryKey, option) => {
    setSelections(prev => ({ ...prev, [categoryKey]: option }));
    // Auto-advance to next unfilled category
    const nextIdx = demoCategories.findIndex(
      (cat, i) => i > activeCategoryIndex && !selections[cat.key] && cat.key !== categoryKey
    );
    if (nextIdx !== -1) {
      setTimeout(() => setActiveCategoryIndex(nextIdx), 300);
    }
  };

  const handleComplete = () => {
    setIsExiting(true);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setTimeout(() => onComplete?.(), 500);
  };

  const handleSkip = () => {
    setIsExiting(true);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setTimeout(() => onSkip?.(), 300);
  };

  const handleCopy = async () => {
    const text = buildPrompt();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const buildPrompt = () => {
    return Object.values(selections)
      .map(opt => opt.prompt)
      .filter(Boolean)
      .join('. ') + '.';
  };

  const selectionCount = Object.keys(selections).length;
  const hasSelections = selectionCount > 0;
  const currentFigurePose = selections.pose?.figurePose || 'default';
  const currentLighting = selections.lighting?.lightingStyle || null;
  const currentGlow = (() => {
    if (selections.aesthetic?.id === 'ethereal') return 'rgba(168, 85, 247, 0.06)';
    if (selections.aesthetic?.id === 'timeless') return 'rgba(245, 158, 11, 0.04)';
    if (selections.lighting?.id === 'golden') return 'rgba(245, 158, 11, 0.05)';
    return null;
  })();

  // Accent color for the figure based on latest selection
  const figureAccent = (() => {
    if (selectionCount === 0) return 'rgba(255,255,255,0.25)';
    const colors = Object.keys(selections).map(key => {
      const cat = demoCategories.find(c => c.key === key);
      return cat?.color || '#fff';
    });
    // Blend toward white as more selections are made
    const alpha = Math.min(0.35 + selectionCount * 0.12, 0.75);
    return `rgba(255,255,255,${alpha})`;
  })();

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(12px)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              background: 'linear-gradient(160deg, #0a0a10 0%, #111118 50%, #0d0d14 100%)',
              borderRadius: '20px',
              maxWidth: '860px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.06)',
              position: 'relative',
              overflow: 'hidden',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            {/* Skip */}
            <button
              onClick={handleSkip}
              aria-label="Skip introduction"
              style={{
                position: 'absolute',
                top: '14px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '13px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'color 0.2s',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <X size={14} />
              Skip
            </button>

            {/* Layout: figure left, controls right on desktop; stacked on mobile */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              minHeight: '480px',
            }}
            className="fte-layout"
            >
              {/* ─── Left: Canvas Figure ─── */}
              <div style={{
                flex: '0 0 44%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 16px',
                position: 'relative',
                borderRight: '1px solid rgba(255,255,255,0.04)',
              }}>
                {/* Ambient color wash behind canvas */}
                {hasSelections && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: (() => {
                        const selKeys = Object.keys(selections);
                        const lastCat = demoCategories.find(c => c.key === selKeys[selKeys.length - 1]);
                        const col = lastCat?.color || '#8b5cf6';
                        return `radial-gradient(ellipse at 50% 60%, ${col}08 0%, transparent 70%)`;
                      })(),
                      pointerEvents: 'none',
                    }}
                  />
                )}

                <PoseFigureCanvas
                  pose={currentFigurePose}
                  accentColor={figureAccent}
                  glowColor={currentGlow}
                  lightingStyle={currentLighting}
                  aestheticStyle={selections.aesthetic?.id || null}
                  backgroundStyle={selections.background?.id || null}
                />

                {/* Live prompt preview below figure */}
                <AnimatePresence>
                  {hasSelections && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        width: '100%',
                        maxWidth: '340px',
                        marginTop: '8px',
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          color: 'rgba(255,255,255,0.35)',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}>
                          Your prompt
                        </span>
                        <motion.button
                          onClick={handleCopy}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={copied ? 'Copied' : 'Copy prompt'}
                          style={{
                            padding: '3px 8px',
                            background: copied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.06)',
                            border: '1px solid ' + (copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'),
                            borderRadius: '5px',
                            color: copied ? '#22c55e' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                          }}
                        >
                          {copied ? <Check size={10} /> : <Copy size={10} />}
                          {copied ? 'Copied' : 'Copy'}
                        </motion.button>
                      </div>
                      <p style={{
                        fontSize: '11.5px',
                        color: 'rgba(255,255,255,0.55)',
                        lineHeight: '1.65',
                        margin: 0,
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                        maxHeight: '80px',
                        overflowY: 'auto',
                      }}>
                        {buildPrompt()}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ─── Right: Category Selectors ─── */}
              <div style={{
                flex: 1,
                padding: 'clamp(24px, 4vw, 40px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <h2 style={{
                    fontSize: 'clamp(20px, 4vw, 26px)',
                    fontWeight: '600',
                    color: '#f4f4f5',
                    marginBottom: '8px',
                    letterSpacing: '-0.5px',
                    lineHeight: '1.25',
                  }}>
                    Shape your scene
                  </h2>
                  <p style={{
                    fontSize: 'clamp(13px, 2.5vw, 14.5px)',
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: '28px',
                    lineHeight: '1.55',
                  }}>
                    Pick from each category — watch the prompt build itself.
                  </p>
                </motion.div>

                {/* Category rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {demoCategories.map((cat, catIdx) => (
                    <motion.div
                      key={cat.key}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + catIdx * 0.08 }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: selections[cat.key] ? cat.color : 'rgba(255,255,255,0.15)',
                          transition: 'background 0.3s',
                          boxShadow: selections[cat.key] ? `0 0 8px ${cat.color}40` : 'none',
                        }} />
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: selections[cat.key] ? cat.color : 'rgba(255,255,255,0.4)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          transition: 'color 0.3s',
                        }}>
                          {cat.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {cat.options.map((opt) => {
                          const isSelected = selections[cat.key]?.id === opt.id;
                          return (
                            <motion.button
                              key={opt.id}
                              onClick={() => handleSelect(cat.key, opt)}
                              whileHover={{ scale: 1.03, y: -1 }}
                              whileTap={{ scale: 0.97 }}
                              aria-label={`Select ${opt.label}`}
                              aria-pressed={isSelected}
                              style={{
                                padding: '9px 16px',
                                background: isSelected
                                  ? `${cat.color}18`
                                  : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isSelected ? cat.color + '50' : 'rgba(255,255,255,0.07)'}`,
                                borderRadius: '9px',
                                color: isSelected ? cat.color : 'rgba(255,255,255,0.55)',
                                fontSize: '13px',
                                fontWeight: isSelected ? '600' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.25s',
                                outline: 'none',
                                whiteSpace: 'nowrap',
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = cat.color + '60';
                                e.currentTarget.style.boxShadow = `0 0 0 2px ${cat.color}15`;
                              }}
                              onBlur={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                                }
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {opt.label}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Progress indicator + CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  style={{ marginTop: '28px' }}
                >
                  {/* Progress dots */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '16px',
                  }}>
                    {demoCategories.map((cat) => (
                      <div
                        key={cat.key}
                        style={{
                          flex: 1,
                          height: '2px',
                          borderRadius: '1px',
                          background: selections[cat.key]
                            ? cat.color
                            : 'rgba(255,255,255,0.08)',
                          transition: 'background 0.4s',
                          boxShadow: selections[cat.key] ? `0 0 6px ${cat.color}30` : 'none',
                        }}
                      />
                    ))}
                    <span style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.3)',
                      marginLeft: '8px',
                      whiteSpace: 'nowrap',
                    }}>
                      {selectionCount}/{demoCategories.length}
                    </span>
                  </div>

                  {/* Info text */}
                  <p style={{
                    fontSize: '12.5px',
                    color: 'rgba(255,255,255,0.35)',
                    lineHeight: '1.6',
                    marginBottom: '18px',
                  }}>
                    {selectionCount === 0
                      ? 'Each category adds a layer to the final prompt.'
                      : selectionCount < demoCategories.length
                        ? `${demoCategories.length - selectionCount} more to explore — or dive in now.`
                        : 'The full tool has 33 categories across pose, styling, camera, and more.'}
                  </p>

                  {/* CTA button */}
                  <motion.button
                    onClick={handleComplete}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    aria-label="Enter the full tool"
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      background: hasSelections
                        ? 'rgba(255,255,255,0.95)'
                        : 'rgba(255,255,255,0.08)',
                      border: hasSelections
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: hasSelections ? '#0a0a0f' : 'rgba(255,255,255,0.5)',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.35s',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      if (hasSelections) {
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.15)';
                      }
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {hasSelections ? 'Open the full studio' : 'Skip to the studio'}
                    <ArrowRight size={16} />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Responsive styles injected */}
          <style>{`
            @media (max-width: 680px) {
              .fte-layout {
                flex-direction: column !important;
                min-height: auto !important;
              }
              .fte-layout > div:first-child {
                border-right: none !important;
                border-bottom: 1px solid rgba(255,255,255,0.04) !important;
                padding: 24px 16px 16px !important;
                flex: none !important;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FirstTimeExperience;
