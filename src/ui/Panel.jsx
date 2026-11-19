import { useEffect, useLayoutEffect, useRef } from 'react';
import { CONTENT } from '../content/index.js';
import { ROOMS } from '../rooms.js';
import { setState } from '../store.js';

// The readable layer over the 3D scene. It reports the space it covers so the
// camera can keep the globe centred in the space that's left.
// Both rooms use this same panel: it reads the open room's sections and home.
export default function Panel({ section, room = 'main', go, switchRoom, focusHeading }) {
  const ref = useRef(null);
  const headingRef = useRef(null);
  const { all: ALL, homeId } = ROOMS[room];
  const atHome = section === homeId;
  const Content = CONTENT[section] || CONTENT[homeId];
  const i = ALL.findIndex((s) => s.id === section);
  const prev = ALL[i - 1];
  const next = ALL[i + 1];
  // At the ends of a sequence, the step links transform the hologram.
  const toRoom = (to) => (e) => { e.preventDefault(); switchRoom(to, undefined, { fromKeyboard: true }); };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const w = window.innerWidth;
      const h = window.innerHeight;
      const bottomSheet = r.width > w * 0.8;
      setState({
        inset: bottomSheet
          ? { x: 0, y: Math.min(r.height, h * 0.62) }
          : { x: r.left > w / 2 ? r.width + 24 : -(r.width + 24), y: 0 },
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [section]);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
    if (focusHeading.current) {
      headingRef.current?.focus({ preventScroll: true });
      focusHeading.current = false;
    }
  }, [section, focusHeading]);

  return (
    <div ref={ref} className={`panel ${atHome ? 'panel-home' : 'panel-section'}`} id="main">
      {!atHome && (
        <button type="button" className="panel-close" onClick={() => go(homeId)} aria-label="Close and return home">
          <span aria-hidden="true">×</span>
        </button>
      )}
      <div className="panel-body" key={section}>
        <Content go={go} headingRef={headingRef} level={atHome ? 1 : 2} />
      </div>
      <nav className="panel-steps" aria-label="Previous and next section">
        {prev ? (
          <a href={`#${prev.id}`} onClick={(e) => { e.preventDefault(); go(prev.id); }}>← {prev.label}</a>
        ) : room !== 'main' ? (
          <a href="#top" onClick={toRoom('main')}>← Portfolio</a>
        ) : <span />}
        {next ? (
          <a href={`#${next.id}`} onClick={(e) => { e.preventDefault(); go(next.id); }}>{next.label} →</a>
        ) : room === 'main' && (
          <a href={`#${ROOMS.euthenics.homeId}`} onClick={toRoom('euthenics')}>Euthenics →</a>
        )}
      </nav>
    </div>
  );
}
