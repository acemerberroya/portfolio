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
  compress: 1500, // letters → ball
  surge: 900, // ball pulses (longer if the room isn't ready yet)
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
      if (data[(y * c.width + x) * 4 + 3] > 128) pts.push([r.left + x, r.top + y]);
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
    timers.push(setTimeout(() => setPhase('particles'), line2Start + LINE2.length * T.typeChar2 + T.hold));
    return () => timers.forEach(clearTimeout);
  }, [name.length]);

  // Particles: compress into a ball, surge, then land on the globe.
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

    // Both typed lines break apart into the ball.
    const budget = W < 700 ? 1000 : 1800;
    const starts = [
      ...sampleText(textRef.current, budget * 0.7),
      ...sampleText(text2Ref.current, budget * 0.3),
    ];
    const n = starts.length;
    const cx = W / 2;
    const cy = H / 2;
    const R0 = Math.min(W, H) * 0.12;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const parts = starts.map(([x, y], i) => {
      // A point on a sphere for each particle (Fibonacci spiral), plus a
      // per-particle seed for the surge.
      const yy = 1 - (i / Math.max(n - 1, 1)) * 2;
      const rr = Math.sqrt(1 - yy * yy);
      const th = golden * i;
      return {
        sx: x, sy: y,
        ux: Math.cos(th) * rr, uy: yy, uz: Math.sin(th) * rr,
        seed: Math.random(),
        delay: Math.random() * 0.35,
        inner: i % 3 === 0, // a third stream through the inside of the ball
      };
    });

    let raf;
    const t0 = performance.now();
    let surgeEnd = null;
    let landStart = null;
    const from = { x: cx, y: cy, r: R0 };

    const frame = (now) => {
      const t = now - t0;
      const sec = t / 1000;
      let center = { x: cx, y: cy };
      let radius = R0;
      let alpha = 1;
      let mix = 0; // 0 = text positions, 1 = ball

      if (t < T.compress) {
        mix = t / T.compress;
      } else {
        mix = 1;
        if (surgeEnd == null) surgeEnd = T.compress + T.surge;
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

      // Trails while the ball forms; a clean frame while it lands on the globe.
      if (landStart == null) {
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = 'rgba(0, 0, 0, 0.28)';
        g.fillRect(0, 0, W, H);
      } else {
        g.clearRect(0, 0, W, H);
      }
      g.globalCompositeOperation = 'lighter';

      const spin = sec * 0.9;
      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      for (let i = 0; i < n; i++) {
        const p = parts[i];
        // Where this particle sits on the spinning ball (with the surge).
        let r = radius;
        if (p.inner) r *= 0.15 + 0.85 * ((p.seed + sec * 0.7) % 1);
        const wave = Math.pow(0.5 + 0.5 * Math.sin(p.uy * 6 - sec * 7 + p.seed * 2), 6);
        r *= 1 + 0.06 * wave;
        const x3 = p.ux * cs - p.uz * sn;
        const z3 = p.ux * sn + p.uz * cs;
        const bx = center.x + x3 * r;
        const by = center.y - p.uy * r;
        const depth = 0.35 + 0.65 * ((z3 + 1) / 2);

        // Spiral in from the letter: rotate around the centre as it closes in.
        const local = Math.min(1, Math.max(0, (mix - p.delay) / (1 - p.delay)));
        const e = ease(local);
        let x;
        let y;
        if (e < 1) {
          const ang = (1 - e) * 2.2;
          const dx = p.sx - cx;
          const dy = p.sy - cy;
          const rx = dx * Math.cos(e * ang) - dy * Math.sin(e * ang);
          const ry = dx * Math.sin(e * ang) + dy * Math.cos(e * ang);
          x = cx + rx * (1 - e) + (bx - cx) * e;
          y = cy + ry * (1 - e) + (by - cy) * e;
        } else {
          x = bx;
          y = by;
        }
        const hot = Math.max(wave, 1 - e) * 0.9;
        const col = CYAN.map((c, j) => Math.round(c + (HOT[j] - c) * hot));
        const a = alpha * (e < 1 ? 0.9 : depth) * (0.45 + 0.55 * wave + (1 - e) * 0.3);
        const size = (e < 1 ? 1.6 : 1.1 + depth * 1.4) * (1 + wave);
        g.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${Math.min(1, a)})`;
        g.fillRect(x - size / 2, y - size / 2, size, size);
      }
      // Glowing core once the ball has formed.
      if (mix >= 1) {
        const glow = g.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius * 0.7);
        glow.addColorStop(0, `rgba(230,251,255,${0.55 * alpha})`);
        glow.addColorStop(1, 'rgba(95,216,255,0)');
        g.fillStyle = glow;
        g.fillRect(center.x - radius, center.y - radius, radius * 2, radius * 2);
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
