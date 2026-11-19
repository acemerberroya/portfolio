import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ledFragment, ledVertex } from './shaders.js';
import { bakedPlane, roomLights } from './bake.js';
import { damp } from './geo.js';

const FLOOR_Y = -3.2;
const CEIL_Y = 6;
const BACK_Z = -9;
const SIDE_X = 11;

// Procedural textures drawn once on a canvas: no image downloads for the room.
function panelTexture({ w = 512, h = 512, base, seam, cols = 4, rows = 2, noise = 18, repeat = [1, 1] }) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  const img = g.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * noise;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  g.strokeStyle = seam;
  g.lineWidth = 3;
  for (let i = 0; i <= cols; i++) { g.beginPath(); g.moveTo((i * w) / cols, 0); g.lineTo((i * w) / cols, h); g.stroke(); }
  for (let j = 0; j <= rows; j++) { g.beginPath(); g.moveTo(0, (j * h) / rows); g.lineTo(w, (j * h) / rows); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function glowTexture(inner = 'rgba(120,220,255,0.9)', mid = 'rgba(60,170,230,0.28)') {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, inner);
  r.addColorStop(0.35, mid);
  r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// Server racks along the side walls: a nod to cloud and network work.
function Racks({ lite }) {
  const racks = useMemo(() => {
    const out = [];
    const zs = lite ? [-6] : [-7, -4];
    for (const side of [-1, 1]) for (const z of zs) out.push([side * (SIDE_X - 0.75), FLOOR_Y + 2.1, z]);
    return out;
  }, [lite]);

  const ledsGeo = useMemo(() => {
    const pos = [];
    const seed = [];
    const perRack = lite ? 18 : 36;
    racks.forEach(([x, , z]) => {
      for (let i = 0; i < perRack; i++) {
        const row = Math.floor(i / 6);
        const col = i % 6;
        pos.push(x - Math.sign(x) * 0.52, FLOOR_Y + 0.5 + row * (3.4 / (perRack / 6)), z - 0.55 + col * 0.22);
        seed.push(Math.random());
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
    return g;
  }, [racks, lite]);

  const ledMat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: ledVertex, fragmentShader: ledFragment, uniforms: { uTime: { value: 0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }),
    []
  );
  useFrame((s) => { ledMat.uniforms.uTime.value = s.clock.elapsedTime; });

  const rackRef = useRef();
  const m = useMemo(() => new THREE.Matrix4(), []);
  return (
    <>
      <instancedMesh
        ref={(r) => {
          rackRef.current = r;
          if (!r) return;
          racks.forEach((p, i) => r.setMatrixAt(i, m.makeTranslation(...p)));
          r.instanceMatrix.needsUpdate = true;
        }}
        args={[undefined, undefined, racks.length]}
      >
        <boxGeometry args={[1, 4.2, 1.5]} />
        <meshLambertMaterial color="#0c1016" />
      </instancedMesh>
      <points geometry={ledsGeo} material={ledMat} />
    </>
  );
}

// Colours of everything the hologram lights. The main room keeps its cyan;
// the Euthenics room passes a gold theme so the same room reads as a sibling.
export const CYAN_THEME = {
  slit: '#2c6f8f', // light slits in the back-wall pillars
  cove: '#3fb6e8', // floor cove lines
  strip: '#cfe9ff', // ceiling light strips
  light: '#58d0ff',
  glowInner: 'rgba(120,220,255,0.9)',
  glowMid: 'rgba(60,170,230,0.28)',
  ring: '#58d0ff',
  disc: '#123548',
};
export const GOLD_THEME = {
  slit: '#8f5a1e',
  cove: '#e8a03f',
  strip: '#ffe6c2',
  light: '#ffb34d',
  glowInner: 'rgba(255,200,110,0.9)',
  glowMid: 'rgba(230,140,40,0.28)',
  ring: '#ffbf5a',
  disc: '#3a2510',
};

export default function Room({ lite, reduced, theme = CYAN_THEME, children }) {
  const wallTex = useMemo(() => panelTexture({ base: '#1a222c', seam: '#0e141b', cols: 3, rows: 2, repeat: [4, 2] }), []);
  const floorTex = useMemo(() => panelTexture({ base: '#141a22', seam: '#0a0e13', cols: 4, rows: 4, noise: 10, repeat: [6, 6] }), []);
  // Both lightings are prepared up front, so a change of hologram can blend the
  // room from one to the other instead of snapping (warm = 0 cyan, 1 gold).
  const glowCyan = useMemo(() => glowTexture(CYAN_THEME.glowInner, CYAN_THEME.glowMid), []);
  const glowGold = useMemo(() => glowTexture(GOLD_THEME.glowInner, GOLD_THEME.glowMid), []);
  const target = theme === GOLD_THEME ? 1 : 0;
  const warm = useRef(target);
  const lightRef = useRef();
  const ringRef = useRef();
  const discRef = useRef();
  const glowCyanRef = useRef();
  const glowGoldRef = useRef();
  const tmp = useMemo(() => ({ a: new THREE.Color(), b: new THREE.Color() }), []);
  // The background lights (pillar slits, cove lines, ceiling strips) share
  // one material each, so they follow the hologram's colour together.
  const slitMat = useMemo(() => new THREE.MeshBasicMaterial({ color: CYAN_THEME.slit, toneMapped: false }), []);
  const coveMat = useMemo(() => new THREE.MeshBasicMaterial({ color: CYAN_THEME.cove, toneMapped: false }), []);
  const stripMat = useMemo(() => new THREE.MeshBasicMaterial({ color: CYAN_THEME.strip, toneMapped: false }), []);
  // Floor, walls and ceiling with the room's lighting baked into vertex colours.
  const surfaces = useMemo(() => {
    const lights = roomLights(CYAN_THEME.light);
    const lightsGold = roomLights(GOLD_THEME.light);
    const midY = (FLOOR_Y + CEIL_Y) / 2;
    const H = CEIL_Y - FLOOR_Y;
    const list = [
      // The floor was metalness 0.35, so 65% of it is diffuse.
      { key: 'floor', width: SIDE_X * 2, height: 24, segX: 44, segY: 48, position: [0, FLOOR_Y, 0], rotation: [-Math.PI / 2, 0, 0], map: floorTex, color: '#9fb0c2', diffuse: 0.65 },
      { key: 'back', width: SIDE_X * 2, height: H, segX: 44, segY: 18, position: [0, midY, BACK_Z], rotation: [0, 0, 0], map: wallTex },
      { key: 'left', width: 22, height: H, segX: 44, segY: 18, position: [-SIDE_X, midY, 1], rotation: [0, Math.PI / 2, 0], map: wallTex },
      { key: 'right', width: 22, height: H, segX: 44, segY: 18, position: [SIDE_X, midY, 1], rotation: [0, -Math.PI / 2, 0], map: wallTex },
      { key: 'ceiling', width: SIDE_X * 2, height: 22, segX: 22, segY: 22, position: [0, CEIL_Y, 1], rotation: [Math.PI / 2, 0, 0], color: '#0b0f14' },
      { key: 'front', width: SIDE_X * 2, height: H, segX: 22, segY: 9, position: [0, midY, 12], rotation: [0, Math.PI, 0], map: wallTex },
    ];
    return list.map((sf) => {
      const geometry = bakedPlane({ ...sf, lights });
      const cyan = geometry.attributes.color.array.slice();
      const gold = bakedPlane({ ...sf, lights: lightsGold }).attributes.color.array;
      return { ...sf, color: sf.color || '#ffffff', geometry, cyan, gold };
    });
  }, [floorTex, wallTex]);

  const apply = (w) => {
    surfaces.forEach((sf) => {
      const out = sf.geometry.attributes.color.array;
      for (let i = 0; i < out.length; i++) out[i] = sf.cyan[i] + (sf.gold[i] - sf.cyan[i]) * w;
      sf.geometry.attributes.color.needsUpdate = true;
    });
    const mixC = (a, b) => tmp.a.set(a).lerp(tmp.b.set(b), w);
    if (lightRef.current) lightRef.current.color.copy(mixC(CYAN_THEME.light, GOLD_THEME.light));
    if (ringRef.current) ringRef.current.color.copy(mixC(CYAN_THEME.ring, GOLD_THEME.ring));
    if (discRef.current) discRef.current.color.copy(mixC(CYAN_THEME.disc, GOLD_THEME.disc));
    slitMat.color.copy(mixC(CYAN_THEME.slit, GOLD_THEME.slit));
    coveMat.color.copy(mixC(CYAN_THEME.cove, GOLD_THEME.cove));
    stripMat.color.copy(mixC(CYAN_THEME.strip, GOLD_THEME.strip));
    const base = reduced ? 0.55 : 0.7;
    if (glowCyanRef.current) glowCyanRef.current.opacity = base * (1 - w);
    if (glowGoldRef.current) glowGoldRef.current.opacity = base * w;
  };
  const applied = useRef(-1);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const w = warm.current;
    const next = reduced ? target : w + (target - w) * damp(2.6, dt);
    warm.current = Math.abs(target - next) < 0.002 ? target : next;
    if (warm.current !== applied.current) {
      applied.current = warm.current;
      apply(warm.current);
    }
  });
  const pillars = useMemo(() => {
    const xs = lite ? [-8, 8] : [-9, -5, 5, 9];
    return xs;
  }, [lite]);

  return (
    <group>
      <fog attach="fog" args={['#05080d', 10, 28]} />
      <color attach="background" args={['#05080d']} />

      {/* Live lights: still used by the small objects (racks, pillars, pedestal). */}
      <ambientLight intensity={0.18} />
      <hemisphereLight args={['#6d8fb3', '#07090d', 0.6]} />
      {/* Soft key light from above and in front */}
      <directionalLight position={[3, 7, 6]} intensity={0.8} color="#fff1dc" />
      {/* The hologram lights the room */}
      <pointLight ref={lightRef} position={[0, 0.35, 0]} color={CYAN_THEME.light} intensity={38} distance={18} decay={1.6} />

      {/* Floor, walls and ceiling: the same lighting, baked once (see bake.js). */}
      {surfaces.map((sf) => (
        <mesh key={sf.key} geometry={sf.geometry} position={sf.position} rotation={sf.rotation}>
          <meshBasicMaterial map={sf.map} color={sf.color} vertexColors />
        </mesh>
      ))}
      {/* Hologram light pooled on the floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR_Y + 0.01, 0]}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial ref={glowCyanRef} map={glowCyan} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR_Y + 0.011, 0]}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial ref={glowGoldRef} map={glowGold} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Back-wall pillars with recessed light slits for depth */}
      {pillars.map((x) => (
        <group key={x} position={[x, (FLOOR_Y + CEIL_Y) / 2, BACK_Z + 0.35]}>
          <mesh>
            <boxGeometry args={[0.7, CEIL_Y - FLOOR_Y, 0.7]} />
            <meshLambertMaterial color="#121820" />
          </mesh>
          <mesh position={[0.6, 0, -0.3]} material={slitMat}>
            <planeGeometry args={[0.06, CEIL_Y - FLOOR_Y - 1.2]} />
          </mesh>
        </group>
      ))}

      {/* Ceiling light strips and floor cove lines */}
      {[-4.5, 0, 4.5].map((x) => (
        <mesh key={x} position={[x, CEIL_Y - 0.02, -1]} rotation-x={Math.PI / 2} material={stripMat}>
          <planeGeometry args={[0.18, 14]} />
        </mesh>
      ))}
      <mesh position={[0, FLOOR_Y + 0.05, BACK_Z + 0.02]} material={coveMat}>
        <planeGeometry args={[SIDE_X * 2, 0.06]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (SIDE_X - 0.02), FLOOR_Y + 0.05, 1]} rotation-y={-s * Math.PI / 2} material={coveMat}>
          <planeGeometry args={[22, 0.06]} />
        </mesh>
      ))}

      <Racks lite={lite} />

      {/* Projector pedestal */}
      <group position={[0, FLOOR_Y, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[1.15, 1.45, 1, 32]} />
          <meshStandardMaterial color="#10161d" roughness={0.35} metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.02, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.6, 0.68, 64]} />
          <meshBasicMaterial ref={ringRef} color={CYAN_THEME.ring} toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.03, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.6, 32]} />
          <meshBasicMaterial ref={discRef} color={CYAN_THEME.disc} />
        </mesh>
      </group>
      {children}
    </group>
  );
}

export { FLOOR_Y, BACK_Z };
