import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Kpis from './components/Kpis.jsx';
import Project from './components/Project.jsx';
import Experience from './components/Experience.jsx';
import Skills from './components/Skills.jsx';
import About from './components/About.jsx';
import Education from './components/Education.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Filmstrip from './components/Filmstrip.jsx';
import Reel from './components/Reel.jsx';
import { FilmContext } from './film.js';

// Slide order puts the work first. These also become the nodes in the hero diagram.
export const SECTIONS = [
  { id: 'project', label: 'Projects', hint: '3 projects' },
  { id: 'experience', label: 'Experience', hint: '2024 – now' },
  { id: 'skills', label: 'Skills', hint: 'Stack map' },
  { id: 'about', label: 'About', hint: 'Summary' },
  { id: 'education', label: 'Education', hint: 'STI Alabang' },
  { id: 'contact', label: 'Contact', hint: 'Say hello' },
];

const SLIDE_IDS = ['top', ...SECTIONS.map((s) => s.id)];

function indexFromHash() {
  if (typeof window === 'undefined') return 0;
  const i = SLIDE_IDS.indexOf(window.location.hash.replace('#', ''));
  return i > 0 ? i : 0;
}

function setHash(i) {
  if (history.replaceState) {
    history.replaceState(null, '', i === 0 ? window.location.pathname : `#${SLIDE_IDS[i]}`);
  }
}

// The intro lives in index.html so it can paint before this script loads.
// It sets .intro-playing on <html> while it runs and fires 'intro-done' when it ends.
function introPlaying() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('intro-playing');
}

function isTyping(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export default function App() {
  const [playing, setPlaying] = useState(introPlaying);
  const [revealed, setRevealed] = useState(false);
  const [index, setIndex] = useState(indexFromHash);

  const goTo = useCallback((target) => {
    const i = typeof target === 'number' ? target : SLIDE_IDS.indexOf(target);
    if (i < 0 || i >= SLIDE_IDS.length) return;
    setIndex(i);
    setHash(i);
  }, []);

  // Keyboard: arrows, Page Up/Down, Home/End (ignored while typing in the form).
  useEffect(() => {
    if (playing) return undefined;
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return;
      const step = { ArrowRight: 1, PageDown: 1, ArrowLeft: -1, PageUp: -1 }[e.key];
      if (step) {
        e.preventDefault();
        setIndex((i) => {
          const next = Math.min(SLIDE_IDS.length - 1, Math.max(0, i + step));
          setHash(next);
          return next;
        });
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        goTo(e.key === 'Home' ? 0 : SLIDE_IDS.length - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing, goTo]);

  // Back/forward or an edited hash.
  useEffect(() => {
    const onHash = () => setIndex(indexFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const done = () => {
      setPlaying(false);
      setRevealed(true);
    };
    if (window.__introDone) done();
    window.addEventListener('intro-done', done);
    return () => window.removeEventListener('intro-done', done);
  }, [playing]);

  const frames = useMemo(
    () => [
      {
        id: 'top',
        label: 'Home',
        node: (
          <>
            <Hero sections={SECTIONS} />
            <Kpis />
          </>
        ),
      },
      { id: 'project', label: 'Projects', node: <Project /> },
      { id: 'experience', label: 'Experience', node: <Experience /> },
      { id: 'skills', label: 'Skills', node: <Skills /> },
      { id: 'about', label: 'About', node: <About /> },
      { id: 'education', label: 'Education', node: <Education /> },
      {
        id: 'contact',
        label: 'Contact',
        node: (
          <>
            <Contact />
            <Footer />
          </>
        ),
      },
    ],
    []
  );

  const film = useMemo(() => ({ index, frames, goTo }), [index, frames, goTo]);

  return (
    <FilmContext.Provider value={film}>
      {/* key remounts the page once the intro ends, so the hero diagram draws in on reveal */}
      <div
        className={`site ${revealed ? 'site-reveal' : ''}`}
        key={revealed ? 'after' : 'before'}
        aria-hidden={playing || undefined}
      >
        <a
          className="skip-link"
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector('.slide.is-active h1, .slide.is-active h2')?.focus();
          }}
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="site-main">
          <Filmstrip frames={frames} index={index} goTo={goTo} />
        </main>
        <Reel />
      </div>
    </FilmContext.Provider>
  );
}
