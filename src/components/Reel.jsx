import { useFilm } from '../film.js';

// Bottom control bar: previous / slide list / next.
export default function Reel() {
  const { index, frames, goTo } = useFilm();
  const current = frames[index];
  return (
    <nav className="reel" aria-label="Slides">
      <button type="button" className="icon-button reel-arrow" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous slide">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <ol className="reel-list">
        {frames.map((f, i) => (
          <li key={f.id}>
            <button type="button" className="reel-item" onClick={() => goTo(i)} aria-current={i === index ? 'step' : undefined}>
              {f.label}
            </button>
          </li>
        ))}
      </ol>

      <p className="reel-count" aria-live="polite">
        <span className="reel-count-num">{index + 1} / {frames.length}</span> {current.label}
      </p>

      <button
        type="button"
        className="icon-button reel-arrow"
        onClick={() => goTo(index + 1)}
        disabled={index === frames.length - 1}
        aria-label="Next slide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}
