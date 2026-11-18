import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/*
  Slideshow of floating cards. The track slides so the current slide is
  centred, with a slight cinematic pull-back while it moves. Neighbouring
  slides peek in at the sides, dimmed. Off-screen slides are inert so
  keyboard and screen-reader users only meet the current one.
*/
export default function Filmstrip({ frames, index, goTo }) {
  const reduce = useReducedMotion();
  const [moving, setMoving] = useState(false);
  const first = useRef(true);
  const touch = useRef(null);
  const bodies = useRef([]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    bodies.current[index]?.scrollTo({ top: 0 });
    if (reduce) return undefined;
    setMoving(true);
    const t = window.setTimeout(() => setMoving(false), 760);
    return () => window.clearTimeout(t);
  }, [index, reduce]);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      className="slides-stage"
      role="region"
      aria-roledescription="carousel"
      aria-label="Portfolio slides"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={`track-scale ${moving ? 'is-moving' : ''}`}>
        <div className="track" style={{ '--i': index }}>
          {frames.map((f, i) => {
            const active = i === index;
            return (
              <div
                key={f.id}
                className={`slide ${active ? 'is-active' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${frames.length}: ${f.label}`}
                aria-hidden={active ? undefined : true}
              >
                <div className="slide-body" ref={(el) => (bodies.current[i] = el)} {...(active ? {} : { inert: '' })}>
                  {f.node}
                </div>
                {!active && <div className="slide-hit" onClick={() => goTo(i)} aria-hidden="true" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
