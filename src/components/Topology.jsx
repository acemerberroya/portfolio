import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useFilm } from '../film.js';
import { profile } from '../data/profile.js';

/*
  The hero diagram: the visitor's request reaches Acemer (the central node),
  which routes to one service node per section. Selecting a node sends a
  packet down its wire, then scrolls to that section.
*/

const NODE_W = 128;
const NODE_H = 46;

// Desktop: radial layout around the central node.
function radialLayout(sections) {
  const cx = 300;
  const cy = 240;
  const angles = [-120, -60, 0, 60, 120, 180];
  const nodes = sections.map((s, i) => {
    const a = (angles[i] * Math.PI) / 180;
    const x = Math.round(cx + Math.cos(a) * 205);
    const y = Math.round(cy + Math.sin(a) * 150);
    return { ...s, x, y, d: `M${cx},${cy} L${x},${y}` };
  });
  return {
    viewBox: '0 0 600 460',
    center: { x: cx, y: cy },
    visitor: { labelRight: true, x: cx, y: 40, d: `M${cx},58 L${cx},${cy - 40}` },
    nodes,
  };
}

// Mobile: a vertical bus with branches, so labels stay large enough to read.
function busLayout(sections) {
  const cx = 180;
  const cy = 132;
  const cols = [92, 268];
  const rows = [262, 352, 442];
  const nodes = sections.map((s, i) => {
    const x = cols[i % 2];
    const y = rows[Math.floor(i / 2)];
    return { ...s, x, y, d: `M${cx},${cy} V${y} H${x}` };
  });
  return {
    viewBox: '0 0 360 490',
    center: { x: cx, y: cy },
    visitor: { x: 44, y: 40, d: `M44,40 C90,40 130,90 ${cx},${cy}` },
    nodes,
  };
}

export default function Topology({ sections }) {
  const compact = useMediaQuery('(max-width: 640px)');
  const reduce = useReducedMotion();
  const layout = compact ? busLayout(sections) : radialLayout(sections);
  const [packet, setPacket] = useState(null); // { id, key }
  const { goTo } = useFilm();

  const select = (e, id) => {
    e.preventDefault();
    if (reduce) {
      goTo(id);
      return;
    }
    setPacket({ id, key: Date.now() });
    window.setTimeout(() => goTo(id), 520);
  };

  const { center, visitor, nodes } = layout;
  const intro = reduce ? false : undefined;

  return (
    <figure className="card topology">
      <svg viewBox={layout.viewBox} className="topology-svg" role="group" aria-label="Site map drawn as a network. Each node links to a section.">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" className="grid-dot" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Visitor request wire */}
        <path d={visitor.d} className="wire wire-request" pathLength="1" />
        <motion.path
          d={visitor.d}
          className="packet"
          pathLength="1"
          strokeDasharray="0.1 2"
          initial={intro && { strokeDashoffset: 0.1 }}
          animate={{ strokeDashoffset: -1 }}
          transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.2 }}
        />

        {/* Section wires */}
        {nodes.map((n, i) => (
          <motion.path
            key={`w-${n.id}`}
            d={n.d}
            className="wire"
            pathLength="1"
            initial={intro && { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1.1 + i * 0.08, ease: 'easeOut' }}
          />
        ))}

        {/* Packet sent when a node is selected */}
        {packet && (
          <motion.path
            key={packet.key}
            d={nodes.find((n) => n.id === packet.id)?.d}
            className="packet packet-hot"
            pathLength="1"
            strokeDasharray="0.14 2"
            initial={{ strokeDashoffset: 0.14 }}
            animate={{ strokeDashoffset: -1 }}
            transition={{ duration: 0.5, ease: 'easeIn' }}
          />
        )}

        {/* Visitor */}
        <g className="node-visitor" transform={`translate(${visitor.x} ${visitor.y})`}>
          <circle r="18" />
          <path d="M0,-7 a5,5 0 1,1 0.01,0 M-9,10 a9,8 0 0,1 18,0" transform="translate(0 -1)" />
          <text x={visitor.labelRight ? 28 : 0} y={visitor.labelRight ? 5 : 36} textAnchor={visitor.labelRight ? 'start' : 'middle'}>You</text>
        </g>

        {/* Central node: Acemer */}
        <g transform={`translate(${center.x} ${center.y})`} className="node-center">
          <circle r="40" className="node-center-ring" />
          {profile.photo ? (
            <>
              <clipPath id="avatar-clip"><circle r="32" /></clipPath>
              <image href={profile.photo} x="-32" y="-32" width="64" height="64" clipPath="url(#avatar-clip)" preserveAspectRatio="xMidYMid slice" />
            </>
          ) : (
            <>
              <circle r="32" className="node-center-fill" />
              <text y="8" textAnchor="middle" className="node-center-text">AB</text>
            </>
          )}
        </g>

        {/* Section nodes */}
        {nodes.map((n, i) => (
          <motion.a
            key={n.id}
            href={`#${n.id}`}
            className={`node ${packet?.id === n.id ? 'is-hot' : ''}`}
            onClick={(e) => select(e, n.id)}
            initial={intro && { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.25 + i * 0.08 }}
            aria-label={`${n.label}: ${n.hint}`}
          >
            <g transform={`translate(${n.x - NODE_W / 2} ${n.y - NODE_H / 2})`}>
              <rect width={NODE_W} height={NODE_H} rx="10" className="node-box" />
              <circle cx="16" cy={NODE_H / 2} r="4" className="node-led" />
              <text x="30" y="20" className="node-label">{n.label}</text>
              <text x="30" y="35" className="node-hint">{n.hint}</text>
            </g>
          </motion.a>
        ))}
      </svg>
      <figcaption>Select a node to jump to that slide, or use the arrow keys.</figcaption>
    </figure>
  );
}
