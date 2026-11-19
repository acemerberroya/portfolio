import * as THREE from 'three';
import { useMemo } from 'react';
import { trailFragment, trailVertex } from './shaders.js';

// Light trails shared by both hubs: arcs on many tilted planes, optional core
// spirals, radial "data ticks" and loose sparks, all in one LineSegments and
// one Points geometry (two draw calls however many strands there are).
// Small seeded PRNG so the hologram looks the same on every visit.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomAxis(rand, out = new THREE.Vector3()) {
  const u = rand() * 2 - 1;
  const th = rand() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return out.set(s * Math.cos(th), u, s * Math.sin(th));
}

// One LineSegments geometry holding every strand: arcs on many tilted planes,
// spirals at the core, and short radial "data ticks" on the shell.
export function buildTrails({
  R, seed: seedNum = 1705, arcs = 150, arcDensity = 52, rMin = 0.5, rSpan = 0.48, lenMin = 0.2, lenSpan = 0.75,
  spirals = 0, spiralSegs = 170, ticks = 0, loose = 0,
}) {
  const rand = rng(seedNum);
  const pos = [];
  const tAttr = [];
  const seed = [];
  const sparks = [];
  const axis = new THREE.Vector3();
  const u = new THREE.Vector3();
  const v = new THREE.Vector3();
  const p = new THREE.Vector3();
  const q = new THREE.Vector3();

  const push = (a, b, ta, tb, s) => {
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
    tAttr.push(ta, tb);
    seed.push(s, s);
  };
  const basis = (ax) => {
    u.set(1, 0, 0);
    if (Math.abs(ax.x) > 0.9) u.set(0, 1, 0);
    u.cross(ax).normalize();
    v.copy(ax).cross(u).normalize();
  };

  // Arcs: mostly near the shell, some deeper, partial lengths, a slight wobble.
  for (let i = 0; i < arcs; i++) {
    randomAxis(rand, axis);
    basis(axis);
    const r = R * (rMin + rSpan * Math.sqrt(rand()));
    const a0 = rand() * Math.PI * 2;
    const len = Math.PI * 2 * (lenMin + lenSpan * rand());
    const segs = Math.max(8, Math.ceil((len / (Math.PI * 2)) * arcDensity));
    const wob = 0.02 + rand() * 0.04;
    const k = 3 + Math.floor(rand() * 6);
    const ph = rand() * 6.28;
    const s = rand();
    for (let j = 0; j < segs; j++) {
      const t0 = j / segs;
      const t1 = (j + 1) / segs;
      const at = (t) => {
        const th = a0 + len * t;
        const rr = r * (1 + wob * Math.sin(th * k + ph));
        return [Math.cos(th) * rr, Math.sin(th) * rr];
      };
      const [x0, y0] = at(t0);
      const [x1, y1] = at(t1);
      p.copy(u).multiplyScalar(x0).addScaledVector(v, y0);
      q.copy(u).multiplyScalar(x1).addScaledVector(v, y1);
      push(p, q, t0, t1, s);
      if (j % 6 === 0) sparks.push(p.x, p.y, p.z);
    }
  }

  // Spirals: the swirling core of the reference image.
  for (let i = 0; i < spirals; i++) {
    randomAxis(rand, axis);
    axis.lerp(new THREE.Vector3(0, 0, 1), 0.55).normalize(); // lean toward the viewer
    basis(axis);
    const turns = 2.5 + rand() * 2;
    const r0 = R * 0.06;
    const r1 = R * (0.45 + rand() * 0.3);
    const segs = spiralSegs;
    const a0 = rand() * 6.28;
    const s = rand() * 0.3; // spirals reveal early
    for (let j = 0; j < segs; j++) {
      const t0 = j / segs;
      const t1 = (j + 1) / segs;
      const at = (t, out) => {
        const th = a0 + t * turns * Math.PI * 2;
        const rr = r0 + (r1 - r0) * t;
        return out.copy(u).multiplyScalar(Math.cos(th) * rr).addScaledVector(v, Math.sin(th) * rr);
      };
      push(at(t0, p), at(t1, q), t0, t1, s);
    }
  }

  // Data ticks: short radial dashes on the shell, like the bright flecks in the reference.
  for (let i = 0; i < ticks; i++) {
    randomAxis(rand, axis);
    const r = R * (0.86 + rand() * 0.14);
    const l = R * (0.03 + rand() * 0.07);
    p.copy(axis).multiplyScalar(r);
    q.copy(axis).multiplyScalar(r + l);
    push(p, q, 0, 1, rand());
    sparks.push(q.x, q.y, q.z);
  }

  // Loose sparks through the volume.
  for (let i = 0; i < loose; i++) {
    randomAxis(rand, axis);
    const r = R * Math.cbrt(0.08 + 0.92 * rand());
    sparks.push(axis.x * r, axis.y * r, axis.z * r);
  }

  const lines = new THREE.BufferGeometry();
  lines.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  lines.setAttribute('aT', new THREE.Float32BufferAttribute(tAttr, 1));
  lines.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
  const points = new THREE.BufferGeometry();
  points.setAttribute('position', new THREE.Float32BufferAttribute(sparks, 3));
  return { lines, points };
}


// One additive trail material per hub, sharing the hub's uniforms (so the
// scan sweep, reveal, flicker and time drive it).
export function useTrailMaterial(uniforms) {
  return useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: trailVertex, fragmentShader: trailFragment, uniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }),
    [uniforms]
  );
}

// Straight conduits from the core out to each beacon; the trail shader sends
// a pulse along each one, outward.
export function buildConduits(points, segs = 24) {
  const pos = [];
  const t = [];
  const seed = [];
  points.forEach((end, i) => {
    const s = (i + 1) / (points.length + 1);
    for (let j = 0; j < segs; j++) {
      const a = j / segs;
      const b = (j + 1) / segs;
      pos.push(end.x * a, end.y * a, end.z * a, end.x * b, end.y * b, end.z * b);
      t.push(a * 0.5, b * 0.5);
      seed.push(s * 0.2, s * 0.2);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aT', new THREE.Float32BufferAttribute(t, 1));
  g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
  return g;
}
