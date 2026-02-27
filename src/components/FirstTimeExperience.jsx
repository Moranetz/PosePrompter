import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Copy, Check, X } from 'lucide-react';

const ONBOARDING_KEY = 'poseprompt_onboarding_complete';

// ─── Pose Figure Canvas ────────────────────────────────────────────────────────
// A luminous filled-silhouette fashionista figure with flowing dress, scarf,
// cat-eye sunglasses, and stiletto heels. Responds to pose/lighting/aesthetic/
// background selections with smooth transitions and particle effects.

const FIGURE_POSES = {
  default: {
    head:{x:200,y:52}, neck:{x:200,y:78},
    sL:{x:170,y:86}, sR:{x:230,y:86},
    torso:{x:200,y:152}, hL:{x:183,y:178}, hR:{x:217,y:178},
    eL:{x:148,y:140}, eR:{x:252,y:140},
    wL:{x:140,y:194}, wR:{x:260,y:194},
    kL:{x:188,y:254}, kR:{x:212,y:254},
    fL:{x:185,y:332}, fR:{x:215,y:332},
  },
  confident: {
    head:{x:200,y:48}, neck:{x:200,y:74},
    sL:{x:163,y:83}, sR:{x:237,y:83},
    torso:{x:200,y:150}, hL:{x:180,y:176}, hR:{x:220,y:176},
    eL:{x:138,y:136}, eR:{x:262,y:136},
    wL:{x:132,y:190}, wR:{x:268,y:190},
    kL:{x:176,y:252}, kR:{x:224,y:252},
    fL:{x:168,y:332}, fR:{x:232,y:332},
  },
  relaxed: {
    head:{x:194,y:54}, neck:{x:196,y:80},
    sL:{x:167,y:90}, sR:{x:228,y:85},
    torso:{x:197,y:154}, hL:{x:184,y:180}, hR:{x:214,y:177},
    eL:{x:144,y:150}, eR:{x:256,y:132},
    wL:{x:136,y:204}, wR:{x:264,y:174},
    kL:{x:186,y:258}, kR:{x:216,y:250},
    fL:{x:180,y:332}, fR:{x:228,y:332},
  },
  dramatic: {
    head:{x:191,y:50}, neck:{x:194,y:76},
    sL:{x:162,y:85}, sR:{x:234,y:81},
    torso:{x:202,y:152}, hL:{x:188,y:178}, hR:{x:220,y:174},
    eL:{x:132,y:126}, eR:{x:268,y:116},
    wL:{x:110,y:158}, wR:{x:290,y:94},
    kL:{x:190,y:256}, kR:{x:228,y:246},
    fL:{x:184,y:332}, fR:{x:240,y:332},
  },
};

function lerpVal(a, b, t) { return a + (b - a) * t; }
function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

function lerpPose(current, target, t) {
  const result = {};
  for (const key in target) {
    result[key] = {};
    for (const sub in target[key]) {
      result[key][sub] = lerpVal(current[key]?.[sub] ?? target[key][sub], target[key][sub], t);
    }
  }
  return result;
}

