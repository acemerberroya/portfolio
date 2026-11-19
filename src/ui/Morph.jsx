import { useEffect, useRef } from 'react';
import { MORPH } from '../morph.js';
import { hubScreen } from '../scene/bridge.js';
import { getState, subscribe } from '../store.js';
import { makeLineBatch, makeRectBatch, mixQ, q, qa, rgba } from './canvasBatch.js';

// The particle half of the hologram transformation (portfolio globe ⇄
// Euthenics core). First the information panel breaks into data particles
// that are sucked into the accelerating sphere. Then, while the 3D hub is
// hidden, this overlay takes its place:
//   the hologram, drawn as particles at the hub's exact spot and size,
//   compresses → explodes with a flash → its particles scatter and hang for a
//   second → they change colour (cyan ⇄ gold) → they gather and build the new
//   hologram → as the real 3D hologram appears, the particles fade out.
// 2D canvas, drawn only while a transformation runs.

const COLORS = {
  main: { base: [95, 216, 255], hot: [230, 251, 255], line: [110, 220, 255] },
  euthenics: { base: [255, 182, 72], hot: [255, 241, 208], line: [255, 196, 110] },
};
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const span = (t, [a, b]) => Math.min(1, Math.max(0, (t - a) / (b - a)));

// Unit-sphere structure shared by both holograms: grid, shell trails, rings.
function buildStructure() {
  const D = Math.PI / 180;
  const ll = (lat, lng) => [Math.cos(lat * D) * Math.cos(lng * D), Math.sin(lat * D), Math.cos(lat * D) * Math.sin(lng * D)];
  const lines = [];
  for (let lng = 0; lng < 180; lng += 30) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 8) pts.push(ll(lat, lng));
    for (let lat = 90; lat >= -90; lat -= 8) pts.push(ll(lat, lng + 180));
    lines.push({ pts, a: 0.16 });
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = [];
    for (let lng = 0; lng <= 360; lng += 8) pts.push(ll(lat, lng));
    lines.push({ pts, a: 0.16 });
  }
  for (let i = 0; i < 14; i++) {
    const t0 = Math.random() * 6.28;
    const tilt = Math.random() * Math.PI;
    const yaw = Math.random() * Math.PI * 2;
    const len = 0.6 + Math.random() * 1.5;
    const pts = [];
    for (let k = 0; k <= 20; k++) {
      const t = t0 + (len * k) / 20;
      let x = Math.cos(t);
      let y = Math.sin(t) * Math.cos(tilt);
      let z = Math.sin(t) * Math.sin(tilt);
      [x, z] = [x * Math.cos(yaw) - z * Math.sin(yaw), x * Math.sin(yaw) + z * Math.cos(yaw)];
      pts.push([x * 1.03, y * 1.03, z * 1.03]);
    }
    lines.push({ pts, a: 0.5, trail: true, seed: Math.random() });
  }
  const ring = (radius, rx, ry) => {
    const pts = [];
    for (let k = 0; k <= 80; k++) {
      const t = (k / 80) * Math.PI * 2;
      let x = Math.cos(t) * radius;
      let y = Math.sin(t) * radius;
      let z = 0;
      [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
      [x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
      pts.push([x, y, z]);
    }
    return { pts, a: 0.4, fixed: true };
  };
  lines.push(ring(1.18, Math.PI / 2.2, 0.3), ring(1.3, Math.PI / 1.75, -0.4));
  return lines;
}

// The panel as particles: points along every line of its text, plus its frame.
function samplePanel(budget) {
  const panel = document.querySelector('.panel');
  if (!panel) return [];
  const box = panel.getBoundingClientRect();
  const rects = [];
  const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent.trim()) continue;
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      // Only what is actually visible inside the panel.
      const top = Math.max(r.top, box.top);
      const bottom = Math.min(r.bottom, box.bottom, window.innerHeight);
      if (bottom - top < 2 || r.width < 2) continue;
      rects.push({ x: r.left, y: top + (bottom - top) * 0.2, w: r.width, h: (bottom - top) * 0.6 });
    }
  }
  const area = rects.reduce((sum, r) => sum + r.w * r.h, 0) || 1;
  const pts = [];
  const textBudget = budget * 0.8;
  rects.forEach((r) => {
    const n = Math.max(1, Math.round((r.w * r.h / area) * textBudget));
    for (let i = 0; i < n; i++) pts.push([r.x + Math.random() * r.w, r.y + Math.random() * r.h, 1]);
  });
  // The panel's frame.
  const per = 2 * (box.width + box.height);
  const frameN = Math.round(budget * 0.2);
  for (let i = 0; i < frameN; i++) {
    let d = Math.random() * per;
    let x;
    let y;
    if (d < box.width) { x = box.left + d; y = box.top; }
    else if ((d -= box.width) < box.height) { x = box.right; y = box.top + d; }
    else if ((d -= box.height) < box.width) { x = box.right - d; y = box.bottom; }
    else { d -= box.width; x = box.left; y = box.bottom - d; }
    pts.push([x, Math.min(y, window.innerHeight), 0]);
  }
  return pts.map(([x, y, text]) => ({ x, y, text, delay: Math.random() * 0.3, seed: Math.random(), swirl: 1.5 + Math.random() * 1.5 }));
}

