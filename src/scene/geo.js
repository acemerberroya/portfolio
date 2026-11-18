import { Vector3 } from 'three';

const D = Math.PI / 180;
export const GLOBE_R = 1.5;
export const GLOBE_Y = 0.35;
export const CYAN = '#5fd8ff';
export const AMBER = '#ffbf5a';

export function latLngToVec3(lat, lng, r = 1, out = new Vector3()) {
  const phi = (90 - lat) * D;
  const th = (lng + 180) * D;
  return out.set(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}

// Globe rotation (yaw then pitch) that brings lat/lng to the front, facing the camera.
export function faceAngles(lat, lng) {
  const v = latLngToVec3(lat, lng, 1);
  const yaw = Math.atan2(-v.x, v.z);
  const pitch = Math.atan2(v.y, Math.hypot(v.x, v.z));
  return { yaw, pitch: Math.max(-0.5, Math.min(0.5, pitch)) };
}

// Shortest signed difference between two angles.
export const angleDelta = (from, to) => {
  const d = (to - from) % (Math.PI * 2);
  return d > Math.PI ? d - Math.PI * 2 : d < -Math.PI ? d + Math.PI * 2 : d;
};

// Frame-rate independent damping.
export const damp = (k, dt) => 1 - Math.exp(-k * dt);
