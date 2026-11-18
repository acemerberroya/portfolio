import { useTheme } from '../hooks/useTheme.js';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={toggle}
      aria-pressed={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        {dark ? (
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="currentColor" />
        ) : (
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
            <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
            <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
          </g>
        )}
      </svg>
    </button>
  );
}
