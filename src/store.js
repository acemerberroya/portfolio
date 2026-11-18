import { useSyncExternalStore } from 'react';

// Tiny shared store so the DOM panels and the 3D scene stay in sync.
// (The scene's HTML labels render in their own React root, so React context
// would not reach them; a module-level store does.)
const listeners = new Set();
let state = {
  section: 'top', // which section is open
  focus: null, // item id that's selected (panel <-> globe satellite)
  hover: null, // item id under the pointer
  hoverSection: null, // beacon under the pointer
  inset: { x: 0, y: 0 }, // px the panel covers, so the camera can recentre the globe
  pulse: 0, // bumps on every navigation; drives the globe's scan sweep
};

export const getState = () => state;
export function setState(patch) {
  const next = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}
export function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function useStore(selector) {
  return useSyncExternalStore(subscribe, () => selector(state));
}
