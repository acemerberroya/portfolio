import { useEffect, useState } from 'react';
import { useMediaQuery } from './useMediaQuery.js';

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

// Decides how much 3D the device gets.
// full: desktop/laptop. lite: phones, small screens, low-memory or data-saver devices.
export default function useEnv() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const small = useMediaQuery('(max-width: 760px)');
  const coarse = useMediaQuery('(pointer: coarse)');
  const [webgl] = useState(() => (typeof window === 'undefined' ? false : hasWebGL()));
  const [weak] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    const mem = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    return Boolean(navigator.connection?.saveData) || (mem && mem <= 4) || (cores && cores <= 4);
  });
  const tier = small || coarse || weak ? 'lite' : 'full';
  return { reduced, small, webgl, tier };
}

export function useRemembered(key, initial) {
  const [v, setV] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s == null ? initial : JSON.parse(s);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage off */ }
  }, [key, v]);
  return [v, setV];
}
