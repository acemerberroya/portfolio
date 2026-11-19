import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { companies, recommendation } from '../data/euthenics.js';
import { ROOMS } from '../rooms.js';
import { GLOBE_R, GLOBE_Y, latLngToVec3 } from './geo.js';
import { Beacon, useFresnel } from './Globe.jsx';
import { morphRamp, useHub } from './hub.js';
import { getState, useStore } from '../store.js';
import { glowTexture } from './Room.jsx';
import { dotsFragment, dotsVertex } from './shaders.js';
import { buildConduits, buildTrails, useTrailMaterial } from './trails.js';

// The Euthenics room's hub: a gold AI core built around the evaluation.
//  - a shell of flowing light trails and sparks, with spirals at the centre,
//  - three orbits, one per target company, each carrying a bright node
//    (the recommended company's orbit burns brightest),
//  - conduits from the core to every beacon, with pulses running outward,
//  - a flare through the whole core on every navigation.
// It is driven by the same hub as the globe (facing, scan sweep, spin, drag)
// and carries the same beacons and satellites.
const ROOM = ROOMS.euthenics;
export const GOLD = '#ffb648';
const HOT = '#fff1d0';
const R = GLOBE_R;

// One orbit per company: radius, tilt and speed. The pick gets the hot colour.
const ORBITS = companies.map((c, i) => ({
  id: c.id,
  r: R * (0.5 + i * 0.16),
  tilt: [0.5 + i * 0.55, i * 0.9, 0.3 - i * 0.35],
  speed: 0.5 - i * 0.12,
  pick: c.id === recommendation.choice,
}));

