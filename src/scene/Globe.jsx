import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { HOME, HOME_PIN, SECTIONS } from '../sections.js';
import { getState, setState, useStore } from '../store.js';
import { AMBER, CYAN, GLOBE_R, GLOBE_Y, latLngToVec3 } from './geo.js';
import { fresnelFragment, fresnelVertex, surgeFragment, surgeVertex } from './shaders.js';
import { morphRamp, useHub } from './hub.js';
import { glowTexture } from './Room.jsx';
import { buildTrails, useTrailMaterial } from './trails.js';

const UP = new THREE.Vector3(0, 1, 0);
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpC = new THREE.Vector3();

export function useFresnel(color, power, intensity, invert = 0) {
  return useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: fresnelVertex,
      fragmentShader: fresnelFragment,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uPower: { value: power },
        uIntensity: { value: intensity },
        uInvert: { value: invert },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: invert ? THREE.BackSide : THREE.FrontSide,
    }),
    [color, power, intensity, invert]
  );
}

// Knowledge surging inside the globe: thousands of points streaming from the
// core to the shell in outward waves (positions computed on the GPU).
function DataSurge({ lite, uniforms }) {
  const geo = useMemo(() => {
    const n = lite ? 1800 : 4200;
    const dir = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    const speed = new Float32Array(n);
    const pos = new Float32Array(n * 3); // unused by the shader; keeps three.js happy
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      // Bias directions into a handful of streams so the flow reads as currents.
      const stream = i % 9;
      const base = latLngToVec3(((stream * 47) % 140) - 70, stream * 40, 1, new THREE.Vector3());
      v.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      v.lerp(base, i % 3 === 0 ? 0 : 0.55).normalize();
      dir.set([v.x, v.y, v.z], i * 3);
      seed[i] = Math.random();
      speed[i] = 0.08 + Math.random() * 0.14;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aDir', new THREE.Float32BufferAttribute(dir, 3));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
    g.setAttribute('aSpeed', new THREE.Float32BufferAttribute(speed, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), GLOBE_R * 1.1);
    return g;
  }, [lite]);
  const mat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: surgeVertex, fragmentShader: surgeFragment, uniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }),
    [uniforms]
  );
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

