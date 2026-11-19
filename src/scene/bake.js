import * as THREE from 'three';

// The room's lights never move, so their effect on the big flat surfaces
// (floor, walls, ceiling) is worked out once, per vertex, when the room loads,
// using the same diffuse maths three.js runs per pixel for Lambert surfaces.
// Those surfaces then draw with an unlit material, which removes most of the
// frame's cost on laptop GPUs. Small objects (racks, pillars, pedestal) still
// use the real lights.

// The room's lights, shared by the live light components and the bake.
export function roomLights(pointColor) {
  return {
    ambient: { color: new THREE.Color('#ffffff'), intensity: 0.18 },
    hemi: { sky: new THREE.Color('#6d8fb3'), ground: new THREE.Color('#07090d'), intensity: 0.6 },
    dir: { position: new THREE.Vector3(3, 7, 6), color: new THREE.Color('#fff1dc'), intensity: 0.8 },
    point: { position: new THREE.Vector3(0, 0.35, 0), color: new THREE.Color(pointColor), intensity: 38, distance: 18, decay: 1.6 },
  };
}

const UP = new THREE.Vector3(0, 1, 0);
const p = new THREE.Vector3();
const n = new THREE.Vector3();
const l = new THREE.Vector3();
const c = new THREE.Color();
const acc = new THREE.Color();

// A plane subdivided enough for smooth light falloff, with baked light as
// vertex colours. `position`/`rotation` must match the mesh it goes on.
export function bakedPlane({ width, height, segX, segY, position, rotation = [0, 0, 0], lights, diffuse = 1 }) {
  const g = new THREE.PlaneGeometry(width, height, segX, segY);
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
    new THREE.Vector3(1, 1, 1)
  );
  const nm = new THREE.Matrix3().getNormalMatrix(m);
  const pos = g.attributes.position;
  const nor = g.attributes.normal;
  const out = new Float32Array(pos.count * 3);
  const dirL = lights.dir.position.clone().normalize();
  const { point } = lights;

  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).applyMatrix4(m);
    n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
    acc.copy(lights.ambient.color).multiplyScalar(lights.ambient.intensity);
    // Hemisphere
    const w = 0.5 * n.dot(UP) + 0.5;
    c.copy(lights.hemi.ground).lerp(lights.hemi.sky, w).multiplyScalar(lights.hemi.intensity);
    acc.add(c);
    // Directional
    const dd = Math.max(n.dot(dirL), 0);
    acc.add(c.copy(lights.dir.color).multiplyScalar(dd * lights.dir.intensity));
    // Point (three.js distance attenuation with a cutoff)
    l.copy(point.position).sub(p);
    const d = l.length();
    l.divideScalar(d || 1);
    let fall = 1 / Math.max(Math.pow(d, point.decay), 0.01);
    const k = Math.min(Math.max(1 - Math.pow(d / point.distance, 4), 0), 1);
    fall *= k * k;
    acc.add(c.copy(point.color).multiplyScalar(Math.max(n.dot(l), 0) * point.intensity * fall));
    // Lambert BRDF (1/π), times the surface's diffuse share
    const s = diffuse / Math.PI;
    out[i * 3] = acc.r * s;
    out[i * 3 + 1] = acc.g * s;
    out[i * 3 + 2] = acc.b * s;
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(out, 3));
  return g;
}
