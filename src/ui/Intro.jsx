import { useEffect, useRef, useState } from 'react';
import { profile } from '../data/profile.js';
import { hubScreen } from '../scene/bridge.js';
import { setState } from '../store.js';

// Opening sequence (3D view only):
//   black → a holo screen types out my name and "Take a look inside my
//   portfolio" → the letters break into data
//   particles that spiral into a ball → the ball surges like the globe's data
//   → it flies onto the globe and the room fades in underneath.
// Drawn on a 2D canvas so it costs nothing on the GPU the 3D room is loading
// on. Skip with the button, Esc, Enter, Space or a click.

const T = {
  black: 450, // pure black before anything appears
  typeChar: 85, // per letter of the name
  lineGap: 300, // pause before the second line
  typeChar2: 42, // per letter of the second line (types faster)
  hold: 800, // both lines typed, caret blinking
  compress: 2400, // the text surges apart into data → miniature hologram
  surge: 1200, // the miniature hologram runs (longer if the room isn't ready yet)
  land: 1100, // ball flies onto the globe, overlay fades
};
const CYAN = [95, 216, 255];
const HOT = [230, 251, 255];

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// Sample the typed name into particle start points, matching where the DOM text sits.
function sampleText(el, maxPoints) {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const c = document.createElement('canvas');
  c.width = Math.ceil(r.width);
  c.height = Math.ceil(r.height);
  const g = c.getContext('2d');
  g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#fff';
  g.fillText(el.dataset.text, c.width / 2, c.height / 2);
  const data = g.getImageData(0, 0, c.width, c.height).data;
  const pts = [];
  let filled = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 128) filled++;
  const step = Math.max(1, Math.round(Math.sqrt(filled / maxPoints)));
  for (let y = 0; y < c.height; y += step) {
    for (let x = 0; x < c.width; x += step) {
      if (data[(y * c.width + x) * 4 + 3] > 128) pts.push([r.left + x, r.top + y, step]);
    }
  }
  return pts;
}

const LINE2 = 'Take a look inside my portfolio';

