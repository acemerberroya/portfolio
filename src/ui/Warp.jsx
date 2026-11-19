import { useStore } from '../store.js';

// The light that fills the screen while walking through a door. It takes the
// colour of the room ahead (gold toward Euthenics, cyan toward the main room)
// and blocks clicks until the new room has arrived.
export default function Warp() {
  const warp = useStore((s) => s.warp);
  const to = useStore((s) => s.warpTo);
  return (
    <div
      className={`warp ${warp ? `is-${warp}` : ''} warp-to-${to || 'main'}`}
      aria-hidden="true"
    >
      <div className="warp-iris" />
      <div className="warp-lines" />
    </div>
  );
}
