import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import Room from './Room.jsx';
import Globe from './Globe.jsx';
import Satellites from './Satellites.jsx';
import NameRing from './NameRing.jsx';
import { CYAN, GLOBE_Y, damp } from './geo.js';
import { beamFragment, beamVertex } from './shaders.js';
import { getState, subscribe } from '../store.js';

const CAM = { x: 0, y: 0.9, z: 7.4, fov: 42 };

// Keeps the globe centred in whatever the panel leaves visible, and shrinks the
// hub to fit narrow screens. Adds a little pointer parallax when motion is allowed.
function Rig({ hub, reduced }) {
  const { camera, size } = useThree();
  const cur = useRef({ x: 0, y: 0, s: 1, px: 0, py: 0, first: true });
  const header = useRef(64);
  useEffect(() => {
    header.current = document.querySelector('.site-header')?.offsetHeight || 64;
  }, [size.width, size.height]);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const c = cur.current;
    const { inset } = getState();
    const w = size.width;
    const h = size.height;
    const k = reduced || c.first ? 1 : damp(3, dt);
    c.first = false;
    const tx = inset.x / 2;
    const ty = inset.y / 2 - header.current / 2;
    c.x += (tx - c.x) * k;
    c.y += (ty - c.y) * k;
    camera.setViewOffset(w, h, c.x, c.y, w, h);

    const ppu = h / (2 * CAM.z * Math.tan(THREE.MathUtils.degToRad(CAM.fov / 2)));
    const aw = w - Math.abs(inset.x);
    const ah = h - inset.y - header.current;
    const ts = THREE.MathUtils.clamp(Math.min(aw / (6.8 * ppu), ah / (4.2 * ppu)), 0.36, 1);
    c.s += (ts - c.s) * k;
    if (hub.current) hub.current.scale.setScalar(c.s);

    if (!reduced) {
      c.px += (state.pointer.x * 0.35 - c.px) * damp(2, dt);
      c.py += (state.pointer.y * 0.18 - c.py) * damp(2, dt);
    }
    camera.position.set(CAM.x + c.px, CAM.y + c.py, CAM.z);
    camera.lookAt(0, 0.15, 0);
  });
  return null;
}

function Beam({ reduced, lite }) {
  const mat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: beamVertex, fragmentShader: beamFragment,
      uniforms: { uColor: { value: new THREE.Color(CYAN) }, uTime: { value: 0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    }),
    []
  );
  useFrame((s) => { if (!reduced) mat.uniforms.uTime.value = s.clock.elapsedTime; });
  const bottom = -2.17;
  const height = GLOBE_Y - bottom;
  return (
    <mesh position={[0, bottom + height / 2, 0]} material={mat}>
      <cylinderGeometry args={[1.2, 0.55, height, lite ? 32 : 64, 1, true]} />
    </mesh>
  );
}

// With reduced motion the canvas only redraws when something changes.
function Invalidator({ reduced }) {
  const { invalidate } = useThree();
  useEffect(() => {
    if (!reduced) return undefined;
    return subscribe(() => { invalidate(); requestAnimationFrame(() => invalidate()); });
  }, [reduced, invalidate]);
  return null;
}

export default function Scene({ env, go, onReady }) {
  const lite = env.tier === 'lite';
  const { reduced } = env;
  const hub = useRef();
  const [dpr, setDpr] = useState(lite ? 1.25 : 1.75);

  return (
    <Canvas
      className="scene-canvas"
      dpr={[1, dpr]}
      frameloop={reduced ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: false, stencil: false, powerPreference: lite ? 'default' : 'high-performance' }}
      camera={{ fov: CAM.fov, position: [CAM.x, CAM.y, CAM.z], near: 0.1, far: 60 }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.environmentIntensity = 0.35;
        requestAnimationFrame(() => requestAnimationFrame(onReady));
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(lite ? 1.25 : 1.75)} />
      <Invalidator reduced={reduced} />
      <Rig hub={hub} reduced={reduced} />
      <Room lite={lite} reduced={reduced} />
      <group ref={hub} position={[0, GLOBE_Y, 0]}>
        <Globe lite={lite} reduced={reduced} go={go} />
        <Satellites reduced={reduced} />
        <Suspense fallback={null}>
          <NameRing lite={lite} reduced={reduced} />
        </Suspense>
      </group>
      <Beam reduced={reduced} lite={lite} />
      {!lite && (
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={3} color="#fff3dc" position={[0, 5, 3]} scale={[10, 2, 1]} rotation-x={Math.PI / 2} />
          <Lightformer form="rect" intensity={2} color="#7fdcff" position={[-5, 1, 2]} scale={[2, 6, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={1.5} color="#ffd9a0" position={[5, 0, 2]} scale={[2, 6, 1]} rotation-y={-Math.PI / 2} />
          <Lightformer form="ring" intensity={2} color="#5fd8ff" position={[0, 0, -4]} scale={3} />
        </Environment>
      )}
    </Canvas>
  );
}