function Orbit({ o, reduced }) {
  const node = useRef();
  useFrame((state) => {
    if (!node.current) return;
    const a = (reduced ? 0.6 : state.clock.elapsedTime * o.speed) + o.r;
    node.current.position.set(Math.cos(a) * o.r, Math.sin(a) * o.r, 0);
  });
  const color = o.pick ? HOT : GOLD;
  return (
    <group rotation={o.tilt}>
      <mesh>
        <torusGeometry args={[o.r, o.pick ? 0.006 : 0.004, 4, 96]} />
        <meshBasicMaterial color={color} transparent opacity={o.pick ? 0.55 : 0.45} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={node}>
        <sphereGeometry args={[o.pick ? 0.06 : 0.045, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function Hologram({ lite, reduced, go, switchRoom, active = true }) {
  const { gl } = useThree();
  const rings = useRef();
  const core = useRef();
  const glowMat = useRef();
  const reveal = useRef(reduced ? 1 : 0);

  // Same uniform names as the globe's dots, so the shared hub drives the scan sweep.
  const uniforms = useMemo(
    () => ({
      uSize: { value: (lite ? 22 : 20) * Math.min(gl.getPixelRatio(), 2) }, // zeroed while the hub is inactive (see below)
      uScan: { value: 9 },
      uCenterY: { value: GLOBE_Y },
      uColor: { value: new THREE.Color(GOLD) },
      uWarm: { value: new THREE.Color(HOT) },
      uHome: { value: latLngToVec3(ROOM.homePin.lat, ROOM.homePin.lng, 1) },
      uTime: { value: 0 },
      uReveal: { value: reveal.current },
      uFlicker: { value: 1 },
      uHot: { value: new THREE.Color(HOT) },
      uBase: { value: 0.38 },
    }),
    [lite, gl]
  );
  const baseSize = useMemo(() => uniforms.uSize.value, [uniforms]);

  const morphing = useStore((s) => s.morph != null);
  const { spin, st, bind, time } = useHub({
    sections: ROOM.sections, homePin: ROOM.homePin, homeId: ROOM.homeId, reduced, uniforms,
  });

  const geo = useMemo(
    () => buildTrails({
      R, seed: 1705,
      arcs: lite ? 70 : 130, arcDensity: lite ? 36 : 52,
      spirals: lite ? 3 : 4, spiralSegs: lite ? 100 : 160,
      ticks: lite ? 120 : 220, loose: lite ? 350 : 650,
    }),
    [lite]
  );
  const conduits = useMemo(
    () => buildConduits(ROOM.sections.map((s) => latLngToVec3(s.lat, s.lng, R))),
    []
  );
  const trailMat = useTrailMaterial(uniforms);
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
    const t = time.current;
    if (!reduced) uniforms.uTime.value = t;
    // Hidden during a transformation's burst: build again strand by strand once shown.
    if (getState().morph?.phase === 'burst') reveal.current = 0;
    const ramp = morphRamp();
    // Staged reveal: strands switch on by seed over the first ~1.6 s, with a
    // projector flicker that settles once the projection is complete.
    if (reveal.current < 1) {
      reveal.current = reduced ? 1 : Math.min(1, reveal.current + dt / 1.6);
      uniforms.uReveal.value = reveal.current;
    }
    // Navigation flare: rides the shared scan sweep (0 → 1 on every navigation).
    const sc = st.current.scan;
    const flare = reduced || sc >= 1 ? 0 : Math.sin(sc * Math.PI);
    const flicker = reduced
      ? 1
      : reveal.current < 1
        ? 0.55 + 0.45 * Math.abs(Math.sin(t * 37.0) * Math.sin(t * 13.0))
        : 0.94 + 0.06 * Math.sin(t * 23.0) * Math.sin(t * 7.0);
    uniforms.uFlicker.value = active ? flicker * (1 + flare * 0.9) * (1 + ramp * 1.5) : 0;
    // Inactive (mounted early, tiny, so its shaders compile behind the transformation): draw nothing visible.
    uniforms.uSize.value = active ? baseSize : 0;
    if (glowMat.current) glowMat.current.opacity = 0.4 + flare * 0.45;
    if (core.current) core.current.scale.setScalar((reduced ? 1 : 1 + 0.08 * Math.sin(t * 2.2)) * (1 + flare * 0.6));
    if (reduced) return;
    if (rings.current) {
      rings.current.children[0].rotation.z += dt * 0.15;
      rings.current.children[1].rotation.z -= dt * 0.1;
      rings.current.children[2].rotation.y += dt * 0.12;
    }
  });

  return (
    <group>
      <group ref={spin}>
        {/* Grab surface: invisible, only there to be dragged */}
        <mesh {...bind}>
          <sphereGeometry args={[R * 1.01, 16, 12]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
        <lineSegments geometry={geo.lines} material={trailMat} />
        <lineSegments geometry={conduits} material={trailMat} />
        <points geometry={geo.points} material={sparkMat} />
        {active && ROOM.sections.map((sec) => (
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

      {/* The core's button: transforms back into the portfolio globe */}
      {active && !morphing && switchRoom && (
        <Html position={[0, -0.5, 0]} center zIndexRange={[5, 0]}>
          <div
            className="beacon-label core-button core-to-main"
            onClick={(e) => { e.stopPropagation(); switchRoom('main'); }}
            onPointerEnter={() => { document.body.style.cursor = 'pointer'; }}
            onPointerLeave={() => { document.body.style.cursor = ''; }}
            aria-hidden="true"
          >
            <span className="bl-name">Portfolio</span>
            <span className="bl-hint">Transform back</span>
          </div>
        </Html>
      )}

      {/* The three company orbits around the core */}
      {ORBITS.map((o) => <Orbit key={o.id} o={o} reduced={reduced} />)}

      {/* Bright core and its glow, facing the camera */}
      <sprite scale={[R * 0.9, R * 0.9, 1]}>
        <spriteMaterial ref={glowMat} map={glow} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <mesh ref={core}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshBasicMaterial color={HOT} toneMapped={false} />
      </mesh>

      <mesh material={shell}>
        <sphereGeometry args={[R * 1.015, 32, 24]} />
      </mesh>
      <mesh material={halo}>
        <sphereGeometry args={[R * 1.2, 24, 18]} />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2.2, 0.3, 0]}>
          <torusGeometry args={[R * 1.18, 0.005, 4, 120]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.5} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 1.75, -0.4, 0]}>
          <torusGeometry args={[R * 1.3, 0.004, 4, 120]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.28} toneMapped={false} />
        </mesh>
        <mesh rotation={[0.2, 0, Math.PI / 2.6]}>
          <torusGeometry args={[R * 1.08, 0.006, 4, 90, Math.PI * 1.4]} />
          <meshBasicMaterial color={HOT} transparent opacity={0.35} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
