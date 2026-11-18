import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/*
  Cinematic opening: wires rush in from the edges and meet at the AB node,
  the name resolves under a light sweep, then the camera pushes through the
  node into the site. About 3.6 s. Any key, click or the Skip button ends it.
*/

const DURATION_MS = 3600;
const W = 1600;
const H = 900;
const CX = W / 2;
const CY = H / 2 - 40;

function makeWires(count) {
  // Deterministic spread of start points around the frame edge.
  const wires = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / count;
    const angle = t * Math.PI * 2 + 0.35;
    const r = 1100;
    const sx = CX + Math.cos(angle) * r;
    const sy = CY + Math.sin(angle) * r * 0.62;
    // Route each wire with one right-angle bend, like a network diagram.
    const bendX = CX + Math.cos(angle) * (180 + (i % 3) * 70);
    const d = `M${sx.toFixed(0)},${sy.toFixed(0)} L${bendX.toFixed(0)},${sy.toFixed(0)} L${bendX.toFixed(0)},${CY} L${CX},${CY}`;
    wires.push({ d, delay: 0.05 + (i % 6) * 0.07, amber: i % 4 === 0 });
  }
  return wires;
}

export default function Intro({ onDone }) {
  const [visible, setVisible] = useState(true);
  const finished = useRef(false);
  const wires = useMemo(() => makeWires(16), []);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setVisible(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(finish, DURATION_MS);
    const onKey = () => finish();
    window.addEventListener('keydown', onKey);
    document.documentElement.classList.add('intro-lock');
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('intro-lock');
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          className="intro"
          onClick={finish}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeIn' } }}
        >
          <motion.div
            className="intro-stage"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1, 1.06, 9] }}
            transition={{ duration: DURATION_MS / 1000, times: [0, 0.72, 0.86, 1], ease: 'easeIn' }}
          >
            <svg className="intro-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs>
                <radialGradient id="intro-glow">
                  <stop offset="0%" stopColor="#f2b85c" stopOpacity="0.55" />
                  <stop offset="60%" stopColor="#7c9bff" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#7c9bff" stopOpacity="0" />
                </radialGradient>
                <pattern id="intro-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1.1" fill="#25282d" />
                </pattern>
              </defs>
              <rect width={W} height={H} fill="url(#intro-grid)" />

              {wires.map((w, i) => (
                <g key={i}>
                  <motion.path
                    d={w.d}
                    className="intro-wire"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.85, delay: w.delay, ease: [0.6, 0, 0.3, 1] }}
                  />
                  <motion.path
                    d={w.d}
                    className={w.amber ? 'intro-packet intro-packet-amber' : 'intro-packet'}
                    pathLength="1"
                    strokeDasharray="0.08 2"
                    initial={{ strokeDashoffset: 0.08 }}
                    animate={{ strokeDashoffset: -1 }}
                    transition={{ duration: 0.9, delay: w.delay + 0.25, ease: 'easeIn' }}
                  />
                </g>
              ))}

              {/* Node lights up when the packets arrive */}
              <motion.circle
                cx={CX}
                cy={CY}
                r="260"
                fill="url(#intro-glow)"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0.75], scale: [0.4, 1.1, 1] }}
                transition={{ duration: 0.9, delay: 1.1, ease: 'easeOut' }}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
              />
              <motion.g
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, delay: 1.15, ease: [0.2, 1.4, 0.4, 1] }}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
              >
                <circle cx={CX} cy={CY} r="92" className="intro-ring" />
                <circle cx={CX} cy={CY} r="74" className="intro-core" />
                <text x={CX} y={CY + 19} textAnchor="middle" className="intro-mono">AB</text>
              </motion.g>
            </svg>

            <motion.p
              className="intro-name"
              initial={{ opacity: 0, letterSpacing: '0.5em', y: 10 }}
              animate={{ opacity: 1, letterSpacing: '-0.02em', y: 0 }}
              transition={{ duration: 1.0, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="intro-name-text">Acemer Berroya</span>
            </motion.p>
            <motion.p
              className="intro-tag"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.1 }}
            >
              Web developer, aspiring cloud engineer
            </motion.p>
          </motion.div>

          <button
            type="button"
            className="intro-skip"
            onClick={(e) => {
              e.stopPropagation();
              finish();
            }}
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
