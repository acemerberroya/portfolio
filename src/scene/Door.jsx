import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { getState, setState, useStore } from '../store.js';
import { damp } from './geo.js';
import { BACK_Z, FLOOR_Y } from './Room.jsx';
import { portalFragment, portalVertex } from './shaders.js';

// Where the door stands: on the back wall, left of the hub, between the
// pillars, so it stays visible beside both the home panel and a section panel.
export const DOOR = { x: -3.9, w: 1.3, h: 2.7 };
DOOR.y = FLOOR_Y + DOOR.h / 2;
DOOR.z = BACK_Z + 0.06;

// A glowing doorway between the two rooms. Its frame takes the room's light
// colour; the portal inside shows the colour of the room it leads to.
// Hover (or keyboard focus on its label) lights it up; click walks through.
export default function Door({ label, hint, frame, portal, onEnter, reduced }) {
  const hovered = useStore((s) => s.doorHover);
  const warping = useStore((s) => s.warp != null);
  const group = useRef();
  const glow = useRef(0);

  const mat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: portalVertex, fragmentShader: portalFragment,
      uniforms: {
        uTime: { value: 0 },
        uHover: { value: 0 },
        uColor: { value: new THREE.Color(portal) },
        uEdge: { value: new THREE.Color(frame) },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    }),
    [portal, frame]
  );
  // One material for all three frame bars, so they brighten together.
  const frameMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: frame, toneMapped: false, fog: false }),
    [frame]
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const target = hovered || getState().warp === 'out' ? 1 : 0;
    glow.current += (target - glow.current) * (reduced ? 1 : damp(8, dt));
    const g = glow.current;
    if (!reduced) mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uHover.value = g;
    // Idle "breathing" so the door reads as live even before it is hovered.
    const idle = reduced ? 0 : 0.15 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2.0));
    frameMat.color.set(frame).multiplyScalar(1 + idle + g * 1.4);
    if (group.current) group.current.scale.setScalar(1 + g * 0.03);
  });

  const timer = useRef();
  useEffect(() => () => {
    clearTimeout(timer.current);
    setState({ doorHover: false });
  }, []);
  const enter = (e) => {
    e?.stopPropagation?.();
    clearTimeout(timer.current);
    if (!getState().doorHover) setState({ doorHover: true });
    document.body.style.cursor = 'pointer';
  };
  const leave = (e) => {
    e?.stopPropagation?.();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setState({ doorHover: false });
      document.body.style.cursor = '';
    }, 120);
  };
  const walk = (e) => {
    e?.stopPropagation?.();
    if (getState().warp) return;
    document.body.style.cursor = '';
    setState({ doorHover: false });
    onEnter();
  };

  const { w, h } = DOOR;
  const bar = 0.07;
  return (
    <group position={[DOOR.x, DOOR.y, DOOR.z]}>
      <group ref={group}>
        {/* Recessed casing */}
        <mesh position={[0, 0.06, -0.03]}>
          <boxGeometry args={[w + 0.5, h + 0.3, 0.05]} />
          <meshStandardMaterial color="#0c1218" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* Portal sheet */}
        <mesh material={mat}>
          <planeGeometry args={[w, h]} />
        </mesh>
        {/* Glowing frame: two jambs and a lintel */}
        <group>
          <mesh position={[-(w + bar) / 2, 0, 0.01]} material={frameMat}>
            <boxGeometry args={[bar, h + bar, 0.05]} />
          </mesh>
          <mesh position={[(w + bar) / 2, 0, 0.01]} material={frameMat}>
            <boxGeometry args={[bar, h + bar, 0.05]} />
          </mesh>
          <mesh position={[0, (h + bar) / 2, 0.01]} material={frameMat}>
            <boxGeometry args={[w + bar * 2, bar, 0.05]} />
          </mesh>
        </group>
        {/* Light spilling onto the floor in front of the door */}
        <mesh position={[0, -h / 2 + 0.012, 0.6]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[w * 1.3, 1.2]} />
          <meshBasicMaterial color={portal} transparent opacity={hovered ? 0.22 : 0.1} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </mesh>
        {/* Generous, invisible hit area */}
        <mesh position={[0, 0, 0.1]} onPointerOver={enter} onPointerOut={leave} onClick={walk}>
          <planeGeometry args={[w + 0.6, h + 0.5]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <Html position={[0, h / 2 + 0.38, 0]} center zIndexRange={[4, 0]}>
        <div
          className={`beacon-label door-label ${hovered ? 'is-hovered' : ''}`}
          style={{ visibility: warping ? 'hidden' : 'visible' }}
          onPointerEnter={enter}
          onPointerLeave={leave}
          onClick={walk}
          aria-hidden="true"
        >
          <span className="bl-name">{label}</span>
          <span className="bl-hint">{hint}</span>
        </div>
      </Html>
    </group>
  );
}
