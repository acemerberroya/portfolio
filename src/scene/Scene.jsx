import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import Room, { GOLD_THEME } from './Room.jsx';
import Globe from './Globe.jsx';
import Hologram, { GOLD } from './Hologram.jsx';
import Door, { DOOR } from './Door.jsx';
import Satellites from './Satellites.jsx';
import { CYAN, GLOBE_Y, damp } from './geo.js';
import { beamFragment, beamVertex } from './shaders.js';
import { getState, subscribe, useStore } from '../store.js';
import { ROOMS, isRoomHome } from '../rooms.js';

const CAM = { x: 0, y: 0.9, z: 7.4, fov: 42 };
const DOOR_V = new THREE.Vector3(DOOR.x, DOOR.y, DOOR.z);

// Keeps the globe centred in whatever the panel leaves visible, and shrinks the
// hub to fit narrow screens. Adds a little pointer parallax when motion is allowed.
function Rig({ hub, reduced }) {
  const { camera, size } = useThree();
  const cur = useRef({ x: 0, y: 0, s: 1, px: 0, py: 0, first: true, w: 0, warp: null });
  const look = useMemo(() => new THREE.Vector3(), []);
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
    // Fit the globe (about 4.4 units tall with its beacons) into the free space;
    // with a section open, leave room for its orbiting satellites too.
    const wide = isRoomHome(getState().section) ? 5 : 6.6;
    const ts = THREE.MathUtils.clamp(Math.min(aw / (wide * ppu), ah / (4.6 * ppu)), 0.4, 1);
    c.s += (ts - c.s) * k;
    if (hub.current) hub.current.scale.setScalar(c.s);

    // Gentle pointer parallax, held still while a pin is hovered so it stays under the cursor.
    if (!reduced && !getState().pinHover) {
      c.px += (state.pointer.x * 0.35 - c.px) * damp(2, dt);
      c.py += (state.pointer.y * 0.18 - c.py) * damp(2, dt);
    }

    // Door transition: on 'out' the camera dollies toward the door; when the
    // new room appears ('in') it starts further back and glides to rest.
    const { warp } = getState();
    if (warp !== c.warp) {
      if (warp === 'in' && !reduced) c.w = -0.9;
      c.warp = warp;
    }
    const wt = warp === 'out' && !reduced ? 1 : 0;
    c.w += (wt - c.w) * (reduced ? 1 : damp(warp === 'out' ? 2.8 : 2.2, dt));
    const fwd = Math.max(c.w, 0);
    const dz = fwd > 0 ? fwd * fwd * 6 : c.w * 2.4;
    camera.position.set(CAM.x + c.px + DOOR.x * fwd * 0.35, CAM.y + c.py - fwd * 0.5, CAM.z - dz);
    look.set(0, 0.15, 0).lerp(DOOR_V, fwd * 0.75);
    camera.lookAt(look);
  });
  return null;
}

function Beam({ reduced, lite, color = CYAN }) {
  const mat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: beamVertex, fragmentShader: beamFragment,
      uniforms: { uColor: { value: new THREE.Color(color) }, uTime: { value: 0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    }),
    [color]
  );
  useFrame((s) => { if (!reduced) mat.uniforms.uTime.value = s.clock.elapsedTime; });
  const bottom = -2.17;
  const height = GLOBE_Y - bottom;
  return (
    <mesh position={[0, bottom + height / 2, 0]} material={mat}>
      <cylinderGeometry args={[1.5, 0.55, height, 32, 1, true]} />
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

export default function Scene({ env, go, switchRoom, onReady }) {
  const lite = env.tier === 'lite';
  const { reduced } = env;
  const hub = useRef();
  const room = useStore((s) => s.room);
  const eu = ROOMS.euthenics;
  // Start at a moderate resolution; step up only when frames come in fast,
  // and down to 1 as soon as they don't.
  const [dpr, setDpr] = useState(lite ? 1 : 1.25);

  return (
    <Canvas
      className="scene-canvas"
      dpr={[1, dpr]}
      frameloop={reduced ? 'demand' : 'always'}
      // MSAA only where it shows: on high-DPI screens the extra pixels already
      // smooth edges, and MSAA there costs a lot of GPU time for no visible gain.
      gl={{ antialias: !lite && (window.devicePixelRatio || 1) < 1.5, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      camera={{ fov: CAM.fov, position: [CAM.x, CAM.y, CAM.z], near: 0.1, far: 60 }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        requestAnimationFrame(() => requestAnimationFrame(onReady));
      }}
    >
      <PerformanceMonitor
        flipflops={3}
        onIncline={() => setDpr(lite ? 1 : 1.5)}
        onDecline={() => setDpr(1)}
        onFallback={() => setDpr(1)}
      />
      <Invalidator reduced={reduced} />
      <Rig hub={hub} reduced={reduced} />
      {room === 'euthenics' ? (
        // The Euthenics room: same room, gold-lit, with the Jarvis hologram as its hub.
        <>
          <Room lite={lite} reduced={reduced} theme={GOLD_THEME} />
          <Door
            label="Main room"
            hint="Back to the holo globe"
            frame={GOLD}
            portal={CYAN}
            reduced={reduced}
            onEnter={() => switchRoom('main')}
          />
          <group ref={hub} position={[0, GLOBE_Y, 0]}>
            <Hologram lite={lite} reduced={reduced} go={go} />
            <Satellites reduced={reduced} itemsFor={eu.satellitesFor} palette={eu.palette} />
          </group>
          <Beam reduced={reduced} lite={lite} color={GOLD} />
        </>
      ) : (
        <>
          <Room lite={lite} reduced={reduced} />
          <Door
            label="Euthenics"
            hint="Enter the HTE evaluation room"
            frame="#3fb6e8"
            portal={GOLD}
            reduced={reduced}
            onEnter={() => switchRoom('euthenics')}
          />
          <group ref={hub} position={[0, GLOBE_Y, 0]}>
            <Globe lite={lite} reduced={reduced} go={go} />
            <Satellites reduced={reduced} />
          </group>
          <Beam reduced={reduced} lite={lite} />
        </>
      )}
    </Canvas>
  );
}
