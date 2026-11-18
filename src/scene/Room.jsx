import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ledFragment, ledVertex } from './shaders.js';

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

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(120,220,255,0.9)');
  r.addColorStop(0.35, 'rgba(60,170,230,0.28)');
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

export default function Room({ lite, reduced }) {
  const wallTex = useMemo(() => panelTexture({ base: '#1a222c', seam: '#0e141b', cols: 3, rows: 2, repeat: [4, 2] }), []);
  const floorTex = useMemo(() => panelTexture({ base: '#141a22', seam: '#0a0e13', cols: 4, rows: 4, noise: 10, repeat: [6, 6] }), []);
  const glow = useMemo(glowTexture, []);
  const pillars = useMemo(() => {
    const xs = lite ? [-8, 8] : [-9, -5, 5, 9];
    return xs;
  }, [lite]);

  return (
    <group>
      <fog attach="fog" args={['#05080d', 10, 28]} />
      <color attach="background" args={['#05080d']} />

      <ambientLight intensity={0.18} />
      <hemisphereLight args={['#6d8fb3', '#07090d', 0.6]} />
      {/* Soft key light from above and in front */}
      <directionalLight position={[3, 7, 6]} intensity={0.8} color="#fff1dc" />
      {/* The hologram lights the room */}
      <pointLight position={[0, 0.35, 0]} color="#58d0ff" intensity={38} distance={18} decay={1.6} />

      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR_Y, 0]}>
        <planeGeometry args={[SIDE_X * 2, 24]} />
        <meshStandardMaterial map={floorTex} roughness={0.38} metalness={0.35} color="#9fb0c2" />
      </mesh>
      {/* Hologram light pooled on the floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR_Y + 0.01, 0]}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial map={glow} transparent opacity={reduced ? 0.55 : 0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Walls and ceiling */}
      <mesh position={[0, (FLOOR_Y + CEIL_Y) / 2, BACK_Z]}>
        <planeGeometry args={[SIDE_X * 2, CEIL_Y - FLOOR_Y]} />
        <meshLambertMaterial map={wallTex} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * SIDE_X, (FLOOR_Y + CEIL_Y) / 2, 1]} rotation-y={-s * Math.PI / 2}>
          <planeGeometry args={[22, CEIL_Y - FLOOR_Y]} />
          <meshLambertMaterial map={wallTex} />
        </mesh>
      ))}
      <mesh position={[0, CEIL_Y, 1]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[SIDE_X * 2, 22]} />
        <meshLambertMaterial color="#0b0f14" />
      </mesh>
      <mesh position={[0, (FLOOR_Y + CEIL_Y) / 2, 12]} rotation-y={Math.PI}>
        <planeGeometry args={[SIDE_X * 2, CEIL_Y - FLOOR_Y]} />
        <meshLambertMaterial map={wallTex} />
      </mesh>

      {/* Back-wall pillars with recessed light slits for depth */}
      {pillars.map((x) => (
        <group key={x} position={[x, (FLOOR_Y + CEIL_Y) / 2, BACK_Z + 0.35]}>
          <mesh>
            <boxGeometry args={[0.7, CEIL_Y - FLOOR_Y, 0.7]} />
            <meshLambertMaterial color="#121820" />
          </mesh>
          <mesh position={[0.6, 0, -0.3]}>
            <planeGeometry args={[0.06, CEIL_Y - FLOOR_Y - 1.2]} />
            <meshBasicMaterial color="#2c6f8f" toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Ceiling light strips and floor cove lines */}
      {[-4.5, 0, 4.5].map((x) => (
        <mesh key={x} position={[x, CEIL_Y - 0.02, -1]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[0.18, 14]} />
          <meshBasicMaterial color="#cfe9ff" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, FLOOR_Y + 0.05, BACK_Z + 0.02]}>
        <planeGeometry args={[SIDE_X * 2, 0.06]} />
        <meshBasicMaterial color="#3fb6e8" toneMapped={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (SIDE_X - 0.02), FLOOR_Y + 0.05, 1]} rotation-y={-s * Math.PI / 2}>
          <planeGeometry args={[22, 0.06]} />
          <meshBasicMaterial color="#3fb6e8" toneMapped={false} />
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
          <meshBasicMaterial color="#58d0ff" toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.03, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.6, 32]} />
          <meshBasicMaterial color="#123548" />
        </mesh>
      </group>
    </group>
  );
}

export { FLOOR_Y };