export default function Intro({ sceneReady, onDone }) {
  const [phase, setPhase] = useState('black'); // black → type → particles → done
  const [typed, setTyped] = useState(0);
  const [typed2, setTyped2] = useState(0);
  const textRef = useRef(null);
  const text2Ref = useRef(null);
  const samples = useRef(null); // letter pixels, measured while the text is still in place
  const canvasRef = useRef(null);
  const rootRef = useRef(null);
  const ready = useRef(sceneReady);
  ready.current = sceneReady;
  const finished = useRef(false);
  const name = profile.name;

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setState({ intro: false });
    onDone();
  };

  useEffect(() => { setState({ intro: true }); }, []);

  // Skip from the keyboard or a click anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if (['Escape', 'Enter', ' '].includes(e.key)) { e.preventDefault(); finish(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Black, then type the name, then the second line, one letter at a time.
  useEffect(() => {
    const timers = [setTimeout(() => setPhase('type'), T.black)];
    const nameEnd = T.black + 300 + name.length * T.typeChar;
    for (let i = 1; i <= name.length; i++) {
      timers.push(setTimeout(() => setTyped(i), T.black + 300 + i * T.typeChar));
    }
    const line2Start = nameEnd + T.lineGap;
    for (let i = 1; i <= LINE2.length; i++) {
      timers.push(setTimeout(() => setTyped2(i), line2Start + i * T.typeChar2));
    }
    timers.push(setTimeout(() => {
      // Measure the letters before the screen starts collapsing around them.
      const budget = window.innerWidth < 700 ? 1800 : 3400;
      samples.current = [
        ...sampleText(textRef.current, budget * 0.7),
        ...sampleText(text2Ref.current, budget * 0.3),
      ];
      setPhase('particles');
    }, line2Start + LINE2.length * T.typeChar2 + T.hold));
    return () => timers.forEach(clearTimeout);
  }, [name.length]);

  // Particles: the text surges apart into data, the data gathers into a
  // miniature of the globe hologram, then it lands on the real globe.
  useEffect(() => {
    if (phase !== 'particles') return undefined;
    const canvas = canvasRef.current;
    const g = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    g.scale(dpr, dpr);

    const starts = samples.current || [];
    const n = starts.length;
    const cx = W / 2;
    const cy = H / 2;
    const R0 = Math.min(W, H) * 0.13;
    const golden = Math.PI * (3 - Math.sqrt(5));
    let minX = Infinity;
    let maxX = -Infinity;
    starts.forEach(([x]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); });
    const SWEEP = 0.5; // share of the compress phase the scan line takes to cross the text
    const FLY = 0.5; // share each piece spends streaming into the ball

    const parts = starts.map(([x, y, step], i) => {
      const yy = 1 - (i / Math.max(n - 1, 1)) * 2;
      const rr = Math.sqrt(1 - yy * yy);
      const th = golden * i;
      return {
        sx: x, sy: y, px: step, lx: x, ly: y,
        ux: Math.cos(th) * rr, uy: yy, uz: Math.sin(th) * rr,
        seed: Math.random(),
        speed: 0.08 + Math.random() * 0.14,
        // The scan line releases each piece as it passes over it.
        delay: SWEEP * ((x - minX) / Math.max(maxX - minX, 1)) + Math.random() * 0.03,
        swirl: 2.4 + Math.random() * 1.6,
      };
    });

    // The miniature globe's structure, in unit-sphere coordinates.
    const D = Math.PI / 180;
    const ll = (lat, lng) => [Math.cos(lat * D) * Math.cos(lng * D), Math.sin(lat * D), Math.cos(lat * D) * Math.sin(lng * D)];
    const lines = [];
    for (let lng = 0; lng < 180; lng += 30) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 6) pts.push(ll(lat, lng));
      for (let lat = 90; lat >= -90; lat -= 6) pts.push(ll(lat, lng + 180));
      lines.push({ pts, a: 0.16 });
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = [];
      for (let lng = 0; lng <= 360; lng += 6) pts.push(ll(lat, lng));
      lines.push({ pts, a: 0.16 });
    }
    // Data trails hugging the shell (partial great circles).
    for (let i = 0; i < 16; i++) {
      const ax = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5];
      const m = Math.hypot(...ax);
      const a = ax.map((v) => v / m);
      const u = Math.abs(a[0]) > 0.9 ? [0, 1, 0] : [1, 0, 0];
      const b1 = [u[1] * a[2] - u[2] * a[1], u[2] * a[0] - u[0] * a[2], u[0] * a[1] - u[1] * a[0]];
      const bm = Math.hypot(...b1);
      const e1 = b1.map((v) => v / bm);
      const e2 = [a[1] * e1[2] - a[2] * e1[1], a[2] * e1[0] - a[0] * e1[2], a[0] * e1[1] - a[1] * e1[0]];
      const s0 = Math.random() * 6.28;
      const len = 0.5 + Math.random() * 1.6;
      const rr = 1.0 + Math.random() * 0.08;
      const pts = [];
      for (let k = 0; k <= 24; k++) {
        const t = s0 + (len * k) / 24;
        pts.push([0, 1, 2].map((j) => (e1[j] * Math.cos(t) + e2[j] * Math.sin(t)) * rr));
      }
      lines.push({ pts, a: 0.5, trail: true, seed: Math.random() });
    }
    // The two tilted orbit rings, as on the globe.
    const ring = (radius, rx, ry) => {
      const pts = [];
      for (let k = 0; k <= 96; k++) {
        const t = (k / 96) * Math.PI * 2;
        let x = Math.cos(t) * radius;
        let y = Math.sin(t) * radius;
        let z = 0;
        // rotate about X then Y
        [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
        [x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
        pts.push([x, y, z]);
      }
      return pts;
    };
    const rings = [
      { pts: ring(1.18, Math.PI / 2.2, 0.3), a: 0.45, fixed: true },
      { pts: ring(1.3, Math.PI / 1.75, -0.4), a: 0.25, fixed: true },
    ];

    let raf;
    const t0 = performance.now();
    let landStart = null;
    const from = { x: cx, y: cy, r: R0 };
    const pitch = 0.18;
    const cp = Math.cos(pitch);
    const spP = Math.sin(pitch);

    const frame = (now) => {
      const t = now - t0;
      const sec = t / 1000;
      let center = { x: cx, y: cy };
      let radius = R0;
      let alpha = 1;
      const mix = Math.min(1, t / T.compress); // 0 = text, 1 = everything in the ball

      if (mix >= 1) {
        const surgeEnd = T.compress + T.surge;
        // Hold the surge until the room is ready to receive the ball.
        if (landStart == null && t >= surgeEnd && ready.current && hubScreen.ready) landStart = t;
        if (landStart == null && t > surgeEnd + 6000) landStart = t; // never wait forever
        if (landStart != null) {
          const k = ease(Math.min(1, (t - landStart) / T.land));
          const to = hubScreen.ready ? hubScreen : { x: cx, y: cy, r: R0 * 3 };
          center = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
          radius = from.r + (to.r - from.r) * k;
          alpha = 1 - Math.max(0, (k - 0.35) / 0.65);
          if (rootRef.current) rootRef.current.style.setProperty('--veil', String(1 - k));
          if (k >= 1) { finish(); return; }
        }
      }

      // Motion trails while the data streams; clean frames while landing.
      g.globalCompositeOperation = 'source-over';
      if (landStart == null) {
        g.fillStyle = 'rgba(0, 0, 0, 0.3)';
        g.fillRect(0, 0, W, H);
      } else {
        g.clearRect(0, 0, W, H);
      }
      g.globalCompositeOperation = 'lighter';

      // Project a unit-sphere point onto the screen (spin, then the globe's tilt).
      const spin = sec * 0.5;
      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      const project = (p, fixed) => {
        let x = p[0];
        let z = p[2];
        if (!fixed) { const x2 = x * cs - z * sn; z = x * sn + z * cs; x = x2; }
        const y = p[1] * cp - z * spP;
        const z2 = p[1] * spP + z * cp;
        return [center.x + x * radius, center.y - y * radius, z2];
      };

      // 1. The miniature hologram's structure fades in as the data arrives.
      const build = Math.min(1, Math.max(0, (mix - 0.55) / 0.45));
      if (build > 0) {
        const s = build * alpha;
        // Halo and fresnel rim
        const halo = g.createRadialGradient(center.x, center.y, radius * 0.7, center.x, center.y, radius * 1.35);
        halo.addColorStop(0, 'rgba(42,169,224,0)');
        halo.addColorStop(0.55, `rgba(42,169,224,${0.22 * s})`);
        halo.addColorStop(1, 'rgba(42,169,224,0)');
        g.fillStyle = halo;
        g.fillRect(center.x - radius * 1.4, center.y - radius * 1.4, radius * 2.8, radius * 2.8);
        const rim = g.createRadialGradient(center.x, center.y, radius * 0.55, center.x, center.y, radius * 1.02);
        rim.addColorStop(0, 'rgba(95,216,255,0)');
        rim.addColorStop(0.85, `rgba(95,216,255,${0.18 * s})`);
        rim.addColorStop(1, `rgba(160,235,255,${0.55 * s})`);
        g.fillStyle = rim;
        g.beginPath(); g.arc(center.x, center.y, radius * 1.02, 0, Math.PI * 2); g.fill();
        // Grid, shell trails and rings
        g.lineWidth = 1;
        [...lines, ...rings].forEach((ln) => {
          let prev = null;
          for (let k = 0; k < ln.pts.length; k++) {
            const q = project(ln.pts[k], ln.fixed);
            if (prev) {
              const front = 0.25 + 0.75 * (((prev[2] + q[2]) / 2 + 1) / 2);
              let a = ln.a * front * s;
              if (ln.trail) {
                // A bright head runs along each trail, like the globe's data shell.
                const f = (k / ln.pts.length * 2 - sec * 0.6 + ln.seed * 3) % 1;
                a *= 0.35 + 1.4 * Math.pow((f + 1) % 1, 6);
              }
              g.strokeStyle = `rgba(110,220,255,${Math.min(1, a)})`;
              g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(q[0], q[1]); g.stroke();
            }
            prev = q;
          }
        });
      }

      // 2. The scan line sweeping the text, releasing it as data.
      if (mix < SWEEP + 0.05) {
        const sx = minX + (Math.min(mix, SWEEP) / SWEEP) * (maxX - minX);
        const grad = g.createLinearGradient(sx - 14, 0, sx + 14, 0);
        grad.addColorStop(0, 'rgba(95,216,255,0)');
        grad.addColorStop(0.5, 'rgba(230,251,255,0.85)');
        grad.addColorStop(1, 'rgba(95,216,255,0)');
        g.fillStyle = grad;
        g.fillRect(sx - 14, cy - H * 0.22, 28, H * 0.44);
      }

      // 3. Every piece of text: solid until the scan passes, then a streak of
      //    data spiralling in, then a particle surging inside the miniature.
      g.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const p = parts[i];
        if (mix < p.delay) {
          const near = p.delay - mix < 0.04;
          g.fillStyle = near ? 'rgba(160,240,255,1)' : 'rgba(230,251,255,0.95)';
          g.fillRect(p.sx, p.sy, p.px + 0.6, p.px + 0.6);
          continue;
        }
        // Where it surges inside the ball (same motion as the globe's data surge).
        const tt = (p.seed + sec * p.speed) % 1;
        let r = 0.08 + 0.92 * Math.pow(tt, 0.7);
        const ang = r * 1.6 + sec * 0.35 + p.seed * 6.2831;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const dir = [p.ux * ca - p.uz * sa, p.uy, p.ux * sa + p.uz * ca];
        const wave = Math.pow(0.5 + 0.5 * Math.sin(r * 7 - sec * 3.2 + p.seed * 2), 6);
        const edgeFade = Math.min(1, tt / 0.12) * Math.min(1, (1 - tt) / 0.18);
        const [bx, by, bz] = project([dir[0] * r, dir[1] * r, dir[2] * r], true);

        const lp = Math.min(1, (mix - p.delay) / FLY);
        const e = ease(lp);
        let x;
        let y;
        if (e < 1) {
          const ox = p.sx - cx;
          const oy = p.sy - cy;
          const sw = (1 - e) * p.swirl * e;
          const rx = ox * Math.cos(sw) - oy * Math.sin(sw);
          const ry = ox * Math.sin(sw) + oy * Math.cos(sw);
          x = cx + rx * (1 - e) + (bx - cx) * e;
          y = cy + ry * (1 - e) + (by - cy) * e;
          // The piece has become a data particle: a glowing dot that shrinks
          // from letter-pixel size to the size of the globe's surge points as
          // it flies in, flashing bright the moment it breaks off.
          const flash = Math.pow(1 - e, 4);
          const size = 1.4 + (p.px * 0.9 - 1.4) * (1 - e);
          const pulse = 0.75 + 0.25 * Math.sin(sec * 9 + p.seed * 20);
          const hot = Math.max(flash, 0.25 * pulse);
          g.fillStyle = `rgba(${Math.round(95 + 135 * hot)},${Math.round(216 + 35 * hot)},255,${Math.min(1, (0.55 + 0.45 * flash) * alpha)})`;
          g.fillRect(x - size / 2, y - size / 2, size, size);
        } else {
          x = bx;
          y = by;
          const depth = 0.35 + 0.65 * ((bz + 1) / 2);
          const a = alpha * depth * edgeFade * (0.3 + 0.7 * wave);
          const size = 0.9 + 1.6 * wave;
          const hot = wave * 0.85;
          g.fillStyle = `rgba(${Math.round(95 + 135 * hot)},${Math.round(216 + 35 * hot)},255,${Math.min(1, a)})`;
          g.fillRect(x - size / 2, y - size / 2, size, size);
        }
        p.lx = x;
        p.ly = y;
      }

      // 4. The energy core, as at the centre of the globe.
      if (build > 0) {
        const pulse = 1 + 0.1 * Math.sin(sec * 2.4);
        const core = g.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius * 0.55 * pulse);
        core.addColorStop(0, `rgba(240,253,255,${0.9 * alpha * build})`);
        core.addColorStop(0.12, `rgba(180,240,255,${0.55 * alpha * build})`);
        core.addColorStop(1, 'rgba(95,216,255,0)');
        g.fillStyle = core;
        g.fillRect(center.x - radius, center.y - radius, radius * 2, radius * 2);
      }

      // 5. A scan sweep across the finished miniature, like every navigation on the globe.
      if (mix >= 1 && landStart == null) {
        const k = ((t - T.compress) / 900) % 1;
        const yy = center.y - radius + k * radius * 2;
        const half = Math.sqrt(Math.max(0, radius * radius - (yy - center.y) ** 2));
        const sg = g.createLinearGradient(0, yy - 6, 0, yy + 6);
        sg.addColorStop(0, 'rgba(230,251,255,0)');
        sg.addColorStop(0.5, 'rgba(230,251,255,0.45)');
        sg.addColorStop(1, 'rgba(230,251,255,0)');
        g.fillStyle = sg;
        g.fillRect(center.x - half, yy - 6, half * 2, 12);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  return (
    <div
      ref={rootRef}
      className={`intro intro-${phase}`}
      onClick={finish}
      role="presentation"
    >
      <div className="intro-screen" aria-hidden="true">
        <p ref={textRef} className="intro-name" data-text={name}>
          {name.slice(0, typed)}
          {typed2 === 0 && <span className="intro-caret" />}
        </p>
        <p ref={text2Ref} className="intro-line" data-text={`> ${LINE2}`}>
          {typed2 > 0 && <span className="intro-chevron">&gt; </span>}
          {LINE2.slice(0, typed2)}
          {typed2 > 0 && <span className="intro-caret" />}
        </p>
      </div>
      <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />
      <button type="button" className="intro-skip" onClick={(e) => { e.stopPropagation(); finish(); }}>
        Skip intro
      </button>
    </div>
  );
}