const PoseFigureCanvas = ({ pose = 'default', lightingStyle = null, aestheticStyle = null, backgroundStyle = null, selectionCount = 0 }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    currentPose: JSON.parse(JSON.stringify(FIGURE_POSES.default)),
    targetPose: FIGURE_POSES.default,
    morphProgress: 1,
    breath: 0,
    figHue: 225, figSat: 15, figLight: 78, figAlpha: 0.35,
    tgtHue: 225, tgtSat: 15, tgtLight: 78, tgtAlpha: 0.35,
    glowHue: 225, glowSat: 30, glowAlpha: 0.25,
    tgtGlowHue: 225, tgtGlowSat: 30, tgtGlowAlpha: 0.25,
    particles: [],
    burstParticles: [],
  });

  // Init particles
  useEffect(() => {
    const s = stateRef.current;
    if (s.particles.length === 0) {
      for (let i = 0; i < 50; i++) {
        s.particles.push({
          x: 60 + Math.random() * 280,
          y: 30 + Math.random() * 340,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -0.05 - Math.random() * 0.1,
          size: 0.4 + Math.random() * 2.2,
          alpha: 0.03 + Math.random() * 0.1,
          phase: Math.random() * Math.PI * 2,
          drift: 0.3 + Math.random() * 0.7,
        });
      }
    }
  }, []);

  // Update targets when props change
  useEffect(() => {
    const s = stateRef.current;
    s.targetPose = FIGURE_POSES[pose] || FIGURE_POSES.default;
    s.morphProgress = 0;

    // Color targets
    s.tgtAlpha = 0.3 + selectionCount * 0.1;
    if (aestheticStyle === 'timeless') { s.tgtHue = 40; s.tgtSat = 35; s.tgtLight = 78; }
    else if (aestheticStyle === 'indie') { s.tgtHue = 30; s.tgtSat = 30; s.tgtLight = 72; }
    else if (aestheticStyle === 'ethereal') { s.tgtHue = 270; s.tgtSat = 40; s.tgtLight = 80; }
    else { s.tgtHue = 225; s.tgtSat = 15; s.tgtLight = 78; }

    if (lightingStyle === 'golden') { s.tgtGlowHue = 40; s.tgtGlowSat = 60; s.tgtGlowAlpha = 0.35; }
    else if (lightingStyle === 'dramatic') { s.tgtGlowHue = 0; s.tgtGlowSat = 0; s.tgtGlowAlpha = 0.4; }
    else if (lightingStyle === 'soft') { s.tgtGlowHue = 210; s.tgtGlowSat = 25; s.tgtGlowAlpha = 0.3; }
    else { s.tgtGlowHue = 225; s.tgtGlowSat = 30; s.tgtGlowAlpha = 0.2 + selectionCount * 0.04; }

    // Spawn burst
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 1 + Math.random() * 3;
      s.burstParticles.push({
        x: 200, y: 180,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: 1 + Math.random() * 3,
        life: 0.7 + Math.random() * 0.3,
        color: `hsla(${s.tgtHue}, 50%, 70%, 1)`,
      });
    }
  }, [pose, lightingStyle, aestheticStyle, backgroundStyle, selectionCount]);

  const drawFrame = useCallback((ctx) => {
    const W = 400, H = 400;
    const s = stateRef.current;
    ctx.clearRect(0, 0, W, H);
    s.breath += 0.018;

    // Interpolate colors
    s.figHue += (s.tgtHue - s.figHue) * 0.02;
    s.figSat += (s.tgtSat - s.figSat) * 0.02;
    s.figLight += (s.tgtLight - s.figLight) * 0.02;
    s.figAlpha += (s.tgtAlpha - s.figAlpha) * 0.02;
    s.glowHue += (s.tgtGlowHue - s.glowHue) * 0.02;
    s.glowSat += (s.tgtGlowSat - s.glowSat) * 0.02;
    s.glowAlpha += (s.tgtGlowAlpha - s.glowAlpha) * 0.02;

    // Pose interpolation
    if (s.morphProgress < 1) {
      s.morphProgress = Math.min(1, s.morphProgress + 0.022);
      s.currentPose = lerpPose(s.currentPose, s.targetPose, easeInOutCubic(s.morphProgress));
    }

    // Apply breathing
    const bOff = Math.sin(s.breath) * 1.8;
    const p = {};
    for (const key in s.currentPose) p[key] = { ...s.currentPose[key] };
    const breathMap = { head:0.3, neck:0.25, sL:0.15, sR:0.15, eL:0.08, eR:0.08, wL:0.04, wR:0.04 };
    Object.keys(breathMap).forEach(k => { if (p[k]) p[k].y += bOff * breathMap[k]; });

    // ─── Environment ───
    drawEnvironment(ctx, backgroundStyle, s.breath, W, H);
    drawAesthetic(ctx, aestheticStyle, s.breath, W, H);
    drawLighting(ctx, lightingStyle, W, H);

    // ─── Ground shadow ───
    ctx.save();
    const heelBottomY = Math.max(p.fL.y, p.fR.y) + 18;
    const shadowGrad = ctx.createRadialGradient(p.torso.x, heelBottomY, 5, p.torso.x, heelBottomY, 55);
    shadowGrad.addColorStop(0, `hsla(${s.figHue}, ${s.figSat}%, 50%, 0.1)`);
    shadowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(p.torso.x, heelBottomY, 55, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ─── Figure gradient ───
    const bodyGrad = ctx.createLinearGradient(200, p.head.y - 20, 200, 340);
    bodyGrad.addColorStop(0, `hsla(${s.figHue}, ${s.figSat}%, ${s.figLight + 5}%, ${s.figAlpha + 0.08})`);
    bodyGrad.addColorStop(0.4, `hsla(${s.figHue}, ${s.figSat + 5}%, ${s.figLight}%, ${s.figAlpha})`);
    bodyGrad.addColorStop(1, `hsla(${s.figHue}, ${s.figSat}%, ${s.figLight - 8}%, ${s.figAlpha - 0.05})`);

    const glowPulse = 0.85 + Math.sin(s.breath * 0.6) * 0.15;
    ctx.shadowBlur = 22;
    ctx.shadowColor = `hsla(${s.glowHue}, ${s.glowSat}%, 60%, ${s.glowAlpha * glowPulse})`;
    ctx.fillStyle = bodyGrad;

    // Lower legs
    drawFilledLimb(ctx, p.kL, p.fL, 10, 6);
    drawFilledLimb(ctx, p.kR, p.fR, 10, 6);
    // Heels
    drawHeel(ctx, p.fL, -1);
    drawHeel(ctx, p.fR, 1);
    // Torso
    drawTorso(ctx, p);
    // Dress skirt
    drawDressSkirt(ctx, p, s);
    // Neckline
    drawNeckline(ctx, p, s);
    // Arms
    drawFilledLimb(ctx, p.sL, p.eL, 10, 7);
    drawFilledLimb(ctx, p.eL, p.wL, 7, 4.5);
    drawFilledLimb(ctx, p.sR, p.eR, 10, 7);
    drawFilledLimb(ctx, p.eR, p.wR, 7, 4.5);
    // Hands
    ctx.beginPath(); ctx.ellipse(p.wL.x, p.wL.y + 2, 3.5, 4, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(p.wR.x, p.wR.y + 2, 3.5, 4, -0.2, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.beginPath(); ctx.ellipse(p.head.x, p.head.y, 13, 16, 0, 0, Math.PI * 2); ctx.fill();
    // Glasses
    drawGlasses(ctx, p, s);
    // Hair
    ctx.shadowBlur = 12;
    drawHair(ctx, p, s);
    // Scarf
    drawScarf(ctx, p, s);
    // Shadow off
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Edge highlight
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = `hsla(${s.figHue}, ${s.figSat + 20}%, 90%, 1)`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(p.head.x, p.head.y, 13.5, 16.5, 0, -Math.PI * 0.7, Math.PI * 0.1);
    ctx.stroke();
    ctx.restore();

    // ─── Particles ───
    drawParticles(ctx, s);
  }, [lightingStyle, aestheticStyle, backgroundStyle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);

    let running = true;
    const animate = () => {
      if (!running) return;
      drawFrame(ctx);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', maxWidth: '420px', height: 'auto', aspectRatio: '400/400' }}
    />
  );
};

// ─── Drawing Helpers ──────────────────────────────────────────────────────────

function drawFilledLimb(ctx, start, end, startW, endW) {
  const dx = end.x - start.x, dy = end.y - start.y;
  const len = Math.sqrt(dx*dx + dy*dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const midX = (start.x + end.x) / 2, midY = (start.y + end.y) / 2;
  const avgW = (startW + endW) / 2;
  ctx.beginPath();
  ctx.moveTo(start.x + nx * startW/2, start.y + ny * startW/2);
  ctx.quadraticCurveTo(midX + nx * avgW * 0.55, midY + ny * avgW * 0.55, end.x + nx * endW/2, end.y + ny * endW/2);
  ctx.quadraticCurveTo(end.x + nx * endW * 0.1, end.y + ny * endW * 0.1 + 1, end.x - nx * endW/2, end.y - ny * endW/2);
  ctx.quadraticCurveTo(midX - nx * avgW * 0.45, midY - ny * avgW * 0.45, start.x - nx * startW/2, start.y - ny * startW/2);
  ctx.closePath();
  ctx.fill();
}

function drawTorso(ctx, p) {
  ctx.beginPath();
  ctx.moveTo(p.sL.x, p.sL.y);
  ctx.quadraticCurveTo(p.head.x - 6, p.sL.y - 6, p.head.x - 6, p.head.y + 18);
  ctx.lineTo(p.head.x + 6, p.head.y + 18);
  ctx.quadraticCurveTo(p.head.x + 6, p.sR.y - 6, p.sR.x, p.sR.y);
  ctx.bezierCurveTo(p.sR.x + 3, p.sR.y + 22, p.torso.x + 15, p.torso.y - 12, p.torso.x + 12, p.torso.y);
  ctx.bezierCurveTo(p.torso.x + 14, p.torso.y + 10, p.hR.x + 6, p.hR.y - 6, p.hR.x, p.hR.y);
  ctx.quadraticCurveTo((p.hL.x + p.hR.x) / 2, Math.max(p.hL.y, p.hR.y) + 6, p.hL.x, p.hL.y);
  ctx.bezierCurveTo(p.hL.x - 6, p.hL.y - 6, p.torso.x - 14, p.torso.y + 10, p.torso.x - 12, p.torso.y);
  ctx.bezierCurveTo(p.torso.x - 15, p.torso.y - 12, p.sL.x - 3, p.sL.y + 22, p.sL.x, p.sL.y);
  ctx.closePath();
  ctx.fill();
}

function drawHeel(ctx, ankle, side) {
  const dir = side;
  ctx.beginPath();
  ctx.moveTo(ankle.x - dir * 3, ankle.y - 3);
  ctx.quadraticCurveTo(ankle.x + dir * 8, ankle.y - 6, ankle.x + dir * 18, ankle.y - 2);
  ctx.quadraticCurveTo(ankle.x + dir * 12, ankle.y + 2, ankle.x - dir * 2, ankle.y + 1);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ankle.x - dir * 1, ankle.y);
  ctx.lineTo(ankle.x - dir * 5, ankle.y + 13);
  ctx.lineTo(ankle.x - dir * 7, ankle.y + 14);
  ctx.lineTo(ankle.x - dir * 3, ankle.y + 14);
  ctx.lineTo(ankle.x - dir * 0, ankle.y + 1);
  ctx.closePath();
  ctx.fill();
}

function drawDressSkirt(ctx, p, s) {
  const hemY = Math.max(p.kL.y, p.kR.y) + 18;
  const flare = 24;
  const flutter = Math.sin(s.breath * 0.5) * 3;
  const flutter2 = Math.sin(s.breath * 0.4 + 1.2) * 2;
  const midX = (p.hL.x + p.hR.x) / 2;
  ctx.beginPath();
  ctx.moveTo(p.hL.x - 4, p.hL.y - 3);
  ctx.bezierCurveTo(p.hL.x - 10, (p.hL.y + hemY) / 2, p.kL.x - flare + flutter, hemY - 14, p.kL.x - flare + flutter, hemY);
  ctx.quadraticCurveTo(midX - 12, hemY + 6 + flutter2, midX, hemY + 5 + flutter2);
  ctx.quadraticCurveTo(midX + 12, hemY + 6 + flutter2, p.kR.x + flare - flutter, hemY);
  ctx.bezierCurveTo(p.kR.x + flare - flutter, hemY - 14, p.hR.x + 10, (p.hR.y + hemY) / 2, p.hR.x + 4, p.hR.y - 3);
  ctx.closePath();
  ctx.fill();
  // Waist belt
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = `hsla(${s.figHue}, ${s.figSat + 10}%, ${s.figLight + 15}%, 1)`;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(p.torso.x - 13, p.torso.y + 1);
  ctx.quadraticCurveTo(p.torso.x, p.torso.y + 3, p.torso.x + 13, p.torso.y + 1);
  ctx.stroke();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = `hsla(${s.figHue}, ${s.figSat + 10}%, ${s.figLight + 15}%, 1)`;
  ctx.fillRect(p.torso.x - 2, p.torso.y - 1, 4, 4);
  // Fold lines
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = `hsla(${s.figHue}, ${s.figSat}%, ${s.figLight + 10}%, 1)`;
  ctx.lineWidth = 0.8;
  const fT = p.hL.y + 8, fB = hemY - 6;
  ctx.beginPath(); ctx.moveTo(midX - 8, fT); ctx.quadraticCurveTo(midX - 12, (fT + fB) / 2, midX - 14 + flutter * 0.3, fB); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(midX + 6, fT); ctx.quadraticCurveTo(midX + 10, (fT + fB) / 2, midX + 12 - flutter * 0.3, fB); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(midX - 1, fT - 3); ctx.quadraticCurveTo(midX, (fT + fB) / 2, midX + 1, fB); ctx.stroke();
  ctx.restore();
}

function drawNeckline(ctx, p, s) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = `hsla(${s.figHue}, ${s.figSat + 10}%, ${s.figLight + 15}%, 1)`;
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  const neckY = (p.sL.y + p.sR.y) / 2;
  ctx.beginPath();
  ctx.moveTo(p.sL.x + 7, neckY + 2);
  ctx.lineTo(p.head.x, neckY + 16);
  ctx.lineTo(p.sR.x - 7, neckY + 2);
  ctx.stroke();
  ctx.restore();
}

function drawGlasses(ctx, p, s) {
  ctx.save();
  const hx = p.head.x, hy = p.head.y;
  const glassAlpha = s.figAlpha + 0.15;
  ctx.strokeStyle = `hsla(${s.figHue}, ${s.figSat + 10}%, ${s.figLight - 15}%, ${glassAlpha})`;
  ctx.fillStyle = `hsla(${s.figHue}, ${s.figSat + 15}%, ${s.figLight - 5}%, ${s.figAlpha * 0.25})`;
  ctx.lineWidth = 1.4;
  // Left cat-eye lens
  ctx.beginPath();
  ctx.moveTo(hx - 2, hy - 3);
  ctx.bezierCurveTo(hx - 3, hy - 6, hx - 9, hy - 7, hx - 12, hy - 5);
  ctx.bezierCurveTo(hx - 14, hy - 3, hx - 13, hy + 2, hx - 10, hy + 3);
  ctx.bezierCurveTo(hx - 7, hy + 4, hx - 3, hy + 1, hx - 2, hy - 1);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Right cat-eye lens
  ctx.beginPath();
  ctx.moveTo(hx + 2, hy - 3);
  ctx.bezierCurveTo(hx + 3, hy - 6, hx + 9, hy - 7, hx + 12, hy - 5);
  ctx.bezierCurveTo(hx + 14, hy - 3, hx + 13, hy + 2, hx + 10, hy + 3);
  ctx.bezierCurveTo(hx + 7, hy + 4, hx + 3, hy + 1, hx + 2, hy - 1);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Bridge
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(hx - 2, hy - 2.5); ctx.quadraticCurveTo(hx, hy - 4, hx + 2, hy - 2.5); ctx.stroke();
  // Temple arms
  ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.moveTo(hx - 12.5, hy - 4.5); ctx.lineTo(hx - 14, hy - 3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hx + 12.5, hy - 4.5); ctx.lineTo(hx + 14, hy - 3); ctx.stroke();
  ctx.restore();
}

function drawHair(ctx, p, s) {
  const hx = p.head.x, hy = p.head.y;
  const headDir = (hx - 200) * 0.12;
  // Hair cap
  ctx.beginPath();
  ctx.ellipse(hx, hy - 4, 16, 20, 0, -Math.PI * 0.95, -Math.PI * 0.05);
  ctx.fill();
  // Flowing strands
  ctx.save();
  ctx.lineCap = 'round';
  const strands = [
    { side: -1, startAngle: -0.78, len: 65, width: 3.5, alphaBase: 0.5, offset: 0 },
    { side: -1, startAngle: -0.65, len: 55, width: 2.5, alphaBase: 0.35, offset: 1.2 },
    { side: -1, startAngle: -0.88, len: 48, width: 2, alphaBase: 0.25, offset: 2.5 },
    { side: 1, startAngle: -0.22, len: 62, width: 3.5, alphaBase: 0.5, offset: 0.5 },
    { side: 1, startAngle: -0.35, len: 52, width: 2.5, alphaBase: 0.35, offset: 1.8 },
    { side: 1, startAngle: -0.12, len: 45, width: 2, alphaBase: 0.25, offset: 3 },
  ];
  strands.forEach(st => {
    const angle = Math.PI * st.startAngle;
    const sx = hx + Math.cos(angle) * 18;
    const sy = hy + Math.sin(angle) * 18;
    const sway = Math.sin(s.breath * 0.35 + st.offset) * 3;
    const sway2 = Math.sin(s.breath * 0.25 + st.offset + 1) * 4;
    ctx.globalAlpha = st.alphaBase;
    ctx.lineWidth = st.width;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(
      sx + st.side * 8 + headDir + sway, sy + st.len * 0.35,
      sx + st.side * 4 + headDir + sway2, sy + st.len * 0.65,
      sx + st.side * 6 + headDir + sway + sway2 * 0.5, sy + st.len
    );
    ctx.stroke();
  });
  ctx.restore();
}

function drawScarf(ctx, p, s) {
  ctx.save();
  const sway1 = Math.sin(s.breath * 0.35) * 5;
  const sway2 = Math.sin(s.breath * 0.28 + 0.8) * 4;
  const sway3 = Math.sin(s.breath * 0.4 + 1.5) * 3;
  const scarfFill = `hsla(${s.figHue + 30}, ${s.figSat + 18}%, ${s.figLight + 2}%, ${s.figAlpha * 0.75})`;
  ctx.fillStyle = scarfFill;
  ctx.shadowBlur = 10;
  ctx.shadowColor = `hsla(${s.figHue + 30}, ${s.figSat + 18}%, 60%, ${s.glowAlpha * 0.4})`;
  const neckY = (p.sL.y + p.sR.y) / 2 - 2;
  ctx.beginPath();
  ctx.moveTo(p.sL.x + 8, neckY - 3);
  ctx.quadraticCurveTo(p.head.x, neckY + 6, p.sR.x - 6, neckY - 2);
  ctx.quadraticCurveTo(p.head.x, neckY + 11, p.sL.x + 8, neckY + 3);
  ctx.closePath(); ctx.fill();
  const sx = p.sR.x - 8, sy = neckY;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.bezierCurveTo(sx + 10 + sway1, sy + 28, sx + 3 + sway2, sy + 58, sx + 8 + sway1 + sway3, sy + 88);
  ctx.lineTo(sx + 5 + sway1 + sway3, sy + 92);
  ctx.bezierCurveTo(sx - 1 + sway2, sy + 60, sx + 5 + sway1, sy + 30, sx - 4, sy + 4);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(sx - 2, sy + 2);
  ctx.bezierCurveTo(sx + 5 + sway1 * 0.6, sy + 20, sx - 1 + sway2 * 0.7, sy + 42, sx + 3 + sway3, sy + 60);
  ctx.lineTo(sx + 1 + sway3, sy + 63);
  ctx.bezierCurveTo(sx - 4 + sway2 * 0.5, sy + 42, sx + 1 + sway1 * 0.4, sy + 22, sx - 5, sy + 5);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ─── Environment / Aesthetic / Lighting ─────────────────────────────────────

function drawEnvironment(ctx, bg, breath, W, H) {
  if (bg === 'garden') {
    ctx.save();
    const g1 = ctx.createRadialGradient(60, 200, 10, 60, 200, 120);
    g1.addColorStop(0, 'rgba(34, 197, 94, 0.06)'); g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.06; ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(25, H); ctx.bezierCurveTo(35, 300, 45, 220, 55, 150); ctx.bezierCurveTo(50, 100, 60, 60, 65, 20); ctx.stroke();
    [[48,180,-0.4],[58,130,-0.6],[42,240,-0.3]].forEach(([lx,ly,rot]) => {
      ctx.beginPath(); ctx.ellipse(lx, ly, 14, 5, rot + Math.sin(breath * 0.4) * 0.08, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.beginPath(); ctx.moveTo(375, H); ctx.bezierCurveTo(365, 280, 350, 200, 345, 130); ctx.bezierCurveTo(350, 80, 340, 40, 335, 0); ctx.stroke();
    [[352,190,0.4],[342,140,0.5],[358,260,0.3]].forEach(([lx,ly,rot]) => {
      ctx.beginPath(); ctx.ellipse(lx, ly, 14, 5, rot - Math.sin(breath * 0.4) * 0.08, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.globalAlpha = 0.045; ctx.strokeStyle = '#a855f7';
    for (let i = 0; i < 6; i++) {
      const wx = 50 + i * 62;
      ctx.beginPath(); ctx.moveTo(wx, 0); ctx.bezierCurveTo(wx + 8, 20 + Math.sin(breath + i) * 2, wx - 4, 40 + Math.sin(breath * 0.7 + i) * 3, wx + 4, 55 + Math.sin(breath * 0.5 + i) * 4); ctx.stroke();
    }
    ctx.restore();
  } else if (bg === 'coastal') {
    ctx.save();
    const sky = ctx.createLinearGradient(0, 0, 0, 140);
    sky.addColorStop(0, 'rgba(6, 100, 150, 0.04)'); sky.addColorStop(1, 'transparent');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 140);
    ctx.globalAlpha = 0.07; ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, 125); ctx.lineTo(W, 123); ctx.stroke();
    ctx.globalAlpha = 0.04;
    for (let w = 0; w < 5; w++) {
      ctx.beginPath();
      const wy = 140 + w * 22;
      for (let x = 0; x <= W; x += 4) {
        const y = wy + Math.sin(x * 0.025 + breath * 0.6 + w * 1.8) * (2.5 + w * 0.8);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    const haze = ctx.createLinearGradient(0, 110, 0, 170);
    haze.addColorStop(0, 'rgba(200, 220, 240, 0.035)'); haze.addColorStop(1, 'transparent');
    ctx.fillStyle = haze; ctx.fillRect(0, 110, W, 60);
    ctx.restore();
  } else if (bg === 'studio') {
    ctx.save();
    ctx.globalAlpha = 0.03; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(30, 30); ctx.lineTo(85, 30); ctx.lineTo(200, H - 20); ctx.lineTo(100, H - 20); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(315, 30); ctx.lineTo(370, 30); ctx.lineTo(300, H - 20); ctx.lineTo(200, H - 20); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.06; ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8;
    ctx.strokeRect(25, 25, 65, 105);
    ctx.beginPath(); ctx.moveTo(57, 25); ctx.lineTo(57, 130); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(25, 77); ctx.lineTo(90, 77); ctx.stroke();
    ctx.strokeRect(310, 25, 65, 105);
    ctx.beginPath(); ctx.moveTo(342, 25); ctx.lineTo(342, 130); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(310, 77); ctx.lineTo(375, 77); ctx.stroke();
    ctx.globalAlpha = 0.04;
    ctx.beginPath(); ctx.moveTo(0, 365); ctx.lineTo(W, 365); ctx.stroke();
    ctx.restore();
  }
}

function drawAesthetic(ctx, aesthetic, breath, W, H) {
  if (aesthetic === 'timeless') {
    const g = ctx.createRadialGradient(200, 160, 30, 200, 180, 240);
    g.addColorStop(0, 'rgba(245, 180, 80, 0.06)'); g.addColorStop(0.5, 'rgba(245, 158, 11, 0.03)'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else if (aesthetic === 'indie') {
    ctx.save(); ctx.globalAlpha = 0.03;
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(Math.random()*W, Math.random()*H, 0.5+Math.random()*1.5, 0.5+Math.random()*1.5);
    }
    ctx.restore();
    const v = ctx.createRadialGradient(200, 200, 60, 200, 200, 260);
    v.addColorStop(0, 'transparent'); v.addColorStop(1, 'rgba(100, 50, 10, 0.06)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  } else if (aesthetic === 'ethereal') {
    [{ x:130,y:110,r:140,c:'rgba(168,85,247,0.05)' },{ x:280,y:200,r:120,c:'rgba(236,72,153,0.04)' },{ x:170,y:300,r:130,c:'rgba(6,182,212,0.035)' }].forEach(w => {
      const g = ctx.createRadialGradient(w.x, w.y, 10, w.x, w.y, w.r);
      g.addColorStop(0, w.c); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
  }
}

function drawLighting(ctx, lighting, W, H) {
  if (lighting === 'golden') {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(245, 180, 60, 0.08)'); g.addColorStop(0.4, 'rgba(245, 158, 11, 0.03)'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else if (lighting === 'dramatic') {
    const g = ctx.createLinearGradient(380, 0, 20, H);
    g.addColorStop(0, 'rgba(255,255,255,0.07)'); g.addColorStop(0.25, 'transparent'); g.addColorStop(0.6, 'rgba(0,0,0,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0.14)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else if (lighting === 'soft') {
    const g = ctx.createRadialGradient(200, 80, 30, 200, 200, 220);
    g.addColorStop(0, 'rgba(255,255,255,0.07)'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
}

function drawParticles(ctx, s) {
  ctx.save();
  s.particles.forEach(pt => {
    pt.x += pt.vx + Math.sin(s.breath * 0.4 + pt.phase) * pt.drift * 0.15;
    pt.y += pt.vy + Math.cos(s.breath * 0.25 + pt.phase) * 0.08;
    pt.vx += (200 - pt.x) * 0.00003;
    pt.vy += (190 - pt.y) * 0.00003;
    if (pt.y < -10) { pt.y = 410; pt.x = 60 + Math.random() * 280; }
    if (pt.y > 410) { pt.y = -10; pt.x = 60 + Math.random() * 280; }
    if (pt.x < -10) pt.x = 410;
    if (pt.x > 410) pt.x = -10;
    const flicker = 0.5 + 0.5 * Math.sin(s.breath * 0.8 + pt.phase);
    ctx.globalAlpha = pt.alpha * flicker;
    ctx.fillStyle = `hsla(${s.figHue + (pt.phase * 20) % 40 - 20}, 40%, 75%, 1)`;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
  ctx.save();
  s.burstParticles = s.burstParticles.filter(bp => {
    bp.life -= 0.015;
    if (bp.life <= 0) return false;
    bp.x += bp.vx; bp.y += bp.vy; bp.vy += 0.02; bp.vx *= 0.99;
    ctx.globalAlpha = bp.life * 0.6;
    ctx.fillStyle = bp.color;
    ctx.beginPath(); ctx.arc(bp.x, bp.y, bp.size * bp.life, 0, Math.PI * 2); ctx.fill();
    return true;
  });
  ctx.restore();
}


// ─── Mini Demo Data ─────────────────────────────────────────────────────────────

const demoCategories = [
  {
    key: 'pose',
    label: 'Pose',
    color: '#10b981',
    options: [
      { id: 'confident', label: 'Confident', figurePose: 'confident', prompt: 'shoulders back, commanding presence, power stance, one foot forward' },
      { id: 'relaxed', label: 'Relaxed', figurePose: 'relaxed', prompt: 'leaning, one leg bent, hip shifted, elegant S-curve' },
      { id: 'dramatic', label: 'Dramatic', figurePose: 'dramatic', prompt: 'back half-turned, looking over shoulder, one hand raised, dynamic tension' },
    ]
  },
  {
    key: 'lighting',
    label: 'Lighting',
    color: '#f59e0b',
    options: [
      { id: 'golden', label: 'Golden Hour', lightingStyle: 'golden', prompt: 'warm golden hour light, soft glow, elongated shadows, romantic radiance' },
      { id: 'dramatic', label: 'Hard Light', lightingStyle: 'dramatic', prompt: 'dramatic hard light, high-contrast, sharp shadows, theatrical' },
      { id: 'soft', label: 'Soft Diffused', lightingStyle: 'soft', prompt: 'soft diffused window light, gentle glow, minimal shadows, dreamlike' },
    ]
  },
  {
    key: 'aesthetic',
    label: 'Aesthetic',
    color: '#a855f7',
    options: [
      { id: 'timeless', label: 'Timeless', prompt: 'sophisticated timeless elegance, classic Hollywood, serene luxury' },
      { id: 'indie', label: 'Indie Film', prompt: 'raw indie warmth, candid feel, analog grain, authentic moment' },
      { id: 'ethereal', label: 'Ethereal', prompt: 'ethereal softness, dreamy pastels, gentle otherworldly glow' },
    ]
  },
  {
    key: 'background',
    label: 'Background',
    color: '#06b6d4',
    options: [
      { id: 'garden', label: 'Garden', prompt: 'lush garden, cascading wisteria, stone terraces, topiary' },
      { id: 'coastal', label: 'Coastal', prompt: 'private beach, weathered fence, sand dunes, mist over water' },
      { id: 'studio', label: 'Studio', prompt: 'minimalist interior, high ceilings, large windows, polished floors' },
    ]
  },
];


// ─── First Time Experience ──────────────────────────────────────────────────────

const FirstTimeExperience = ({ onComplete, onSkip }) => {
  const [selections, setSelections] = useState({});
  const [isExiting, setIsExiting] = useState(false);
  const [copied, setCopied] = useState(false);

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
            background: '#050508',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'linear-gradient(160deg, #08080f 0%, #0c0c16 50%, #0a0a12 100%)',
              borderRadius: '24px',
              maxWidth: '920px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
              maxHeight: '94vh',
              overflowY: 'auto',
              boxShadow: '0 0 80px rgba(0,0,0,0.6), 0 0 200px rgba(120, 80, 200, 0.03)',
            }}
          >
            {/* Skip */}
            <button
              onClick={handleSkip}
              aria-label="Skip introduction"
              style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.2)',
                fontSize: '13px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.3s',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                letterSpacing: '0.3px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}
            >
              skip
              <X size={12} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'row', minHeight: '520px' }} className="fte-layout">
              {/* ─── Left: Canvas Figure ─── */}
              <div style={{
                flex: '0 0 46%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 20px',
                position: 'relative',
                borderRight: '1px solid rgba(255,255,255,0.03)',
              }}>
                {hasSelections && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: (() => {
                        const selKeys = Object.keys(selections);
                        const lastCat = demoCategories.find(c => c.key === selKeys[selKeys.length - 1]);
                        const col = lastCat?.color || '#8b5cf6';
                        return `radial-gradient(ellipse at 50% 50%, ${col}0a 0%, transparent 70%)`;
                      })(),
                      pointerEvents: 'none',
                    }}
                  />
                )}

                <PoseFigureCanvas
                  pose={currentFigurePose}
                  lightingStyle={currentLighting}
                  aestheticStyle={selections.aesthetic?.id || null}
                  backgroundStyle={selections.background?.id || null}
                  selectionCount={selectionCount}
                />

                {/* Live prompt preview */}
                <AnimatePresence>
                  {hasSelections && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        width: '100%',
                        maxWidth: '360px',
                        marginTop: '4px',
                        padding: '14px 16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '12px',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}>
                        <span style={{
                          fontSize: '9.5px',
                          fontWeight: '600',
                          color: 'rgba(255,255,255,0.3)',
                          textTransform: 'uppercase',
                          letterSpacing: '1.5px',
                        }}>
                          Generated prompt
                        </span>
                        <motion.button
                          onClick={handleCopy}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            padding: '3px 10px',
                            background: copied ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255,255,255,0.05)',
                            border: '1px solid ' + (copied ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.06)'),
                            borderRadius: '6px',
                            color: copied ? '#22c55e' : 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                            transition: 'all 0.25s',
                          }}
                        >
                          {copied ? <Check size={10} /> : <Copy size={10} />}
                          {copied ? 'Copied' : 'Copy'}
                        </motion.button>
                      </div>
                      <p style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.45)',
                        lineHeight: '1.7',
                        margin: 0,
                        fontFamily: '"SF Mono", "JetBrains Mono", "Fira Code", monospace',
                        maxHeight: '72px',
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
                padding: 'clamp(28px, 4vw, 44px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                >
                  <h2 style={{
                    fontSize: 'clamp(22px, 4vw, 28px)',
                    fontWeight: '300',
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '6px',
                    letterSpacing: '-0.5px',
                    lineHeight: '1.2',
                  }}>
                    Compose your <span style={{
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #c4b5fd, #a78bfa, #818cf8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>vision</span>
                  </h2>
                  <p style={{
                    fontSize: 'clamp(13px, 2.5vw, 14px)',
                    color: 'rgba(255,255,255,0.3)',
                    marginBottom: '30px',
                    lineHeight: '1.5',
                    fontWeight: '400',
                  }}>
                    Select from each category. Watch the prompt write itself.
                  </p>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {demoCategories.map((cat, catIdx) => (
                    <motion.div
                      key={cat.key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.22 + catIdx * 0.1 }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '9px',
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: selections[cat.key] ? cat.color : 'rgba(255,255,255,0.12)',
                          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: selections[cat.key] ? `0 0 10px ${cat.color}, 0 0 20px ${cat.color}` : 'none',
                          transform: selections[cat.key] ? 'scale(1.3)' : 'scale(1)',
                        }} />
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: selections[cat.key] ? cat.color : 'rgba(255,255,255,0.3)',
                          textTransform: 'uppercase',
                          letterSpacing: '1.2px',
                          transition: 'color 0.4s',
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
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.96 }}
                              style={{
                                padding: '9px 18px',
                                background: isSelected ? `${cat.color}15` : 'rgba(255,255,255,0.025)',
                                border: `1px solid ${isSelected ? cat.color + '40' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: '10px',
                                color: isSelected ? cat.color : 'rgba(255,255,255,0.5)',
                                fontSize: '13px',
                                fontWeight: isSelected ? '600' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                outline: 'none',
                                whiteSpace: 'nowrap',
                                boxShadow: isSelected ? `0 0 20px ${cat.color}20` : 'none',
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

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  style={{ marginTop: '28px' }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginBottom: '16px',
                  }}>
                    {demoCategories.map((cat) => (
                      <div
                        key={cat.key}
                        style={{
                          flex: 1,
                          height: selections[cat.key] ? '2.5px' : '2px',
                          borderRadius: '1px',
                          background: selections[cat.key] ? cat.color : 'rgba(255,255,255,0.06)',
                          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: selections[cat.key] ? `0 0 8px ${cat.color}` : 'none',
                        }}
                      />
                    ))}
                    <span style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.2)',
                      marginLeft: '8px',
                      whiteSpace: 'nowrap',
                      fontWeight: '500',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {selectionCount} / {demoCategories.length}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '12.5px',
                    color: 'rgba(255,255,255,0.25)',
                    lineHeight: '1.6',
                    marginBottom: '18px',
                    fontWeight: '400',
                  }}>
                    {selectionCount === 0
                      ? 'Each category adds a layer to the final prompt.'
                      : selectionCount < demoCategories.length
                        ? `${demoCategories.length - selectionCount} more to explore \u2014 or dive in now.`
                        : 'The full tool has 33 categories across pose, styling, camera, and more.'}
                  </p>

                  <motion.button
                    onClick={handleComplete}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    style={{
                      width: '100%',
                      padding: '15px 24px',
                      background: hasSelections
                        ? 'linear-gradient(135deg, #a855f7, #6366f1, #3b82f6)'
                        : 'rgba(255,255,255,0.04)',
                      border: hasSelections ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      color: hasSelections ? '#fff' : 'rgba(255,255,255,0.35)',
                      fontSize: '15px',
                      fontWeight: hasSelections ? '600' : '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                      outline: 'none',
                      letterSpacing: '0.2px',
                      boxShadow: hasSelections ? '0 4px 30px rgba(120, 80, 200, 0.2), 0 0 60px rgba(120, 80, 200, 0.1)' : 'none',
                    }}
                  >
                    {hasSelections ? 'Open the full studio' : 'Skip to the studio'}
                    <ArrowRight size={16} />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <style>{`
            @media (max-width: 700px) {
              .fte-layout {
                flex-direction: column !important;
                min-height: auto !important;
              }
              .fte-layout > div:first-child {
                border-right: none !important;
                border-bottom: 1px solid rgba(255,255,255,0.03) !important;
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
