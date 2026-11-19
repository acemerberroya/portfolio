import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import Header from './ui/Header.jsx';
import Panel from './ui/Panel.jsx';
import PageView from './ui/PageView.jsx';
import Morph from './ui/Morph.jsx';
import { MORPH } from './morph.js';
import Intro from './ui/Intro.jsx';
import useEnv, { useRemembered } from './hooks/useEnv.js';
import { ALL_IDS, ROOMS, roomOf } from './rooms.js';
import { getState, setState, useStore } from './store.js';

// three.js and the scene load in their own chunk, after the content has painted.
const Scene = lazy(() => import('./scene/Scene.jsx'));


const fromHash = () => {
  const h = window.location.hash.replace('#', '');
  return ALL_IDS.includes(h) ? h : 'top';
};

function isTyping(el) {
  const t = el?.tagName;
  return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || el?.isContentEditable;
}

export default function App() {
  const env = useEnv();
  const [mode, setMode] = useRemembered('view-mode', '3d');
  const use3D = env.webgl && mode === '3d';
  const section = useStore((s) => s.section);
  const room = useStore((s) => s.room);
  const morphPhase = useStore((s) => s.morph?.phase || null);
  const focusHeading = useRef(false);
  const [sceneReady, setSceneReady] = useState(false);
  // The intro plays once per page load in the 3D view (not with reduced motion).
  const [showIntro, setShowIntro] = useState(() => use3D && !env.reduced);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Transform the hologram into the other one (portfolio globe ⇄ Euthenics
  // core), landing on `target` (its home by default). The current hologram
  // accelerates, compresses, explodes and scatters; the particles change colour
  // and gather into the new one (see morph.js and ui/Morph.jsx). Sections,
  // hub, lighting and panel switch only when the new hologram settles.
  const switchRoom = useCallback(
    (to, target = ROOMS[to]?.homeId, { fromKeyboard = false } = {}) => {
      const s = getState();
      if (!ROOMS[to] || s.morph) return;
      const arrive = () => {
        focusHeading.current = fromKeyboard;
        setState((st) => ({
          room: to, section: target, focus: null, hover: null, hoverSection: null, pinHover: null,
          pulse: st.pulse + 1,
        }));
        history.replaceState(null, '', target === 'top' ? window.location.pathname : `#${target}`);
      };
      document.body.style.cursor = '';
      if (env.reduced || s.room === to) { arrive(); return; }
      const start = performance.now();
      setState({ morph: { to, from: s.room, phase: 'accel', start }, hover: null, hoverSection: null, pinHover: null });
      const at = (ms, fn) => timers.current.push(setTimeout(fn, ms));
      at(MORPH.accel, () => setState((st) => ({ morph: { ...st.morph, phase: 'burst', burstStart: performance.now() } })));
      // The setting switches only once the new hologram settles: the swap and
      // the reveal happen together, in one render.
      at(MORPH.accel + MORPH.burst, () => {
        arrive();
        setState((st) => ({ morph: { ...st.morph, phase: 'reveal', revealStart: performance.now() } }));
      });
      at(MORPH.accel + MORPH.burst + MORPH.reveal, () => setState({ morph: null }));
    },
    [env.reduced]
  );

  // Navigate to a section (and optionally select one item in it). A section in
  // the other room goes through the door first.
  const go = useCallback(
    (id, focus = null, { fromKeyboard = true } = {}) => {
      if (!ALL_IDS.includes(id) || getState().morph) return;
      if (use3D && roomOf(id) !== getState().room) {
        switchRoom(roomOf(id), id, { fromKeyboard });
        return;
      }
      focusHeading.current = fromKeyboard;
      setState((s) => ({ section: id, focus, hover: null, pulse: s.pulse + 1 }));
      history.replaceState(null, '', id === 'top' ? window.location.pathname : `#${id}`);
      if (!use3D) {
        const el = id === 'top' ? document.getElementById('top') : document.getElementById(`sec-${id}`);
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        el?.querySelector('h1, h2')?.focus({ preventScroll: true });
      }
    },
    [use3D, switchRoom]
  );

  // Every visit opens on Home in the main room (an old #section link is
  // cleared), then back/forward and edited hashes still work.
  const latest = useRef({ use3D, switchRoom });
  latest.current = { use3D, switchRoom };
  useEffect(() => {
    setState({ section: 'top', room: 'main' });
    if (window.location.hash) history.replaceState(null, '', window.location.pathname);
    window.scrollTo(0, 0);
    const onHash = () => {
      const id = fromHash();
      const to = roomOf(id);
      if (latest.current.use3D && to !== getState().room) latest.current.switchRoom(to, id);
      else setState((s) => ({ section: id, pulse: s.pulse + 1 }));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // When switching to page view, land on the section that was open. When
  // switching back to 3D, open the room that section lives in.
  useEffect(() => {
    const id = getState().section;
    if (use3D) {
      const to = roomOf(id);
      if (to && to !== getState().room) setState({ room: to });
      return;
    }
    if (id !== 'top') requestAnimationFrame(() => document.getElementById(`sec-${id}`)?.scrollIntoView());
  }, [use3D]);

  // Keyboard: ← → move between the room's sections, Esc goes to the room's
  // home, and from the Euthenics overview Esc goes back to the main room.
  useEffect(() => {
    if (!use3D) return undefined;
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return;
      const s = getState();
      if (s.morph || s.intro) return;
      const r = ROOMS[s.room];
      const ids = r.all.map((x) => x.id);
      const i = ids.indexOf(s.section);
      if (e.key === 'ArrowRight' && i < ids.length - 1) { e.preventDefault(); go(ids[i + 1]); }
      else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); go(ids[i - 1]); }
      else if (e.key === 'Escape' && i > 0) { e.preventDefault(); go(r.homeId); }
      else if (e.key === 'Escape' && s.room !== 'main') { e.preventDefault(); switchRoom('main', undefined, { fromKeyboard: true }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [use3D, go, switchRoom]);

  return (
    <div className={`app ${use3D ? 'is-3d' : 'is-page'} ${sceneReady ? 'scene-ready' : ''} ${use3D ? `room-${room}` : ''} ${morphPhase ? `morph-${morphPhase}` : ''}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header
        section={section}
        go={go}
        mode={mode}
        setMode={setMode}
        webgl={env.webgl}
        room={use3D ? room : 'main'}
        use3D={use3D}
        switchRoom={switchRoom}
      />
      {use3D ? (
        <>
          <div className="stage" aria-hidden="true">
            <div className="stage-fallback" />
            <Suspense fallback={null}>
              <Scene env={env} go={go} switchRoom={switchRoom} onReady={() => setSceneReady(true)} />
            </Suspense>
          </div>
          <p className="visually-hidden">
            {room === 'euthenics'
              ? 'The background is an interactive holographic projection of my HTE evaluation. Every part is also available from the navigation above and the panel below.'
              : 'The background is an interactive holographic globe. Every section is also available from the navigation above and the panel below.'}
          </p>
          <Panel section={section} room={room} go={go} switchRoom={switchRoom} focusHeading={focusHeading} />
          <Morph lite={env.tier === 'lite'} />
          {showIntro && <Intro sceneReady={sceneReady} onDone={() => setShowIntro(false)} />}
        </>
      ) : (
        <PageView
          go={go}
          note={env.webgl ? null : 'Your browser can’t show the 3D version, so here is the full portfolio as a page.'}
        />
      )}
    </div>
  );
}
