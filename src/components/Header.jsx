import { useFilm } from '../film.js';
import ThemeToggle from './ThemeToggle.jsx';

export default function Header() {
  const { goTo } = useFilm();
  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          className="brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            goTo(0);
          }}
        >
          <span className="brand-mark" aria-hidden="true">AB</span>
          Acemer Berroya
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
