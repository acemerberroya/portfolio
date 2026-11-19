import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import landDots from './landDots.json';
import { HOME, HOME_PIN, SECTIONS } from '../sections.js';
import { getState, setState, useStore } from '../store.js';
import { AMBER, CYAN, GLOBE_R, GLOBE_Y, latLngToVec3 } from './geo.js';
import { dotsFragment, dotsVertex, fresnelFragment, fresnelVertex } from './shaders.js';
import { useHub } from './hub.js';

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

function LandDots({ lite, uniforms }) {
  const geo = useMemo(() => {
    const step = lite ? 2 : 1;
    const pos = [];
    const v = new THREE.Vector3();
    for (let i = 0; i < landDots.length; i += 2 * step) {
      latLngToVec3(landDots[i] / 10, landDots[i + 1] / 10, GLOBE_R * 1.002, v);
      pos.push(v.x, v.y, v.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [lite]);
  const mat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: dotsVertex, fragmentShader: dotsFragment, uniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }),
    [uniforms]
  );
  return <points geometry={geo} material={mat} />;
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

export default function Globe({ lite, reduced, go }) {
  const rings = useRef();
  const { gl } = useThree();

  const uniforms = useMemo(
    () => ({
      uSize: { value: (lite ? 34 : 30) * Math.min(gl.getPixelRatio(), 2) },
      uScan: { value: 9 },
      uCenterY: { value: GLOBE_Y },
      uColor: { value: new THREE.Color(CYAN) },
      uWarm: { value: new THREE.Color(AMBER) },
      uHome: { value: latLngToVec3(HOME_PIN.lat, HOME_PIN.lng, 1) },
    }),
    [lite, gl]
  );

  // Facing, scan sweep, spin and drag are shared with the Euthenics hologram.
  const { spin, st, bind } = useHub({ sections: SECTIONS, homePin: HOME_PIN, homeId: HOME.id, reduced, uniforms });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (rings.current && !reduced) {
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
          <sphereGeometry args={[GLOBE_R * 1.01, 24, 24]} />
          <meshBasicMaterial color="#0a3a57" transparent opacity={0.16} depthWrite={false} />
        </mesh>
        <LandDots lite={lite} uniforms={uniforms} />
        <Graticule />
        {SECTIONS.map((sec) => <Beacon key={sec.id} sec={sec} st={st} go={go} />)}
      </group>
      <mesh material={shell}>
        <sphereGeometry args={[GLOBE_R * 1.015, 48, 48]} />
      </mesh>
      <mesh material={halo}>
        <sphereGeometry args={[GLOBE_R * 1.2, 32, 32]} />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2.2, 0.3, 0]}>
          <torusGeometry args={[GLOBE_R * 1.18, 0.005, 6, 160]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.45} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 1.75, -0.4, 0]}>
          <torusGeometry args={[GLOBE_R * 1.3, 0.004, 6, 160]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
