import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Copy, Check, X } from 'lucide-react';

const ONBOARDING_KEY = 'poseprompt_onboarding_complete';

// ─── Pose Figure SVG ─────────────────────────────────────────────────────────
// An SVG-based fashion illustration with face features, watercolor filter,
// multi-color palette (skin/dress/hair/scarf/shoes), flowing animations,
// cat-eye sunglasses, and stiletto heels. Responds to pose/lighting/aesthetic/
// background selections with smooth transitions and particle effects.

const FIGURE_POSES = {
  default: {
    head:{x:200,y:52}, sL:{x:183,y:88}, sR:{x:217,y:88},
    torso:{x:200,y:148}, hL:{x:191,y:176}, hR:{x:209,y:176},
    eL:{x:170,y:138}, eR:{x:230,y:138},
    wL:{x:166,y:192}, wR:{x:234,y:192},
    kL:{x:195,y:260}, kR:{x:205,y:260},
    fL:{x:193,y:338}, fR:{x:207,y:338},
  },
  confident: {
    head:{x:200,y:48}, sL:{x:180,y:86}, sR:{x:220,y:86},
    torso:{x:200,y:146}, hL:{x:189,y:174}, hR:{x:211,y:174},
    eL:{x:164,y:134}, eR:{x:236,y:134},
    wL:{x:158,y:186}, wR:{x:242,y:186},
    kL:{x:192,y:258}, kR:{x:208,y:258},
    fL:{x:188,y:338}, fR:{x:212,y:338},
  },
  relaxed: {
    head:{x:198,y:54}, sL:{x:183,y:90}, sR:{x:216,y:87},
    torso:{x:199,y:150}, hL:{x:191,y:178}, hR:{x:209,y:175},
    eL:{x:172,y:148}, eR:{x:232,y:130},
    wL:{x:170,y:200}, wR:{x:236,y:178},
    kL:{x:195,y:260}, kR:{x:208,y:256},
    fL:{x:193,y:338}, fR:{x:211,y:338},
  },
  dramatic: {
    head:{x:198,y:50}, sL:{x:182,y:87}, sR:{x:218,y:85},
    torso:{x:200,y:148}, hL:{x:192,y:176}, hR:{x:210,y:174},
    eL:{x:166,y:130}, eR:{x:236,y:120},
    wL:{x:160,y:172}, wR:{x:246,y:108},
    kL:{x:195,y:260}, kR:{x:212,y:254},
    fL:{x:193,y:338}, fR:{x:214,y:338},
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

// ─── SVG Path Builders ───────────────────────────────────────────────────────

function n(v) { return Math.round(v * 10) / 10; }
function hsla(c) { return `hsla(${n(c.h)}, ${n(c.s)}%, ${n(c.l)}%, ${n(c.a)})`; }
function lerpColor(c, t, sp) { const s = sp || 0.025; c.h += (t.h - c.h) * s; c.s += (t.s - c.s) * s; c.l += (t.l - c.l) * s; c.a += (t.a - c.a) * s; }

function bodyDressD(p, breath) {
  const hemY = Math.max(p.kL.y, p.kR.y) + 20;
  const fl = Math.sin(breath * 0.5) * 2;
  const sY = (p.sL.y + p.sR.y) / 2;
  const cx = (p.sL.x + p.sR.x) / 2;
  const cxW = p.torso.x;
  const cxH = (p.hL.x + p.hR.x) / 2;
  const neckVy = sY + 14;
  const bustY = sY + 20;
  const wY = p.torso.y;
  const hY = (p.hL.y + p.hR.y) / 2;
  const shW = 18, buW = 16, waW = 9, hiW = 13, heW = 22;
  return [
    `M ${n(cx)},${n(neckVy)}`,
    `C ${n(cx+3)},${n(neckVy-8)} ${n(cx+shW-5)},${n(sY-2)} ${n(cx+shW)},${n(sY+2)}`,
    `C ${n(cx+shW+1)},${n(sY+10)} ${n(cxW+buW+2)},${n(bustY-4)} ${n(cxW+buW)},${n(bustY)}`,
    `C ${n(cxW+buW-2)},${n(bustY+6)} ${n(cxW+waW+3)},${n(wY-6)} ${n(cxW+waW)},${n(wY)}`,
    `C ${n(cxW+waW-1)},${n(wY+6)} ${n(cxH+hiW-2)},${n(hY-6)} ${n(cxH+hiW)},${n(hY)}`,
    `C ${n(cxH+hiW+4)},${n((hY+hemY)/2)} ${n(cxH+heW+fl)},${n(hemY-12)} ${n(cxH+heW+fl)},${n(hemY)}`,
    `Q ${n(cxH)},${n(hemY+6)} ${n(cxH-heW-fl)},${n(hemY)}`,
    `C ${n(cxH-heW-fl)},${n(hemY-12)} ${n(cxH-hiW-4)},${n((hY+hemY)/2)} ${n(cxH-hiW)},${n(hY)}`,
    `C ${n(cxH-hiW+2)},${n(hY-6)} ${n(cxW-waW+1)},${n(wY+6)} ${n(cxW-waW)},${n(wY)}`,
    `C ${n(cxW-waW-3)},${n(wY-6)} ${n(cxW-buW+2)},${n(bustY+6)} ${n(cxW-buW)},${n(bustY)}`,
    `C ${n(cxW-buW-2)},${n(bustY-4)} ${n(cx-shW-1)},${n(sY+10)} ${n(cx-shW)},${n(sY+2)}`,
    `C ${n(cx-shW+5)},${n(sY-2)} ${n(cx-3)},${n(neckVy-8)} ${n(cx)},${n(neckVy)}`,
    'Z'
  ].join(' ');
}

function neckD(p) {
  const hx = p.head.x, hy = p.head.y;
  const sY = (p.sL.y + p.sR.y) / 2;
  return `M ${n(hx-5)},${n(hy+14)} C ${n(hx-4)},${n(hy+20)} ${n(p.sL.x+6)},${n(sY-2)} ${n(p.sL.x+10)},${n(sY+2)} L ${n(p.sR.x-10)},${n(sY+2)} C ${n(p.sR.x-6)},${n(sY-2)} ${n(hx+4)},${n(hy+20)} ${n(hx+5)},${n(hy+14)} Z`;
}

function armD(s, e, w) { return `M ${n(s.x)},${n(s.y)} Q ${n(e.x)},${n(e.y)} ${n(w.x)},${n(w.y)}`; }

function legD(knee, foot, hemY) {
  const tx = knee.x, ty = hemY + 2;
  return `M ${n(tx-2.5)},${n(ty)} C ${n(tx-2)},${n((ty+foot.y)/2)} ${n(foot.x-2)},${n(foot.y-10)} ${n(foot.x)},${n(foot.y+2)} C ${n(foot.x+2)},${n(foot.y-10)} ${n(tx+2)},${n((ty+foot.y)/2)} ${n(tx+2.5)},${n(ty)} Z`;
}

function hairBackD(p) {
  const hx = p.head.x, hy = p.head.y, dir = (hx - 200) * 0.08;
  return `M ${n(hx-12)},${n(hy-8)} C ${n(hx-20)},${n(hy-5)} ${n(hx-22+dir)},${n(hy+15)} ${n(hx-18+dir)},${n(hy+45)} C ${n(hx-16+dir)},${n(hy+60)} ${n(hx-14+dir)},${n(hy+65)} ${n(hx-10+dir)},${n(hy+55)} C ${n(hx-6)},${n(hy+40)} ${n(hx-4)},${n(hy+20)} ${n(hx)},${n(hy+10)} C ${n(hx+4)},${n(hy+20)} ${n(hx+6)},${n(hy+35)} ${n(hx+10+dir)},${n(hy+48)} C ${n(hx+14+dir)},${n(hy+58)} ${n(hx+16+dir)},${n(hy+55)} ${n(hx+18+dir)},${n(hy+42)} C ${n(hx+22+dir)},${n(hy+15)} ${n(hx+20)},${n(hy-5)} ${n(hx+12)},${n(hy-8)} Z`;
}

function scarfPathsD(p, breath) {
  const sw1 = Math.sin(breath * 0.35) * 5, sw2 = Math.sin(breath * 0.28 + 0.8) * 4, sw3 = Math.sin(breath * 0.4 + 1.5) * 3;
  const ny = (p.sL.y + p.sR.y) / 2 - 2;
  const wrap = `M ${n(p.sL.x+8)},${n(ny-3)} Q ${n(p.head.x)},${n(ny+6)} ${n(p.sR.x-6)},${n(ny-2)} Q ${n(p.head.x)},${n(ny+11)} ${n(p.sL.x+8)},${n(ny+3)} Z`;
  const sx = p.sR.x - 8, sy = ny;
  const tail1 = `M ${n(sx)},${n(sy)} C ${n(sx+10+sw1)},${n(sy+28)} ${n(sx+3+sw2)},${n(sy+58)} ${n(sx+8+sw1+sw3)},${n(sy+88)} L ${n(sx+5+sw1+sw3)},${n(sy+92)} C ${n(sx-1+sw2)},${n(sy+60)} ${n(sx+5+sw1)},${n(sy+30)} ${n(sx-4)},${n(sy+4)} Z`;
  const tail2 = `M ${n(sx-2)},${n(sy+2)} C ${n(sx+5+sw1*0.6)},${n(sy+20)} ${n(sx-1+sw2*0.7)},${n(sy+42)} ${n(sx+3+sw3)},${n(sy+60)} L ${n(sx+1+sw3)},${n(sy+63)} C ${n(sx-4+sw2*0.5)},${n(sy+42)} ${n(sx+1+sw1*0.4)},${n(sy+22)} ${n(sx-5)},${n(sy+5)} Z`;
  return { wrap, tail1, tail2 };
}

// Strand configs
const STRAND_CONFIGS = [
  { side: -1, startAngle: -0.78, len: 70, width: 3.5, alphaBase: 0.5, offset: 0 },
  { side: -1, startAngle: -0.65, len: 58, width: 2.5, alphaBase: 0.35, offset: 1.2 },
  { side: -1, startAngle: -0.88, len: 50, width: 2, alphaBase: 0.25, offset: 2.5 },
  { side: 1, startAngle: -0.22, len: 68, width: 3.5, alphaBase: 0.5, offset: 0.5 },
  { side: 1, startAngle: -0.35, len: 55, width: 2.5, alphaBase: 0.35, offset: 1.8 },
  { side: 1, startAngle: -0.12, len: 48, width: 2, alphaBase: 0.25, offset: 3 },
];

// ─── Background SVG Builders ─────────────────────────────────────────────────

function buildBgSvg(bg) {
  if (bg === 'garden') {
    const vs = 'fill="none" stroke="rgba(34,197,94,0.06)" stroke-width="1.5" stroke-linecap="round"';
    const lf = 'fill="none" stroke="rgba(34,197,94,0.05)" stroke-width="1.2"';
    let wist = '';
    for (let i = 0; i < 6; i++) { const wx = 50 + i * 62; wist += `<path d="M ${wx},0 C ${wx+8},20 ${wx-4},40 ${wx+4},55" fill="none" stroke="rgba(168,85,247,0.04)" stroke-width="1.2"/>`; }
    return `<circle cx="60" cy="200" r="120" fill="rgba(34,197,94,0.05)"/><circle cx="340" cy="180" r="100" fill="rgba(34,197,94,0.035)"/><path d="M 25,400 C 35,300 45,220 55,150 C 50,100 60,60 65,20" ${vs}/><path d="M 375,400 C 365,280 350,200 345,130 C 350,80 340,40 335,0" ${vs}/><ellipse cx="48" cy="180" rx="14" ry="5" transform="rotate(-23 48 180)" ${lf}/><ellipse cx="58" cy="130" rx="14" ry="5" transform="rotate(-34 58 130)" ${lf}/><ellipse cx="352" cy="190" rx="14" ry="5" transform="rotate(23 352 190)" ${lf}/>${wist}`;
  }
  if (bg === 'coastal') {
    let waves = '';
    for (let w = 0; w < 5; w++) { const wy = 140 + w * 22; let d = ''; for (let x = 0; x <= 400; x += 8) { const y = wy + Math.sin(x * 0.025 + w * 1.8) * (2.5 + w * 0.8); d += (x === 0 ? 'M' : 'L') + ` ${n(x)},${n(y)} `; } waves += `<path d="${d}" fill="none" stroke="rgba(6,182,212,0.04)" stroke-width="0.8"/>`; }
    return `<rect x="0" y="0" width="400" height="140" fill="rgba(6,100,150,0.04)"/><line x1="0" y1="125" x2="400" y2="123" stroke="rgba(6,182,212,0.07)" stroke-width="0.8"/>${waves}<rect x="0" y="330" width="400" height="70" fill="rgba(245,158,11,0.025)"/>`;
  }
  if (bg === 'studio') {
    const fs = 'fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"';
    return `<polygon points="30,30 85,30 200,380 100,380" fill="rgba(255,255,255,0.025)"/><polygon points="315,30 370,30 300,380 200,380" fill="rgba(255,255,255,0.025)"/><rect x="25" y="25" width="65" height="105" ${fs}/><line x1="57" y1="25" x2="57" y2="130" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/><line x1="25" y1="77" x2="90" y2="77" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/><rect x="310" y="25" width="65" height="105" ${fs}/><line x1="342" y1="25" x2="342" y2="130" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/><line x1="310" y1="77" x2="375" y2="77" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/><line x1="0" y1="365" x2="400" y2="365" stroke="rgba(255,255,255,0.04)" stroke-width="0.8"/>`;
  }
  return '';
}

function buildAestheticSvg(aes) {
  if (aes === 'timeless') return '<circle cx="200" cy="160" r="200" fill="rgba(245,180,80,0.04)"/>';
  if (aes === 'indie') return '<circle cx="200" cy="200" r="220" fill="rgba(100,50,10,0.04)"/>';
  if (aes === 'ethereal') return '<circle cx="130" cy="110" r="140" fill="rgba(168,85,247,0.04)"/><circle cx="280" cy="200" r="120" fill="rgba(236,72,153,0.03)"/><circle cx="170" cy="300" r="130" fill="rgba(6,182,212,0.025)"/>';
  return '';
}

function buildLightingSvg(lt) {
  if (lt === 'golden') return '<rect x="0" y="0" width="400" height="400" fill="rgba(245,180,60,0.05)"/>';
  if (lt === 'dramatic') return '<rect x="0" y="0" width="200" height="400" fill="rgba(255,255,255,0.03)"/><rect x="200" y="0" width="200" height="400" fill="rgba(0,0,0,0.06)"/>';
  if (lt === 'soft') return '<circle cx="200" cy="80" r="200" fill="rgba(255,255,255,0.04)"/>';
  return '';
}

// ─── Pose Figure SVG Component ───────────────────────────────────────────────

const PoseFigureSVG = ({ pose = 'default', lightingStyle = null, aestheticStyle = null, backgroundStyle = null, selectionCount = 0 }) => {
  const svgRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    currentPose: JSON.parse(JSON.stringify(FIGURE_POSES.default)),
    targetPose: FIGURE_POSES.default,
    morphProgress: 1,
    breath: 0,
    colors: {
      skin:  { h:25, s:35, l:80, a:0.85 },
      dress: { h:280, s:22, l:72, a:0.55 },
      hair:  { h:28, s:40, l:28, a:0.75 },
      scarf: { h:310, s:28, l:72, a:0.5 },
      shoe:  { h:280, s:18, l:35, a:0.65 },
      glow:  { h:280, s:35, l:60, a:0.12 },
    },
    targets: {
      skin:  { h:25, s:35, l:80, a:0.85 },
      dress: { h:280, s:22, l:72, a:0.55 },
      hair:  { h:28, s:40, l:28, a:0.75 },
      scarf: { h:310, s:28, l:72, a:0.5 },
      shoe:  { h:280, s:18, l:35, a:0.65 },
      glow:  { h:280, s:35, l:60, a:0.12 },
    },
    particles: [],
    burstParticles: [],
    particleEls: [],
  });

  // Init particles
  useEffect(() => {
    const s = stateRef.current;
    if (s.particles.length > 0) return;
    const layer = svgRef.current?.querySelector('#particleLayer');
    if (!layer) return;
    for (let i = 0; i < 50; i++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const pt = {
        el: c,
        x: 60 + Math.random() * 280, y: 30 + Math.random() * 340,
        vx: (Math.random() - 0.5) * 0.15, vy: -0.05 - Math.random() * 0.1,
        size: 0.4 + Math.random() * 2.2, alpha: 0.03 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2, drift: 0.3 + Math.random() * 0.7,
      };
      c.setAttribute('r', pt.size);
      c.setAttribute('cx', pt.x);
      c.setAttribute('cy', pt.y);
      c.setAttribute('fill', 'white');
      c.setAttribute('opacity', pt.alpha);
      layer.appendChild(c);
      s.particles.push(pt);
    }
  }, []);

  // Init strand elements
  const strandElsRef = useRef([]);
  useEffect(() => {
    const g = svgRef.current?.querySelector('#hairStrands');
    if (!g || strandElsRef.current.length > 0) return;
    STRAND_CONFIGS.forEach(sc => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-width', sc.width);
      g.appendChild(path);
      strandElsRef.current.push(path);
    });
  }, []);

  // Update targets on prop change
  useEffect(() => {
    const s = stateRef.current;
    s.targetPose = FIGURE_POSES[pose] || FIGURE_POSES.default;
    s.morphProgress = 0;

    const count = selectionCount;
    s.targets.skin = { h:25, s:35, l:80, a: 0.8 + count * 0.04 };

    if (aestheticStyle === 'timeless') {
      s.targets.dress = { h:38, s:45, l:76, a:0.6 };
      s.targets.scarf = { h:15, s:38, l:68, a:0.55 };
      s.targets.shoe = { h:30, s:25, l:32, a:0.7 };
    } else if (aestheticStyle === 'indie') {
      s.targets.dress = { h:18, s:42, l:58, a:0.6 };
      s.targets.scarf = { h:45, s:48, l:72, a:0.55 };
      s.targets.shoe = { h:15, s:30, l:28, a:0.7 };
    } else if (aestheticStyle === 'ethereal') {
      s.targets.dress = { h:270, s:42, l:78, a:0.55 };
      s.targets.scarf = { h:195, s:42, l:75, a:0.5 };
      s.targets.shoe = { h:260, s:25, l:40, a:0.65 };
    } else {
      s.targets.dress = { h:280, s:22, l:72, a:0.5 + count * 0.05 };
      s.targets.scarf = { h:310, s:28, l:72, a:0.45 + count * 0.04 };
      s.targets.shoe = { h:280, s:18, l:35, a:0.6 + count * 0.03 };
    }

    s.targets.hair = { h:28, s:35 + count * 4, l:26 + count * 2, a:0.7 + count * 0.05 };

    if (lightingStyle === 'golden') {
      s.targets.glow = { h:40, s:60, l:60, a:0.22 };
      s.targets.skin.h = 28; s.targets.skin.s = 42;
    } else if (lightingStyle === 'dramatic') {
      s.targets.glow = { h:0, s:0, l:50, a:0.25 };
    } else if (lightingStyle === 'soft') {
      s.targets.glow = { h:210, s:25, l:70, a:0.18 };
    } else {
      s.targets.glow = { h:280, s:35, l:60, a:0.1 + count * 0.04 };
    }

    // Spawn burst
    const bl = svgRef.current?.querySelector('#burstLayer');
    if (bl) {
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.3;
        const speed = 1 + Math.random() * 3;
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('fill', `hsla(${s.targets.glow.h}, 50%, 70%, 1)`);
        bl.appendChild(c);
        s.burstParticles.push({
          el: c, x: 200, y: 180,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1,
          size: 1 + Math.random() * 3, life: 0.7 + Math.random() * 0.3,
        });
      }
    }
  }, [pose, lightingStyle, aestheticStyle, backgroundStyle, selectionCount]);

  // Update bg/aesthetic/lighting SVG content
  useEffect(() => {
    const el = svgRef.current?.querySelector('#bgLayer');
    if (el) el.innerHTML = buildBgSvg(backgroundStyle);
  }, [backgroundStyle]);

  useEffect(() => {
    const el = svgRef.current?.querySelector('#aestheticLayer');
    if (el) el.innerHTML = buildAestheticSvg(aestheticStyle);
  }, [aestheticStyle]);

  useEffect(() => {
    const el = svgRef.current?.querySelector('#lightingLayer');
    if (el) el.innerHTML = buildLightingSvg(lightingStyle);
  }, [lightingStyle]);

  // Main animation loop
  const animate = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const s = stateRef.current;
    const $ = id => svg.querySelector('#' + id);
    s.breath += 0.018;

    // Interpolate colors
    for (const key in s.colors) lerpColor(s.colors[key], s.targets[key]);

    // Pose
    if (s.morphProgress < 1) {
      s.morphProgress = Math.min(1, s.morphProgress + 0.022);
      s.currentPose = lerpPose(s.currentPose, s.targetPose, easeInOutCubic(s.morphProgress));
    }

    // Breathing
    const bOff = Math.sin(s.breath) * 1.8;
    const p = {};
    for (const key in s.currentPose) p[key] = { ...s.currentPose[key] };
    ['head','sL','sR'].forEach(k => { if (p[k]) p[k].y += bOff * 0.2; });
    ['eL','eR'].forEach(k => { if (p[k]) p[k].y += bOff * 0.08; });

    const skinC = hsla(s.colors.skin);
    const hairC = hsla(s.colors.hair);
    const scarfC = hsla(s.colors.scarf);
    const shoeC = hsla(s.colors.shoe);
    const glowC = hsla(s.colors.glow);
    const hemY = Math.max(p.kL.y, p.kR.y) + 20;

    // Gradient stops
    const gradTop = $('gradTop');
    const gradMid = $('gradMid');
    const gradBot = $('gradBot');
    const skinTop = $('skinTop');
    const skinBot = $('skinBot');
    if (gradTop) gradTop.setAttribute('stop-color', `hsla(${n(s.colors.dress.h)},${n(s.colors.dress.s)}%,${n(s.colors.dress.l+8)}%,${n(s.colors.dress.a+0.1)})`);
    if (gradMid) gradMid.setAttribute('stop-color', `hsla(${n(s.colors.dress.h)},${n(s.colors.dress.s+5)}%,${n(s.colors.dress.l)}%,${n(s.colors.dress.a)})`);
    if (gradBot) gradBot.setAttribute('stop-color', `hsla(${n(s.colors.dress.h)},${n(s.colors.dress.s)}%,${n(s.colors.dress.l-8)}%,${n(Math.max(0,s.colors.dress.a-0.08))})`);
    if (skinTop) skinTop.setAttribute('stop-color', `hsla(${n(s.colors.skin.h)},${n(s.colors.skin.s)}%,${n(s.colors.skin.l+3)}%,${n(s.colors.skin.a)})`);
    if (skinBot) skinBot.setAttribute('stop-color', `hsla(${n(s.colors.skin.h)},${n(s.colors.skin.s+5)}%,${n(s.colors.skin.l-3)}%,${n(s.colors.skin.a)})`);

    // Ground shadow
    const gs = $('groundShadow');
    if (gs) { gs.setAttribute('cx', n(p.torso.x)); gs.setAttribute('cy', n(Math.max(p.fL.y, p.fR.y) + 14)); }

    // Figure glow
    const fg = $('figGlow');
    if (fg) { fg.setAttribute('cx', n(p.torso.x)); fg.setAttribute('cy', n((p.head.y + p.torso.y) / 2 + 20)); fg.setAttribute('fill', glowC); }

    // Body silhouette
    const bd = bodyDressD(p, s.breath);
    const bw = $('bodyWash');
    if (bw) { bw.setAttribute('d', bd); bw.setAttribute('fill', `hsla(${n(s.colors.dress.h)},${n(s.colors.dress.s)}%,${n(s.colors.dress.l+5)}%,0.18)`); }
    const bdr = $('bodyDress');
    if (bdr) bdr.setAttribute('d', bd);

    // Neck
    const np = $('neckPath');
    if (np) { np.setAttribute('d', neckD(p)); np.setAttribute('fill', skinC); }

    // Head
    const hs = $('headShape');
    if (hs) { hs.setAttribute('cx', n(p.head.x)); hs.setAttribute('cy', n(p.head.y)); hs.setAttribute('rx', '14'); hs.setAttribute('ry', '17'); }

    // Hair back
    const hb = $('hairBack');
    if (hb) { hb.setAttribute('d', hairBackD(p)); hb.setAttribute('fill', hairC); }

    // Legs
    const ll = $('legL'), lr = $('legR');
    if (ll) { ll.setAttribute('d', legD(p.kL, p.fL, hemY)); ll.setAttribute('fill', skinC); }
    if (lr) { lr.setAttribute('d', legD(p.kR, p.fR, hemY)); lr.setAttribute('fill', skinC); }

    // Shoes
    const sl = $('shoeL'), sr = $('shoeR');
    if (sl) { sl.setAttribute('transform', `translate(${n(p.fL.x)},${n(p.fL.y)})`); sl.querySelectorAll('path').forEach(e => e.setAttribute('fill', shoeC)); }
    if (sr) { sr.setAttribute('transform', `translate(${n(p.fR.x)},${n(p.fR.y)})`); sr.querySelectorAll('path').forEach(e => e.setAttribute('fill', shoeC)); }

    // Arms (thin strokes)
    const armLEl = $('armL');
    if (armLEl) { armLEl.setAttribute('d', armD(p.sL, p.eL, p.wL)); armLEl.setAttribute('stroke', `hsla(${n(s.colors.skin.h)},${n(s.colors.skin.s)}%,${n(s.colors.skin.l-5)}%,${n(s.colors.skin.a * 0.6)})`); }
    const armREl = $('armR');
    if (armREl) { armREl.setAttribute('d', armD(p.sR, p.eR, p.wR)); armREl.setAttribute('stroke', `hsla(${n(s.colors.skin.h)},${n(s.colors.skin.s)}%,${n(s.colors.skin.l-5)}%,${n(s.colors.skin.a * 0.6)})`); }

    // Dress details
    const sY = (p.sL.y + p.sR.y) / 2;
    const nv = $('necklineV');
    if (nv) { nv.setAttribute('d', `M ${n(p.sL.x+8)},${n(sY+2)} L ${n(p.head.x)},${n(sY+14)} L ${n(p.sR.x-8)},${n(sY+2)}`); nv.setAttribute('stroke', `hsla(${n(s.colors.dress.h)},${n(s.colors.dress.s+10)}%,${n(s.colors.dress.l+15)}%,1)`); }
    const wd = $('waistDetail');
    if (wd) { wd.setAttribute('d', `M ${n(p.torso.x-9)},${n(p.torso.y+1)} Q ${n(p.torso.x)},${n(p.torso.y+3)} ${n(p.torso.x+9)},${n(p.torso.y+1)}`); wd.setAttribute('stroke', `hsla(${n(s.colors.dress.h)},${n(s.colors.dress.s+10)}%,${n(s.colors.dress.l+15)}%,1)`); }

    const mx = (p.hL.x + p.hR.x) / 2;
    const ft = p.hL.y + 8, fb = hemY - 6;
    const fl = Math.sin(s.breath * 0.5) * 2;
    const fc = `hsla(${n(s.colors.dress.h)},${n(s.colors.dress.s)}%,${n(s.colors.dress.l+10)}%,1)`;
    const f1 = $('fold1');
    if (f1) { f1.setAttribute('d', `M ${n(mx-6)},${n(ft)} Q ${n(mx-9)},${n((ft+fb)/2)} ${n(mx-10+fl*0.3)},${n(fb)}`); f1.setAttribute('stroke', fc); }
    const f2 = $('fold2');
    if (f2) { f2.setAttribute('d', `M ${n(mx+5)},${n(ft)} Q ${n(mx+8)},${n((ft+fb)/2)} ${n(mx+9-fl*0.3)},${n(fb)}`); f2.setAttribute('stroke', fc); }

    // Face & glasses positions
    const faceG = $('faceGroup');
    if (faceG) faceG.setAttribute('transform', `translate(${n(p.head.x)}, ${n(p.head.y)})`);
    const glassG = $('glassesGroup');
    if (glassG) {
      glassG.setAttribute('transform', `translate(${n(p.head.x)}, ${n(p.head.y)})`);
      const gst = `hsla(${n(s.colors.dress.h)},${n(s.colors.dress.s)}%,${n(s.colors.dress.l-20)}%,0.3)`;
      glassG.querySelectorAll('path').forEach((el, i) => { if (i < 2) { el.setAttribute('fill', `hsla(${n(s.colors.dress.h)},${n(s.colors.dress.s+10)}%,${n(s.colors.dress.l-5)}%,0.06)`); el.setAttribute('stroke', gst); } else el.setAttribute('stroke', gst); });
      glassG.querySelectorAll('line').forEach(el => el.setAttribute('stroke', gst));
    }

    // Hair cap
    const hc = $('hairCap');
    if (hc) { hc.setAttribute('cx', n(p.head.x)); hc.setAttribute('cy', n(p.head.y-4)); hc.setAttribute('rx', '15'); hc.setAttribute('ry', '19'); hc.setAttribute('fill', hairC); }

    // Hair strands
    const headDir = (p.head.x - 200) * 0.12;
    STRAND_CONFIGS.forEach((sc, i) => {
      const el = strandElsRef.current[i];
      if (!el) return;
      const angle = Math.PI * sc.startAngle;
      const sx = p.head.x + Math.cos(angle) * 18;
      const sy = p.head.y + Math.sin(angle) * 18;
      const sway = Math.sin(s.breath * 0.35 + sc.offset) * 3;
      const sway2 = Math.sin(s.breath * 0.25 + sc.offset + 1) * 4;
      el.setAttribute('d', `M ${n(sx)},${n(sy)} C ${n(sx+sc.side*8+headDir+sway)},${n(sy+sc.len*0.35)} ${n(sx+sc.side*4+headDir+sway2)},${n(sy+sc.len*0.65)} ${n(sx+sc.side*6+headDir+sway+sway2*0.5)},${n(sy+sc.len)}`);
      el.setAttribute('stroke', hairC);
      el.setAttribute('opacity', sc.alphaBase);
    });

    // Scarf
    const sc = scarfPathsD(p, s.breath);
    const sw = $('scarfWrap'), st1 = $('scarfTail1'), st2 = $('scarfTail2');
    if (sw) { sw.setAttribute('d', sc.wrap); sw.setAttribute('fill', scarfC); }
    if (st1) { st1.setAttribute('d', sc.tail1); st1.setAttribute('fill', scarfC); }
    if (st2) { st2.setAttribute('d', sc.tail2); st2.setAttribute('fill', scarfC); }

    // Particles
    const pHue = s.colors.glow.h;
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
      pt.el.setAttribute('cx', n(pt.x));
      pt.el.setAttribute('cy', n(pt.y));
      pt.el.setAttribute('opacity', n(pt.alpha * flicker));
      pt.el.setAttribute('fill', `hsl(${n(pHue + (pt.phase*20)%40 - 20)}, 40%, 75%)`);
    });

    // Burst particles
    s.burstParticles = s.burstParticles.filter(bp => {
      bp.life -= 0.015;
      if (bp.life <= 0) { bp.el?.parentNode?.removeChild(bp.el); return false; }
      bp.x += bp.vx; bp.y += bp.vy; bp.vy += 0.02; bp.vx *= 0.99;
      bp.el.setAttribute('cx', n(bp.x));
      bp.el.setAttribute('cy', n(bp.y));
      bp.el.setAttribute('r', n(bp.size * bp.life));
      bp.el.setAttribute('opacity', n(bp.life * 0.6));
      return true;
    });

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animate]);

  return (
    <svg ref={svgRef} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: '420px', height: 'auto', aspectRatio: '400/400' }}>
      <defs>
        <filter id="wcFilter" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="3" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <filter id="washBlur" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="4"/>
        </filter>
        <filter id="glowBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18"/>
        </filter>
        <linearGradient id="dressGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop id="gradTop" offset="0%"/><stop id="gradMid" offset="45%"/><stop id="gradBot" offset="100%"/>
        </linearGradient>
        <linearGradient id="skinGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop id="skinTop" offset="0%"/><stop id="skinBot" offset="100%"/>
        </linearGradient>
      </defs>

      <g id="bgLayer"/><g id="aestheticLayer"/><g id="lightingLayer"/>
      <ellipse id="groundShadow" cx="200" cy="370" rx="50" ry="5" fill="rgba(0,0,0,0.08)"/>
      <ellipse id="figGlow" cx="200" cy="200" rx="70" ry="130" fill="transparent" filter="url(#glowBlur)"/>
      <path id="bodyWash" fill="transparent" filter="url(#washBlur)" opacity="0.18"/>

      <g id="figureLayer" filter="url(#wcFilter)">
        <path id="hairBack" fill="transparent"/>
        <path id="bodyDress" fill="url(#dressGrad)"/>
        <path id="neckPath" fill="transparent"/>
        <ellipse id="headShape" fill="url(#skinGrad)"/>
        <path id="legL" fill="transparent"/><path id="legR" fill="transparent"/>
        <g id="shoeL"><path d="M 3,-3 Q -6,-5 -14,-1 Q -9,2 2,1 Z"/><path d="M 1,0 L 4,11 6,12 2,12 0,1 Z"/></g>
        <g id="shoeR"><path d="M -3,-3 Q 6,-5 14,-1 Q 9,2 -2,1 Z"/><path d="M -1,0 L -4,11 -6,12 -2,12 0,1 Z"/></g>
        <path id="armL" fill="none" stroke="transparent" strokeWidth="2.5" strokeLinecap="round"/>
        <path id="armR" fill="none" stroke="transparent" strokeWidth="2.5" strokeLinecap="round"/>
        <path id="waistDetail" fill="none" stroke="transparent" strokeWidth="1.5" strokeLinecap="round" opacity="0.2"/>
        <path id="necklineV" fill="none" stroke="transparent" strokeWidth="1" strokeLinecap="round" opacity="0.15"/>
        <path id="fold1" fill="none" stroke="transparent" strokeWidth="0.7" opacity="0.08"/>
        <path id="fold2" fill="none" stroke="transparent" strokeWidth="0.7" opacity="0.08"/>
        <g id="faceGroup">
          <path d="M -7,-1.5 Q -5,-4.5 -2.5,-1.5 Q -5,0.5 -7,-1.5 Z" fill="rgba(40,30,30,0.55)"/>
          <path d="M 2.5,-1.5 Q 5,-4.5 7,-1.5 Q 5,0.5 2.5,-1.5 Z" fill="rgba(40,30,30,0.55)"/>
          <path d="M -8,-1.5 Q -5,-5 -2,-1.8" fill="none" stroke="rgba(30,20,20,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M 2,-1.8 Q 5,-5 8,-1.5" fill="none" stroke="rgba(30,20,20,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M -8.5,-1.8 L -9.8,-3.2" fill="none" stroke="rgba(30,20,20,0.3)" strokeWidth="0.7" strokeLinecap="round"/>
          <path d="M 8.5,-1.8 L 9.8,-3.2" fill="none" stroke="rgba(30,20,20,0.3)" strokeWidth="0.7" strokeLinecap="round"/>
          <path d="M -8,-5 Q -5,-8 -2,-5.5" fill="none" stroke="rgba(50,35,25,0.35)" strokeWidth="0.9" strokeLinecap="round"/>
          <path d="M 2,-5.5 Q 5,-8 8,-5" fill="none" stroke="rgba(50,35,25,0.35)" strokeWidth="0.9" strokeLinecap="round"/>
          <path d="M 0,0 C -0.3,2 -1.2,4 -0.8,5 Q 0,5.8 0.8,5 C 1.2,4 0.3,2 0,0" fill="none" stroke="rgba(60,40,30,0.15)" strokeWidth="0.6" strokeLinecap="round"/>
          <path d="M -3,6.5 Q -1.5,5.5 0,6 Q 1.5,5.5 3,6.5" fill="rgba(180,80,80,0.3)" stroke="rgba(160,60,60,0.25)" strokeWidth="0.5"/>
          <path d="M -3,6.5 Q -1,9 0,9.5 Q 1,9 3,6.5" fill="rgba(180,80,80,0.22)" stroke="rgba(160,60,60,0.15)" strokeWidth="0.4"/>
          <circle cx="-8" cy="3" r="3.5" fill="rgba(220,120,120,0.06)"/>
          <circle cx="8" cy="3" r="3.5" fill="rgba(220,120,120,0.06)"/>
        </g>
        <g id="glassesGroup">
          <path d="M -2,-3 C -3,-6 -9,-7 -12,-4.5 C -13.5,-2.5 -12.5,2 -10,3 C -7,4 -3,1 -2,-1 Z" fill="rgba(0,0,0,0.06)" stroke="rgba(0,0,0,0.28)" strokeWidth="1.2"/>
          <path d="M 2,-3 C 3,-6 9,-7 12,-4.5 C 13.5,-2.5 12.5,2 10,3 C 7,4 3,1 2,-1 Z" fill="rgba(0,0,0,0.06)" stroke="rgba(0,0,0,0.28)" strokeWidth="1.2"/>
          <path d="M -2,-2.5 Q 0,-4 2,-2.5" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1"/>
          <line x1="-12.5" y1="-4" x2="-14.5" y2="-2.5" stroke="rgba(0,0,0,0.22)" strokeWidth="0.9"/>
          <line x1="12.5" y1="-4" x2="14.5" y2="-2.5" stroke="rgba(0,0,0,0.22)" strokeWidth="0.9"/>
        </g>
        <ellipse id="hairCap" fill="transparent"/>
        <g id="hairStrands"/>
        <path id="scarfWrap" fill="transparent"/>
        <path id="scarfTail1" fill="transparent"/>
        <path id="scarfTail2" fill="transparent" opacity="0.5"/>
      </g>

      <g id="particleLayer"/><g id="burstLayer"/>
    </svg>
  );
};


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
              {/* ─── Left: SVG Figure ─── */}
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

                <PoseFigureSVG
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
