import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ROOMS } from '../rooms.js';
import { GLOBE_R, GLOBE_Y, latLngToVec3 } from './geo.js';
import { Beacon, useFresnel } from './Globe.jsx';
import { useHub } from './hub.js';
import { glowTexture } from './Room.jsx';
import { dotsFragment, dotsVertex, trailFragment, trailVertex } from './shaders.js';

// The Euthenics room's hub: a Jarvis-style projection of gold light trails,
// spirals and sparks. It is driven by the same hub as the globe (facing,
// scan sweep, spin, drag), carries the same beacons and satellites, and only
// swaps the body and the palette.
const ROOM = ROOMS.euthenics;
export const GOLD = '#ffb648';
const HOT = '#fff1d0';
const R = GLOBE_R;

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
function buildTrails(lite) {
  const rand = rng(1705);
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
  const arcs = lite ? 100 : 220;
  for (let i = 0; i < arcs; i++) {
    randomAxis(rand, axis);
    basis(axis);
    const r = R * (0.5 + 0.48 * Math.sqrt(rand()));
    const a0 = rand() * Math.PI * 2;
    const len = Math.PI * 2 * (0.2 + 0.75 * rand());
    const segs = Math.max(8, Math.ceil((len / (Math.PI * 2)) * (lite ? 48 : 72)));
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
  const spirals = lite ? 3 : 5;
  for (let i = 0; i < spirals; i++) {
    randomAxis(rand, axis);
    axis.lerp(new THREE.Vector3(0, 0, 1), 0.55).normalize(); // lean toward the viewer
    basis(axis);
    const turns = 2.5 + rand() * 2;
    const r0 = R * 0.06;
    const r1 = R * (0.45 + rand() * 0.3);
    const segs = lite ? 140 : 260;
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
  const ticks = lite ? 160 : 360;
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
  const loose = lite ? 500 : 1100;
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

export default function Hologram({ lite, reduced, go }) {
  const { gl } = useThree();
  const rings = useRef();
  const core = useRef();
  const reveal = useRef(reduced ? 1 : 0);

  // Same uniform names as the globe's dots, so the shared hub drives the scan sweep.
  const uniforms = useMemo(
    () => ({
      uSize: { value: (lite ? 22 : 20) * Math.min(gl.getPixelRatio(), 2) },
      uScan: { value: 9 },
      uCenterY: { value: GLOBE_Y },
      uColor: { value: new THREE.Color(GOLD) },
      uWarm: { value: new THREE.Color(HOT) },
      uHome: { value: latLngToVec3(ROOM.homePin.lat, ROOM.homePin.lng, 1) },
      uTime: { value: 0 },
      uReveal: { value: reveal.current },
      uFlicker: { value: 1 },
      uHot: { value: new THREE.Color(HOT) },
    }),
    [lite, gl]
  );

  const { spin, st, bind } = useHub({
    sections: ROOM.sections, homePin: ROOM.homePin, homeId: ROOM.homeId, reduced, uniforms,
  });

  const geo = useMemo(() => buildTrails(lite), [lite]);
  const trailMat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: trailVertex, fragmentShader: trailFragment, uniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }),
    [uniforms]
  );
  const sparkMat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: dotsVertex, fragmentShader: dotsFragment, uniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }),
    [uniforms]
  );
  const glow = useMemo(() => glowTexture('rgba(255,214,140,0.95)', 'rgba(255,150,40,0.3)'), []);

  const shell = useFresnel(GOLD, 3.2, 0.55);
  const halo = useFresnel('#e08a2a', 5, 0.1, 1);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    if (!reduced) uniforms.uTime.value = t;
    // Staged reveal: strands switch on by seed over the first ~1.6 s, with a
    // projector flicker that settles once the projection is complete.
    if (reveal.current < 1) {
      reveal.current = reduced ? 1 : Math.min(1, reveal.current + dt / 1.6);
      uniforms.uReveal.value = reveal.current;
    }
    uniforms.uFlicker.value = reduced
      ? 1
      : reveal.current < 1
        ? 0.55 + 0.45 * Math.abs(Math.sin(t * 37.0) * Math.sin(t * 13.0))
        : 0.94 + 0.06 * Math.sin(t * 23.0) * Math.sin(t * 7.0);
    if (reduced) return;
    if (core.current) core.current.scale.setScalar(1 + 0.08 * Math.sin(t * 2.2));
    if (rings.current) {
      rings.current.children[0].rotation.z += dt * 0.15;
      rings.current.children[1].rotation.z -= dt * 0.1;
      rings.current.children[2].rotation.y += dt * 0.12;
    }
  });

  return (
    <group>
      <group ref={spin}>
        {/* Grab surface (also the faint body of the projection) */}
        <mesh {...bind}>
          <sphereGeometry args={[R * 1.01, 24, 24]} />
          <meshBasicMaterial color="#2a1806" transparent opacity={0.05} depthWrite={false} />
        </mesh>
        <lineSegments geometry={geo.lines} material={trailMat} />
        <points geometry={geo.points} material={sparkMat} />
        {ROOM.sections.map((sec) => (
          <Beacon
            key={sec.id}
            sec={sec}
            st={st}
            go={go}
            homePin={ROOM.homePin}
            homeId={ROOM.homeId}
            palette={ROOM.palette}
          />
        ))}
      </group>

      {/* Bright core and its glow, facing the camera */}
      <sprite scale={[R * 0.9, R * 0.9, 1]}>
        <spriteMaterial map={glow} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <mesh ref={core}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshBasicMaterial color={HOT} toneMapped={false} />
      </mesh>

      <mesh material={shell}>
        <sphereGeometry args={[R * 1.015, 48, 48]} />
      </mesh>
      <mesh material={halo}>
        <sphereGeometry args={[R * 1.2, 32, 32]} />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2.2, 0.3, 0]}>
          <torusGeometry args={[R * 1.18, 0.005, 6, 160]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.5} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 1.75, -0.4, 0]}>
          <torusGeometry args={[R * 1.3, 0.004, 6, 160]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.28} toneMapped={false} />
        </mesh>
        <mesh rotation={[0.2, 0, Math.PI / 2.6]}>
          <torusGeometry args={[R * 1.08, 0.006, 6, 160, Math.PI * 1.4]} />
          <meshBasicMaterial color={HOT} transparent opacity={0.35} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
