import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { getState, setState, useStore } from '../store.js';
import { damp } from './geo.js';

// A folded holographic paper floating in front of the Euthenics core. It works
// like a beacon: hover lights it, click opens the Reflection section. While
// that section is open the paper unfolds flat; otherwise it rests folded,
// breathing slightly open and closed.
const W = 0.46; // width of one half
const H = 0.64;
const SECTION = 'eu-reflection';

// Each half is drawn once on a canvas: glowing border, header, text lines.
function halfTexture(side) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 356;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(255,170,60,0.10)';
  g.fillRect(0, 0, 256, 356);
  for (let y = 0; y < 356; y += 4) {
    g.fillStyle = 'rgba(255,200,120,0.05)';
    g.fillRect(0, y, 256, 1);
  }
  g.strokeStyle = 'rgba(255,205,130,0.95)';
  g.lineWidth = 4;
  g.strokeRect(4, 4, 248, 348);
  g.fillStyle = 'rgba(255,235,200,0.95)';
  if (side === 'left') {
    g.font = '700 26px sans-serif';
    g.fillText('REFLECTION', 22, 50);
    g.font = '600 13px sans-serif';
    g.fillStyle = 'rgba(255,200,120,0.9)';
    g.fillText('WORK IMMERSION', 22, 74);
    g.fillRect(22, 86, 120, 2);
  }
  const top = side === 'left' ? 112 : 34;
  for (let y = top, i = 0; y < 330; y += 18, i++) {
    const w = 150 + ((i * 53) % 60);
    g.fillStyle = 'rgba(255,214,150,0.55)';
    g.fillRect(22, y, w, 5);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function usePaperMaterial(side) {
  return useMemo(() => new THREE.MeshBasicMaterial({
    map: halfTexture(side), transparent: true, opacity: 0.85, side: THREE.DoubleSide,
    depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), [side]);
}

export default function HoloPaper({ go, reduced, position, rotation }) {
  const open = useStore((s) => s.section === SECTION);
  const hovered = useStore((s) => s.hoverSection === SECTION);
  const root = useRef();
  const left = useRef();
  const right = useRef();
  const st = useRef({ fold: 1, glow: 0 });
  const leftMat = usePaperMaterial('left');
  const rightMat = usePaperMaterial('right');

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = st.current;
    // Closed: folded to a V that breathes; open: flat.
    const target = open ? 0 : 1.05 + (reduced ? 0 : 0.12 * Math.sin(t * 1.4));
    s.fold += (target - s.fold) * (reduced ? 1 : damp(open ? 5 : 3, dt));
    s.glow += ((hovered || open ? 1 : 0) - s.glow) * (reduced ? 1 : damp(8, dt));
    if (left.current) left.current.rotation.y = s.fold;
    if (right.current) right.current.rotation.y = -s.fold;
    leftMat.opacity = rightMat.opacity = 0.75 + 0.25 * s.glow;
    if (root.current) {
      root.current.position.y = position[1] + (reduced ? 0 : 0.05 * Math.sin(t * 1.1));
      root.current.scale.setScalar(1 + 0.12 * s.glow);
    }
  });

  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const enter = (e) => {
    e?.stopPropagation?.();
    clearTimeout(timer.current);
    if (getState().hoverSection !== SECTION) setState({ hoverSection: SECTION, pinHover: null });
    document.body.style.cursor = 'pointer';
  };
  const leave = (e) => {
    e?.stopPropagation?.();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setState((s) => (s.hoverSection === SECTION ? { hoverSection: null } : {}));
      document.body.style.cursor = '';
    }, 120);
  };
  const pick = (e) => {
    e?.stopPropagation?.();
    go(SECTION, null, { fromKeyboard: false });
  };

  return (
    <group ref={root} position={position} rotation={rotation}>
      {/* Hinged halves: each pivots on the centre fold */}
      <group ref={left}>
        <mesh position={[-W / 2, 0, 0]} material={leftMat}>
          <planeGeometry args={[W, H]} />
        </mesh>
      </group>
      <group ref={right}>
        <mesh position={[W / 2, 0, 0]} material={rightMat}>
          <planeGeometry args={[W, H]} />
        </mesh>
      </group>
      {/* The fold line glows */}
      <mesh>
        <boxGeometry args={[0.012, H, 0.012]} />
        <meshBasicMaterial color="#fff1d0" toneMapped={false} />
      </mesh>
      {/* Fixed hit area, the size of the open paper */}
      <mesh onPointerOver={enter} onPointerOut={leave} onClick={pick}>
        <planeGeometry args={[W * 2, H + 0.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[0, H / 2 + 0.2, 0]} center zIndexRange={[4, 0]}>
        <div
          className={`beacon-label paper-label ${hovered ? 'is-hovered' : ''} ${open ? 'is-active' : ''}`}
          onPointerEnter={enter}
          onPointerLeave={leave}
          onClick={pick}
          aria-hidden="true"
        >
          <span className="bl-name">Reflection paper</span>
          <span className="bl-hint">{open ? 'Open in the panel' : 'Click to open'}</span>
        </div>
      </Html>
    </group>
  );
}
