import { useEffect, useState } from 'react';

// Returns the id of the section currently occupying the middle of the viewport.
export function useActiveSection(ids) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
