import { ALL } from '../sections.js';
import { setState, useStore } from '../store.js';

export default function Header({ section, go, mode, setMode, webgl }) {
  // Hovering a beacon on the globe lights its nav link, and the other way round.
  const glow = useStore((s) => s.hoverSection);
  return (
    <header className="site-header">
      <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); go('top'); }}>
        <span className="brand-mark" aria-hidden="true">AB</span>
        <span className="brand-name">Acemer Berroya</span>
      </a>
      <nav className="nav" aria-label="Sections">
        <ul>
          {ALL.map((s) => (
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
        </ul>
      </nav>
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
