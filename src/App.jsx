import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import Header from './ui/Header.jsx';
import Panel from './ui/Panel.jsx';
import PageView from './ui/PageView.jsx';
import useEnv, { useRemembered } from './hooks/useEnv.js';
import { ALL } from './sections.js';
import { getState, setState, useStore } from './store.js';

// three.js and the scene load in their own chunk, after the content has painted.
const Scene = lazy(() => import('./scene/Scene.jsx'));

const IDS = ALL.map((s) => s.id);
const fromHash = () => {
  const h = window.location.hash.replace('#', '');
  return IDS.includes(h) ? h : 'top';
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
  const focusHeading = useRef(false);
  const [sceneReady, setSceneReady] = useState(false);

  // Navigate to a section (and optionally select one item in it).
  const go = useCallback(
    (id, focus = null, { fromKeyboard = true } = {}) => {
      if (!IDS.includes(id)) return;
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
    [use3D]
  );

  // Every visit opens on Home (an old #section link is cleared), then
  // back/forward and edited hashes still work.
  useEffect(() => {
    setState({ section: 'top' });
    if (window.location.hash) history.replaceState(null, '', window.location.pathname);
    window.scrollTo(0, 0);
    const onHash = () => setState((s) => ({ section: fromHash(), pulse: s.pulse + 1 }));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // When switching to page view, land on the section that was open.
  useEffect(() => {
    if (use3D) return;
    const id = getState().section;
    if (id !== 'top') requestAnimationFrame(() => document.getElementById(`sec-${id}`)?.scrollIntoView());
  }, [use3D]);

  // Keyboard: ← → move between sections, Esc goes home (3D view only).
  useEffect(() => {
    if (!use3D) return undefined;
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return;
      const i = IDS.indexOf(getState().section);
      if (e.key === 'ArrowRight' && i < IDS.length - 1) { e.preventDefault(); go(IDS[i + 1]); }
      else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); go(IDS[i - 1]); }
      else if (e.key === 'Escape' && i > 0) { e.preventDefault(); go('top'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [use3D, go]);

  return (
    <div className={`app ${use3D ? 'is-3d' : 'is-page'} ${sceneReady ? 'scene-ready' : ''}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header section={section} go={go} mode={mode} setMode={setMode} webgl={env.webgl} />
      {use3D ? (
        <>
          <div className="stage" aria-hidden="true">
            <div className="stage-fallback" />
            <Suspense fallback={null}>
              <Scene env={env} go={go} onReady={() => setSceneReady(true)} />
            </Suspense>
          </div>
          <p className="visually-hidden">
            The background is an interactive holographic globe. Every section is also available from the
            navigation above and the panel below.
          </p>
          <Panel section={section} go={go} focusHeading={focusHeading} />
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
