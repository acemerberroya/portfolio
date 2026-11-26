import { ROOMS } from '../rooms.js';
import { setState, useStore } from '../store.js';

export default function Header({ section, go, mode, setMode, webgl, room = 'main', use3D = false, switchRoom }) {
  // Hovering a beacon on the globe lights its nav link, and the other way round.
  const glow = useStore((s) => s.hoverSection);
  const sections = ROOMS[room].all;
  const inEuthenics = room === 'euthenics';
  const toggleRoom = () => {
    if (!use3D) { go(ROOMS.euthenics.homeId); return; }
    switchRoom(inEuthenics ? 'main' : 'euthenics', undefined, { fromKeyboard: true });
  };
  const roomLabel = inEuthenics ? '← Portfolio' : 'HTE Evaluation';
  return (
    <header className="site-header">
      <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); go('top'); }}>
        <span className="brand-mark" aria-hidden="true">AB</span>
        <span className="brand-name">Acemer Berroya</span>
      </a>
      <nav className="nav" aria-label={inEuthenics ? 'HTE Evaluation sections' : 'Sections'}>
        <ul>
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={section === s.id ? 'page' : undefined}
                className={glow === s.id ? 'is-glow' : undefined}
                onPointerEnter={() => setState({ hoverSection: s.id })}
                onPointerLeave={() => setState({ hoverSection: null })}
                onClick={(e) => { e.preventDefault(); go(s.id); }}
              >
                {s.label}
              </a>
            </li>
          ))}
          {/* On small screens the room switch rides in the nav row instead of the header row. */}
          <li className="nav-room">
            <button type="button" onClick={toggleRoom}>{roomLabel}</button>
          </li>
        </ul>
      </nav>
      {/* The keyboard path to the transformation (the core's button is the mouse/touch shortcut). */}
      <button
        type="button"
        className="view-toggle room-toggle"
        onClick={toggleRoom}
      >
        {roomLabel}
      </button>
      {webgl && (
        <button
          type="button"
          className="view-toggle"
          aria-pressed={mode === 'page'}
          onClick={() => setMode(mode === '3d' ? 'page' : '3d')}
        >
          {mode === '3d' ? 'Page view' : '3D view'}
        </button>
      )}
    </header>
  );
}