export default function Morph({ lite }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas.getContext('2d');
    let raf = null;
    let parts = null;
    let lines = null;
    let panelParts = [];
    const rects = makeRectBatch();
    const segs = makeLineBatch();

    const pitch = 0.18;
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);

    const setup = () => {
      // Additive particles don't need full retina resolution; this keeps fill cost low.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = lite ? 900 : 1600;
      const golden = Math.PI * (3 - Math.sqrt(5));
      parts = Array.from({ length: n }, (_, i) => {
        const yy = 1 - (i / (n - 1)) * 2;
        const rr = Math.sqrt(1 - yy * yy);
        const th = golden * i;
        return {
          ux: Math.cos(th) * rr, uy: yy, uz: Math.sin(th) * rr,
          seed: Math.random(), speed: 0.08 + Math.random() * 0.14,
          ex: 0, ey: 0, set: false,
        };
      });
      lines = buildStructure();
    };

    const frame = (now) => {
      const m = getState().morph;
      const W = window.innerWidth;
      const H = window.innerHeight;
      g.clearRect(0, 0, W, H);
      if (!m) { raf = null; return; }

      const sec = now / 1000;
      const hub = hubScreen.ready ? hubScreen : { x: W / 2, y: H / 2, r: Math.min(W, H) * 0.3 };
      const from = COLORS[m.from] || COLORS.main;
      const to = COLORS[m.to] || COLORS.euthenics;

      // The panel's particles, sucked into the sphere as it accelerates
      // (pulled harder and harder, swirling, shrinking as they are absorbed).
      if (panelParts.length) {
        g.globalCompositeOperation = 'lighter';
        const a = Math.min(1, (now - m.start) / MORPH.accel);
        for (let i = 0; i < panelParts.length; i++) {
          const p = panelParts[i];
          const local = Math.min(1, Math.max(0, (a - p.delay) / (1 - p.delay)));
          if (local >= 1) continue;
          const e = local * local * local; // accelerating pull
          const ox = p.x - hub.x;
          const oy = p.y - hub.y;
          const sw = e * p.swirl;
          const rx = ox * Math.cos(sw) - oy * Math.sin(sw);
          const ry = ox * Math.sin(sw) + oy * Math.cos(sw);
          const x = hub.x + rx * (1 - e);
          const y = hub.y + ry * (1 - e);
          const flick = local < 0.08 ? 0.6 + 0.4 * Math.random() : 1;
          const hot = Math.max(1 - local * 4, e);
          const c = mixQ(from.base, from.hot, q(hot));
          const size = (p.text ? 1.6 : 1.3) * (1 - 0.6 * e) + 0.5;
          const aq = qa(0.85 * flick * (1 - e * 0.5));
          rects.add(`${c}|${aq}`, rgba(c, aq), x - size / 2, y - size / 2, size, size);
        }
        rects.flush(g);
        if (a >= 1 && m.phase !== 'accel') panelParts = [];
      }
      if (m.phase === 'accel' || !m.burstStart) { raf = requestAnimationFrame(frame); return; }

      const t = now - m.burstStart; // ms into the burst

      const kc = ease(span(t, MORPH.compress));
      const kx = span(t, MORPH.explode);
      const kd = span(t, MORPH.scatter);
      const kcol = ease(span(t, MORPH.recolor));
      const kg = ease(span(t, MORPH.gather));
      const kr = m.phase === 'reveal' && m.revealStart ? Math.min(1, (now - m.revealStart) / MORPH.reveal) : 0;
      const fade = 1 - ease(kr);

      const spin = sec * (2.5 - 2 * kg); // still spinning fast from the acceleration, settling as it rebuilds
      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      const project = (p, fixed, r) => {
        let x = p[0];
        let z = p[2];
        if (!fixed) { const x2 = x * cs - z * sn; z = x * sn + z * cs; x = x2; }
        const y = p[1] * cp - z * sp;
        return [hub.x + x * r, hub.y - y * r, p[1] * sp + z * cp];
      };

      g.globalCompositeOperation = 'lighter';

      // The hologram's structure: halo, rim, grid, trails, rings and core.
      const drawStructure = (r, s, col, boost = 0) => {
        if (s <= 0.01) return;
        const [cr, cg, cb] = col.base;
        const halo = g.createRadialGradient(hub.x, hub.y, r * 0.7, hub.x, hub.y, r * 1.35);
        halo.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
        halo.addColorStop(0.55, `rgba(${cr},${cg},${cb},${0.16 * s})`);
        halo.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        g.fillStyle = halo;
        g.fillRect(hub.x - r * 1.4, hub.y - r * 1.4, r * 2.8, r * 2.8);
        const rim = g.createRadialGradient(hub.x, hub.y, r * 0.55, hub.x, hub.y, r * 1.02);
        rim.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
        rim.addColorStop(0.85, `rgba(${cr},${cg},${cb},${0.16 * s})`);
        rim.addColorStop(1, `rgba(${col.hot.join(',')},${0.5 * s})`);
        g.fillStyle = rim;
        g.beginPath(); g.arc(hub.x, hub.y, r * 1.02, 0, Math.PI * 2); g.fill();
        g.lineWidth = 1;
        const [lr, lg, lb] = col.line;
        lines.forEach((ln) => {
          let prev = null;
          for (let k = 0; k < ln.pts.length; k++) {
            const pt = project(ln.pts[k], ln.fixed, r);
            if (prev) {
              const front = 0.25 + 0.75 * (((prev[2] + pt[2]) / 2 + 1) / 2);
              let a = ln.a * front * s;
              if (ln.trail) {
                const f = (((k / ln.pts.length) * 2 - sec * 0.6 + ln.seed * 3) % 1 + 1) % 1;
                a *= 0.35 + 1.4 * Math.pow(f, 6);
              }
              const aq = qa(a);
              if (aq > 0) segs.add(`${lr},${lg},${lb}|${aq}`, rgba(col.line, aq), prev[0], prev[1], pt[0], pt[1]);
            }
            prev = pt;
          }
        });
        segs.flush(g, 1);
        const core = g.createRadialGradient(hub.x, hub.y, 0, hub.x, hub.y, r * 0.5);
        core.addColorStop(0, `rgba(${col.hot.join(',')},${Math.min(1, (0.85 + boost) * s)})`);
        core.addColorStop(0.15, `rgba(${cr},${cg},${cb},${Math.min(1, (0.4 + boost) * s)})`);
        core.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        g.fillStyle = core;
        g.fillRect(hub.x - r, hub.y - r, r * 2, r * 2);
      };

      // 1. The old hologram, compressing to a hot point before it bursts.
      const rOld = hub.r * (1 - 0.85 * kc);
      drawStructure(rOld, (1 - kx) * fade, from, kc * 0.8);
      // 2. The new hologram's structure building as its data gathers.
      drawStructure(hub.r, kg * 0.85 * fade, to);

      // 3. The particles.
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        // Their path in the data surge (the same motion as inside the 3D hubs).
        const tt = (p.seed + sec * p.speed * (3 - 2 * kg)) % 1;
        const rn = 0.08 + 0.92 * Math.pow(tt, 0.7);
        const ang = rn * 1.6 + sec * 0.35 + p.seed * 6.2831;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const d = [(p.ux * ca - p.uz * sa) * rn, p.uy * rn, (p.ux * sa + p.uz * ca) * rn];
        const wave = Math.pow(0.5 + 0.5 * Math.sin(rn * 7 - sec * 3.2 + p.seed * 2), 6);
        const [ox, oy, oz] = project(d, true, rOld);
        if (kx > 0 && !p.set) {
          // Explosion direction: outward from the hub, with some spread.
          const dx = ox - hub.x;
          const dy = oy - hub.y;
          const mlen = Math.hypot(dx, dy) || 1;
          const j = (Math.random() - 0.5) * 1.1;
          const dist = (0.35 + 0.85 * Math.random()) * Math.max(W, H) * 0.5;
          p.ex = ((dx / mlen) * Math.cos(j) - (dy / mlen) * Math.sin(j)) * dist;
          p.ey = ((dx / mlen) * Math.sin(j) + (dy / mlen) * Math.cos(j)) * dist;
          p.sx = ox;
          p.sy = oy;
          p.set = true;
        }
        let x = ox;
        let y = oy;
        let depth = 0.35 + 0.65 * ((oz + 1) / 2);
        if (p.set) {
          const out = 1 - Math.pow(1 - kx, 3) + 0.1 * kd; // burst, then drift a little
          const sx = p.sx + p.ex * out;
          const sy = p.sy + p.ey * out;
          const [tx, ty, tz] = project(d, true, hub.r);
          // Gather along a curve, so the rebuild swirls in.
          const sw = (1 - kg) * kg * 1.5;
          const gx = sx - hub.x;
          const gy = sy - hub.y;
          const qx = hub.x + gx * Math.cos(sw) - gy * Math.sin(sw);
          const qy = hub.y + gx * Math.sin(sw) + gy * Math.cos(sw);
          x = qx + (tx - qx) * kg;
          y = qy + (ty - qy) * kg;
          depth = 0.35 + 0.65 * ((tz + 1) / 2);
        }
        const burst = kx * (1 - kg);
        const hot = Math.max(burst * 0.6, wave * 0.8, kc * (1 - kx) * 0.6);
        const kq = q(kcol);
        const c = mixQ(mixQ(from.base, to.base, kq), mixQ(from.hot, to.hot, kq), q(hot));
        const a = (0.45 + 0.4 * burst + 0.3 * wave) * (p.set ? 0.6 + 0.4 * depth * (kg > 0 ? 1 : 0.6) : depth) * fade;
        const size = 1.1 + 1.6 * burst + 1.3 * wave;
        const aq = qa(a);
        if (aq > 0) rects.add(`${c}|${aq}`, rgba(c, aq), x - size / 2, y - size / 2, size, size);
      }
      rects.flush(g);

      // 4. The explosion's flash.
      if (kx > 0 && kx < 1) {
        const fl = Math.sin(kx * Math.PI);
        const fr = hub.r * (0.3 + 2.4 * kx);
        const flash = g.createRadialGradient(hub.x, hub.y, 0, hub.x, hub.y, fr);
        flash.addColorStop(0, `rgba(${from.hot.join(',')},${0.9 * fl})`);
        flash.addColorStop(0.3, `rgba(${from.base.join(',')},${0.4 * fl})`);
        flash.addColorStop(1, `rgba(${from.base.join(',')},0)`);
        g.fillStyle = flash;
        g.fillRect(hub.x - fr, hub.y - fr, fr * 2, fr * 2);
      }

      if (kr >= 1) { g.clearRect(0, 0, W, H); raf = null; return; }
      raf = requestAnimationFrame(frame);
    };

    // Start drawing as soon as a transformation begins: the panel is sampled
    // into particles right away, before it fades.
    const unsub = subscribe(() => {
      const m = getState().morph;
      if (m && raf == null && (m.phase === 'accel' || m.phase === 'burst')) {
        setup();
        panelParts = m.phase === 'accel' ? samplePanel(lite ? 450 : 900) : [];
        raf = requestAnimationFrame(frame);
      }
    });
    const onResize = () => { if (raf != null) setup(); };
    window.addEventListener('resize', onResize);
    return () => {
      unsub();
      window.removeEventListener('resize', onResize);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [lite]);

  return <canvas ref={canvasRef} className="morph-canvas" aria-hidden="true" />;
}
