export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  if (history.replaceState) history.replaceState(null, '', `#${id}`);
  // Move focus for keyboard and screen-reader users without a second scroll jump.
  const heading = el.querySelector('h2');
  if (heading) heading.focus({ preventScroll: true });
}