function Graticule() {
  const geo = useMemo(() => {
    const pts = [];
    const v = new THREE.Vector3();
    const w = new THREE.Vector3();
    const R = GLOBE_R * 0.998;
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lng = -180; lng < 180; lng += 6) {
        latLngToVec3(lat, lng, R, v); latLngToVec3(lat, lng + 6, R, w);
        pts.push(v.x, v.y, v.z, w.x, w.y, w.z);
      }
    }
    for (let lng = -180; lng < 180; lng += 30) {
      for (let lat = -84; lat < 84; lat += 6) {
        latLngToVec3(lat, lng, R, v); latLngToVec3(lat + 6, lng, R, w);
        pts.push(v.x, v.y, v.z, w.x, w.y, w.z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={CYAN} transparent opacity={0.11} depthWrite={false} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

// A section's pin on a hub. Shared by the globe and the Euthenics hologram;
// `palette` colours it, `homePin`/`homeId` say which pin is "home".
const MAIN_PALETTE = { base: CYAN, active: AMBER };
export function Beacon({ sec, st, go, homePin = HOME_PIN, homeId = HOME.id, palette = MAIN_PALETTE }) {
  const { camera } = useThree();
  const group = useRef();
  const ring = useRef();
  const label = useRef();
  const tip = useRef();
  const last = useRef(-1);
  const active = useStore((s) => s.section === sec.id);
  const hovered = useStore((s) => s.hoverSection === sec.id);
  const home = useStore((s) => s.section === homeId);
  const isHome = sec.lat === homePin.lat && sec.lng === homePin.lng;
  const color = active || isHome ? palette.active : palette.base;

  const { pos, quat } = useMemo(() => {
    const p = latLngToVec3(sec.lat, sec.lng, GLOBE_R);
    return { pos: p, quat: new THREE.Quaternion().setFromUnitVectors(UP, p.clone().normalize()) };
  }, [sec]);

  useFrame((state) => {
    if (!group.current) return;
    group.current.getWorldPosition(tmpA);
    group.current.parent.getWorldPosition(tmpB);
    const normal = tmpC.copy(tmpA).sub(tmpB).normalize();
    const toCam = tmpB.copy(camera.position).sub(tmpA).normalize();
    const facing = normal.dot(toCam);
    const visible = facing > 0.12;
    if (label.current) {
      const op = visible ? Math.round(Math.min(1, (facing - 0.12) * 4) * 10) / 10 : 0;
      if (op !== last.current) {
        last.current = op;
        label.current.style.opacity = String(op);
        label.current.style.visibility = op === 0 ? 'hidden' : 'visible';
        label.current.style.pointerEvents = visible ? 'auto' : 'none';
      }
    }
    const t = state.clock.elapsedTime;
    if (ring.current) {
      const p = st.current.reduced ? 1 : 1 + ((t * 0.8 + sec.lat) % 1) * 1.6;
      ring.current.scale.setScalar(p);
      ring.current.material.opacity = st.current.reduced ? 0.6 : 0.8 * (1 - ((t * 0.8 + sec.lat) % 1));
    }
    if (tip.current) tip.current.scale.setScalar(hovered || active ? 1.5 : 1);
  });

  // The pin's 3D hit area and its label share one hover state. Leaving waits a
  // moment, so moving between them (or a tiny jitter) doesn't flicker.
  const timer = useRef();
  const clicked = useRef(false); // after a click, let the globe turn even though the cursor is still here
  useEffect(() => () => clearTimeout(timer.current), []);
  const enter = (e) => {
    e?.stopPropagation?.();
    clearTimeout(timer.current);
    const s = getState();
    const pin = clicked.current ? null : sec.id;
    if (s.hoverSection !== sec.id || s.pinHover !== pin) setState({ hoverSection: sec.id, pinHover: pin });
    document.body.style.cursor = 'pointer';
  };
  const leave = (e) => {
    e?.stopPropagation?.();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      clicked.current = false;
      setState((s) => (s.hoverSection === sec.id ? { hoverSection: null, pinHover: null } : {}));
      if (!st.current.drag) document.body.style.cursor = '';
    }, 140);
  };
  const pick = (e) => {
    e?.stopPropagation?.();
    if (st.current.moved > 6) return;
    clicked.current = true;
    setState({ pinHover: null });
    go(sec.id, null, { fromKeyboard: false });
  };

  return (
    <group ref={group} position={pos} quaternion={quat}>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.34, 6]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={tip} position={[0, 0.36, 0]}>
        <sphereGeometry args={[0.05, 14, 14]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={ring} position={[0, 0.01, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.06, 0.085, 32]} />
        <meshBasicMaterial color={color} transparent depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.3, 0]} onPointerOver={enter} onPointerOut={leave} onClick={pick}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html position={[0, 0.52, 0]} center zIndexRange={[4, 0]}>
        <div
          ref={label}
          className={`beacon-label ${active ? 'is-active' : ''} ${hovered ? 'is-hovered' : ''} ${isHome ? 'is-home' : ''}`}
          onPointerEnter={enter}
          onPointerLeave={leave}
          onClick={pick}
          aria-hidden="true"
        >
          <span className="bl-name">{sec.label}</span>
          <span className="bl-hint">{sec.hint}</span>
          {isHome && home && <span className="bl-place">Based in {homePin.label}</span>}
        </div>
      </Html>
    </group>
  );
}

