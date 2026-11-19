// Batched drawing for the 2D particle overlays (intro and transformation).
// Setting a canvas colour and filling one tiny square at a time, thousands of
// times a frame, is what makes 2D particle effects stutter. Instead, shapes are
// grouped by (quantised) colour and drawn with one path and one fill/stroke per
// group: a few dozen canvas calls per frame instead of thousands.

const Q = 5; // colour-mix quantisation steps
const QA = 10; // alpha quantisation steps
export const q = (v) => Math.round(Math.min(1, Math.max(0, v)) * Q);
export const qa = (v) => Math.round(Math.min(1, Math.max(0, v)) * QA);

export function makeRectBatch() {
  const groups = new Map();
  return {
    // key: a stable string for this colour; style: its CSS colour
    add(key, style, x, y, w, h) {
      let gr = groups.get(key);
      if (!gr) { gr = { style, r: [] }; groups.set(key, gr); }
      gr.r.push(x, y, w, h);
    },
    flush(g) {
      groups.forEach((gr) => {
        const r = gr.r;
        if (!r.length) return;
        g.fillStyle = gr.style;
        g.beginPath();
        for (let i = 0; i < r.length; i += 4) g.rect(r[i], r[i + 1], r[i + 2], r[i + 3]);
        g.fill();
        r.length = 0;
      });
    },
    clear() { groups.clear(); },
  };
}

export function makeLineBatch() {
  const groups = new Map();
  return {
    add(key, style, x1, y1, x2, y2) {
      let gr = groups.get(key);
      if (!gr) { gr = { style, s: [] }; groups.set(key, gr); }
      gr.s.push(x1, y1, x2, y2);
    },
    flush(g, width = 1) {
      g.lineWidth = width;
      groups.forEach((gr) => {
        const s = gr.s;
        if (!s.length) return;
        g.strokeStyle = gr.style;
        g.beginPath();
        for (let i = 0; i < s.length; i += 4) { g.moveTo(s[i], s[i + 1]); g.lineTo(s[i + 2], s[i + 3]); }
        g.stroke();
        s.length = 0;
      });
    },
    clear() { groups.clear(); },
  };
}

// A cached rgba() string for a colour and a quantised alpha (from qa()).
const styleCache = new Map();
export function rgba(rgb, aq) {
  const key = `${rgb[0]},${rgb[1]},${rgb[2]},${aq}`;
  let s = styleCache.get(key);
  if (!s) {
    s = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(aq / QA).toFixed(2)})`;
    if (styleCache.size > 4000) styleCache.clear();
    styleCache.set(key, s);
  }
  return s;
}
export const QSTEPS = Q;
// Mix two colours at a quantised step (0..Q).
export function mixQ(a, b, k) {
  const t = k / Q;
  return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)];
}
