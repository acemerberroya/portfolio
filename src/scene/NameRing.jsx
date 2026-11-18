import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { profile } from '../data/profile.js';
import { getState } from '../store.js';
import { GLOBE_R, damp } from './geo.js';

const RADIUS = GLOBE_R * 1.9;
const SIZE = 0.5;
const DEPTH = 0.15;
const SPACING = 0.05;
const wp = new THREE.Vector3();
const cp = new THREE.Vector3();

// The name orbits the globe as extruded gold letters, Universal-intro style.
// Letters behind the globe fade so the front of the name always reads clearly.
export default function NameRing({ lite, reduced }) {
  const font = useLoader(FontLoader, '/fonts/name-optimer-bold.json');
  const group = useRef();
  const spinner = useRef();
  const st = useRef({ vis: 1 });

  const letters = useMemo(() => {
    const text = profile.name.toUpperCase();
    const scale = SIZE / font.data.resolution;
    const out = [];
    let cursor = 0;
    for (const ch of text) {
      const glyph = font.data.glyphs[ch];
      const adv = (glyph ? glyph.ha : font.data.resolution * 0.3) * scale;
      if (ch !== ' ' && glyph) {
        const geo = new TextGeometry(ch, {
          font,
          size: SIZE,
          depth: DEPTH,
          curveSegments: lite ? 3 : 6,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.016,
          bevelSegments: lite ? 1 : 3,
        });
        geo.center();
        geo.computeVertexNormals();
        out.push({ ch, geo, mid: cursor + adv / 2 });
      }
      cursor += adv + SPACING;
    }
    const total = cursor - SPACING;
    return out.map((l) => ({
      ...l,
      angle: (l.mid - total / 2) / RADIUS,
      mat: new THREE.MeshStandardMaterial({
        color: '#f1c56e',
        metalness: lite ? 0.45 : 0.95,
        roughness: lite ? 0.42 : 0.24,
        emissive: '#5a3a08',
        emissiveIntensity: lite ? 0.55 : 0.25,
        envMapIntensity: 2.6,
        transparent: true,
      }),
    }));
  }, [font, lite]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = st.current;
    const show = getState().section === 'top' ? 1 : 0;
    s.vis += (show - s.vis) * (reduced ? 1 : damp(4, dt));
    if (!group.current) return;
    group.current.visible = s.vis > 0.01;
    group.current.scale.setScalar(0.6 + 0.4 * s.vis);
    if (!reduced && spinner.current) spinner.current.rotation.y -= dt * 0.2;
    group.current.getWorldPosition(cp);
    for (const l of letters) {
      if (!l.mesh) continue;
      l.mesh.getWorldPosition(wp);
      const front = THREE.MathUtils.smoothstep(wp.z - cp.z, -1.6, 1.2);
      l.mat.opacity = s.vis * (0.22 + 0.78 * front);
      l.mat.depthWrite = front > 0.5;
    }
  });

  return (
    <group ref={group} rotation={[0.17, 0, 0.06]}>
      <group ref={spinner}>
        {letters.map((l, i) => (
          <mesh
            key={i}
            ref={(m) => { l.mesh = m; }}
            geometry={l.geo}
            material={l.mat}
            position={[RADIUS * Math.sin(l.angle), 0, RADIUS * Math.cos(l.angle)]}
            rotation-y={l.angle}
          />
        ))}
      </group>
    </group>
  );
}