export default function Globe({ lite, reduced, go, switchRoom }) {
  const rings = useRef();
  const { gl } = useThree();

  const uniforms = useMemo(
    () => ({
      uSize: { value: (lite ? 26 : 24) * Math.min(gl.getPixelRatio(), 2) },
      uRadius: { value: GLOBE_R * 0.98 },
      uScan: { value: 9 },
      uCenterY: { value: GLOBE_Y },
      uColor: { value: new THREE.Color(CYAN) },
      uWarm: { value: new THREE.Color(AMBER) },
      uHome: { value: latLngToVec3(HOME_PIN.lat, HOME_PIN.lng, 1) },
      // Light trails (shared with the Euthenics core): flowing data around and inside the globe.
      uTime: { value: 0 },
      uReveal: { value: 1 },
      uFlicker: { value: 1 },
      uHot: { value: new THREE.Color('#e6fbff') },
      uBase: { value: 0.22 },
    }),
    [lite, gl]
  );

  // Facing, scan sweep, spin and drag are shared with the Euthenics hologram.
  const { spin, st, bind, time } = useHub({ sections: SECTIONS, homePin: HOME_PIN, homeId: HOME.id, reduced, uniforms });
  const reveal = useRef(1);
  const morphing = useStore((s) => s.morph != null);

  // A thin shell of data trails hugging the surface (turns with the map) and a
  // looser swirl inside it (turns on its own), around a pulsing energy core.
  const shellTrails = useMemo(
    () => buildTrails({
      R: GLOBE_R, seed: 42, arcs: lite ? 40 : 80, arcDensity: lite ? 34 : 44,
      rMin: 1.0, rSpan: 0.08, lenMin: 0.06, lenSpan: 0.3, ticks: lite ? 60 : 120,
    }),
    [lite]
  );
  const innerTrails = useMemo(
    () => buildTrails({
      R: GLOBE_R, seed: 7, arcs: lite ? 30 : 60, arcDensity: lite ? 30 : 40,
      rMin: 0.18, rSpan: 0.55, spirals: 2, spiralSegs: lite ? 80 : 120, loose: lite ? 120 : 260,
    }),
    [lite]
  );
  const trailMat = useTrailMaterial(uniforms);
  const glow = useMemo(() => glowTexture(), []);
  const inner = useRef();
  const core = useRef();
  const glowMat = useRef();

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = time.current;
    if (!reduced) uniforms.uTime.value = t;
    // After a transformation the trails switch back on strand by strand.
    if (getState().morph?.phase === 'burst') reveal.current = 0;
    else if (reveal.current < 1) reveal.current = reduced ? 1 : Math.min(1, reveal.current + dt / 1.2);
    uniforms.uReveal.value = reveal.current;
    const ramp = morphRamp();
    // Every navigation sends a flare through the core and trails (rides the scan sweep).
    const sc = st.current.scan;
    const flare = reduced || sc >= 1 ? 0 : Math.sin(sc * Math.PI);
    uniforms.uFlicker.value = (1 + flare * 1.2) * (1 + ramp * 1.5);
    if (glowMat.current) glowMat.current.opacity = 0.35 + flare * 0.45;
    if (core.current) core.current.scale.setScalar((reduced ? 1 : 1 + 0.1 * Math.sin(t * 2.4)) * (1 + flare * 0.7));
    if (reduced) return;
    if (inner.current) inner.current.rotation.y -= dt * 0.25;
    if (rings.current) {
      rings.current.children[0].rotation.z += dt * 0.15;
      rings.current.children[1].rotation.z -= dt * 0.1;
    }
  });

  const shell = useFresnel(CYAN, 2.2, 1.15);
  const halo = useFresnel('#2aa9e0', 3.5, 0.55, 1);

  return (
    <group>
      <group ref={spin}>
        <mesh {...bind}>
          <sphereGeometry args={[GLOBE_R * 1.01, 20, 14]} />
          <meshBasicMaterial color="#0a3a57" transparent opacity={0.16} depthWrite={false} />
        </mesh>
        <Graticule />
        <lineSegments geometry={shellTrails.lines} material={trailMat} />
        {SECTIONS.map((sec) => <Beacon key={sec.id} sec={sec} st={st} go={go} />)}
      </group>
      {/* The core's button: transforms this hologram into the Euthenics one */}
      {!morphing && switchRoom && (
        <Html position={[0, -0.5, 0]} center zIndexRange={[5, 0]}>
          <div
            className="beacon-label core-button core-to-euthenics"
            onClick={(e) => { e.stopPropagation(); switchRoom('euthenics'); }}
            onPointerEnter={() => { document.body.style.cursor = 'pointer'; }}
            onPointerLeave={() => { document.body.style.cursor = ''; }}
            aria-hidden="true"
          >
            <span className="bl-name">Euthenics</span>
            <span className="bl-hint">Transform the hologram</span>
          </div>
        </Html>
      )}

      {/* Data surging from the core, the inner swirl, and the energy core */}
      <DataSurge lite={lite} uniforms={uniforms} />
      <group ref={inner}>
        <lineSegments geometry={innerTrails.lines} material={trailMat} />
      </group>
      <sprite scale={[GLOBE_R * 1.1, GLOBE_R * 1.1, 1]}>
        <spriteMaterial ref={glowMat} map={glow} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <mesh ref={core}>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshBasicMaterial color="#e6fbff" toneMapped={false} />
      </mesh>

      <mesh material={shell}>
        <sphereGeometry args={[GLOBE_R * 1.015, 32, 24]} />
      </mesh>
      <mesh material={halo}>
        <sphereGeometry args={[GLOBE_R * 1.2, 24, 18]} />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2.2, 0.3, 0]}>
          <torusGeometry args={[GLOBE_R * 1.18, 0.005, 4, 120]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.45} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 1.75, -0.4, 0]}>
          <torusGeometry args={[GLOBE_R * 1.3, 0.004, 4, 120]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
