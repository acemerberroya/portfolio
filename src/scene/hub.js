import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { getState, useStore } from '../store.js';
import { angleDelta, damp, faceAngles } from './geo.js';

// The motion every holographic hub shares (the globe in the main room, the
// Jarvis hologram in the Euthenics room):
//  - turns to face the open section's beacon on every navigation,
//  - runs the scan sweep (uniforms.uScan) on every navigation,
//  - spins slowly, pauses while a beacon or scene satellite is hovered,
//  - can be dragged, with a little inertia.
// Spread `bind` on the hub's grab mesh and put its body inside `spin`.
export function useHub({ sections, homePin, homeId, reduced, uniforms }) {
  const spin = useRef();
  const { invalidate } = useThree();
  const start = useMemo(() => faceAngles(homePin.lat, homePin.lng), [homePin]);
  const st = useRef({
    yaw: reduced ? start.yaw : start.yaw - 1.2,
    pitch: 0.18,
    tYaw: start.yaw,
    tPitch: 0.18,
    vel: 0,
    drag: false,
    moved: 0,
    x: 0,
    y: 0,
    scan: 1,
    reduced,
  });
  st.current.reduced = reduced;

  const section = useStore((s) => s.section);
  const pulse = useStore((s) => s.pulse);
  useEffect(() => {
    const target = section === homeId ? homePin : sections.find((s) => s.id === section) || homePin;
    const a = faceAngles(target.lat, target.lng);
    st.current.tYaw = a.yaw;
    st.current.tPitch = section === homeId ? 0.18 : a.pitch * 0.85;
    st.current.scan = 0;
    invalidate();
  }, [section, pulse, invalidate, sections, homePin, homeId]);

  // Drag anywhere on the hub to spin it, with a little inertia.
  useEffect(() => {
    const move = (e) => {
      const s = st.current;
      if (!s.drag) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      s.x = e.clientX; s.y = e.clientY;
      s.moved += Math.abs(dx) + Math.abs(dy);
      s.yaw += dx * 0.006;
      s.pitch = Math.max(-0.6, Math.min(0.6, s.pitch + dy * 0.004));
      s.vel = dx * 0.35;
      s.tYaw = null;
      invalidate();
    };
    const up = () => {
      if (!st.current.drag) return;
      st.current.drag = false;
      document.body.style.cursor = '';
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [invalidate]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = st.current;
    const g = getState();
    const frozen = g.pinHover || (g.hover && g.hoverFrom === 'scene');
    if (!s.drag && !frozen) {
      if (s.tYaw != null) {
        const k = reduced ? 1 : damp(2.4, dt);
        s.yaw += angleDelta(s.yaw, s.tYaw) * k;
        s.pitch += (s.tPitch - s.pitch) * k;
        if (Math.abs(angleDelta(s.yaw, s.tYaw)) < 0.003) s.tYaw = null; // face the section, then keep spinning
      } else {
        s.yaw += s.vel * dt * (reduced ? 0 : 1);
        s.vel *= Math.exp(-2.5 * dt);
        if (!reduced) s.yaw += 0.14 * dt; // always spinning; pauses while a pin is hovered or the hub is dragged
      }
    }
    if (spin.current) spin.current.rotation.set(s.pitch, s.yaw, 0);
    if (!reduced && s.scan < 1) {
      s.scan = Math.min(1, s.scan + dt / 1.1);
      uniforms.uScan.value = 1.9 - s.scan * 3.8;
    } else {
      uniforms.uScan.value = 9;
    }
  });

  const bind = {
    onPointerDown: (e) => {
      const s = st.current;
      s.drag = true; s.moved = 0; s.x = e.clientX; s.y = e.clientY; s.vel = 0;
      document.body.style.cursor = 'grabbing';
    },
    onPointerOver: () => { if (!st.current.drag && !getState().hoverSection) document.body.style.cursor = 'grab'; },
    onPointerOut: () => { if (!st.current.drag && !getState().hoverSection) document.body.style.cursor = ''; },
  };

  return { spin, st, bind };
}
