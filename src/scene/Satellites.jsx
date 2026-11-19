import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { satellitesFor } from '../sections.js';
import { getState, setState, useStore } from '../store.js';
import { AMBER, CYAN, GLOBE_R, angleDelta, damp } from './geo.js';

const R = GLOBE_R * 1.32;
const wp = new THREE.Vector3();
const cp = new THREE.Vector3();

function Satellite({ item, angle, palette }) {
  const mesh = useRef();
  const label = useRef();
  const last = useRef(-1);
  const lit = useStore((s) => s.focus === item.id || s.hover === item.id);
  const selected = useStore((s) => s.focus === item.id);

  useFrame((state, dt) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += dt * 0.8;
    mesh.current.getWorldPosition(wp);
    mesh.current.parent.parent.getWorldPosition(cp);
    const front = THREE.MathUtils.smoothstep(wp.z - cp.z, -0.9, 0.6);
    const s = (lit ? 1.6 : 1) * (0.7 + 0.3 * front);
    mesh.current.scale.setScalar(s);
    if (label.current) {
      const op = Math.round((0.15 + 0.85 * front) * 10) / 10;
      if (op !== last.current) {
        last.current = op;
        label.current.style.opacity = String(op);
        label.current.style.pointerEvents = front > 0.35 ? 'auto' : 'none';
      }
    }
  });

  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const enter = (e) => {
    e?.stopPropagation?.();
    clearTimeout(timer.current);
    const s = getState();
    if (s.hover !== item.id || s.hoverFrom !== 'scene') setState({ hover: item.id, hoverFrom: 'scene' });
    document.body.style.cursor = 'pointer';
  };
  const leave = (e) => {
    e?.stopPropagation?.();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setState((s) => (s.hover === item.id ? { hover: null } : {}));
      document.body.style.cursor = '';
    }, 140);
  };
  const pick = (e) => { e?.stopPropagation?.(); setState({ focus: item.id }); };

  return (
    <group position={[R * Math.sin(angle), 0, R * Math.cos(angle)]}>
      <mesh ref={mesh}>
        <octahedronGeometry args={[0.075, 0]} />
        <meshBasicMaterial color={selected ? palette.active : palette.base} toneMapped={false} wireframe={!lit} />
      </mesh>
      {/* Fixed-size hit area: the visible shard grows when lit, this doesn't. */}
      <mesh onPointerOver={enter} onPointerOut={leave} onClick={pick}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html position={[0, 0.2, 0]} center zIndexRange={[4, 0]}>
        <div
          ref={label}
          className={`sat-label ${lit ? 'is-lit' : ''} ${selected ? 'is-selected' : ''}`}
          onPointerEnter={enter}
          onPointerLeave={leave}
          onClick={pick}
          aria-hidden="true"
        >
          {item.label}
        </div>
      </Html>
    </group>
  );
}

// Each open section's items orbit the globe. Picking one highlights it in the
// panel; hovering an item in the panel swings its satellite to the front.
// `itemsFor` and `palette` default to the main room; the Euthenics hologram
// passes its own.
const MAIN_PALETTE = { base: CYAN, active: AMBER };
export default function Satellites({ reduced, itemsFor = satellitesFor, palette = MAIN_PALETTE }) {
  const section = useStore((s) => s.section);
  const items = useMemo(() => itemsFor(section), [section, itemsFor]);
  const ring = useRef();
  const st = useRef({ angle: 0, appear: 1 });

  useEffect(() => { st.current.appear = reduced ? 1 : 0; }, [section, reduced]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const n = items.length;
    if (!ring.current || !n) return;
    const s = st.current;
    const { focus, hover, hoverFrom } = getSel();
    // Hovering a satellite in the scene freezes the ring so it stays under the
    // cursor; hovering an item in the panel swings its satellite to the front.
    const sceneHover = hover && hoverFrom === 'scene';
    const idx = sceneHover ? -1 : items.findIndex((i) => i.id === (hover || focus));
    if (idx >= 0) s.angle += angleDelta(s.angle, -(idx / n) * Math.PI * 2) * (reduced ? 1 : damp(3, dt));
    else if (!reduced && !sceneHover) s.angle -= 0.07 * dt;
    s.appear = reduced ? 1 : Math.min(1, s.appear + dt * 1.4);
    const e = 1 - Math.pow(1 - s.appear, 3);
    ring.current.rotation.y = s.angle + (1 - e) * 1.2;
    ring.current.scale.setScalar(0.55 + 0.45 * e);
  });

  if (!items.length) return null;
  return (
    <group rotation={[0.3, 0, -0.1]}>
      <group ref={ring}>
        {items.map((it, i) => (
          <Satellite key={`${section}-${it.id}`} item={it} palette={palette} angle={(i / items.length) * Math.PI * 2} />
        ))}
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[R, 0.004, 6, 200]} />
          <meshBasicMaterial color={palette.base} transparent opacity={0.3} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

// Read without subscribing (the frame loop reads every frame anyway).
function getSel() {
  const s = getState();
  return { focus: s.focus, hover: s.hover, hoverFrom: s.hoverFrom };
}
