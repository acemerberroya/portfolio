import { useEffect, useRef } from 'react';
import { setState, useStore } from '../store.js';

// Wraps one piece of content that also exists as a satellite on the globe.
// Hover/focus here lights the satellite; picking the satellite scrolls here.
export default function Item({ id, as: Tag = 'li', className = '', children, ...rest }) {
  const ref = useRef(null);
  const focused = useStore((s) => s.focus === id);
  const hovered = useStore((s) => s.hover === id);

  useEffect(() => {
    if (!focused || !ref.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ref.current.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }, [focused]);

  const on = () => setState({ hover: id, hoverFrom: 'panel' });
  const off = () => setState((s) => (s.hover === id ? { hover: null } : {}));

  return (
    <Tag
      ref={ref}
      data-item={id}
      className={`${className} item ${focused ? 'is-focused' : ''} ${hovered ? 'is-hovered' : ''}`}
      onPointerEnter={on}
      onPointerLeave={off}
      onFocus={on}
      onBlur={off}
      {...rest}
    >
      {children}
    </Tag>
  );
}
