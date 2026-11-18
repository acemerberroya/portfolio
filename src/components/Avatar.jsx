import { profile } from '../data/profile.js';

// Built-in monogram. Set `photo` in src/data/profile.js to show a real picture.
export default function Avatar({ size = 160 }) {
  if (profile.photo) {
    return (
      <img
        className="avatar"
        src={profile.photo}
        alt={`Portrait of ${profile.name}`}
        width={size}
        height={size}
        loading="lazy"
      />
    );
  }
  return (
    <svg className="avatar" width={size} height={size} viewBox="0 0 160 160" role="img" aria-label={`${profile.name} monogram`}>
      <rect width="160" height="160" rx="36" fill="var(--ink)" />
      <g fill="none" stroke="var(--wire)" strokeWidth="1" opacity="0.5">
        <path d="M0 40h160M0 80h160M0 120h160M40 0v160M80 0v160M120 0v160" />
      </g>
      <text x="80" y="98" textAnchor="middle" fontSize="56" fontWeight="700" fill="var(--bg)" fontFamily="inherit" letterSpacing="-2">
        AB
      </text>
      <circle cx="122" cy="40" r="7" fill="var(--highlight)" />
    </svg>
  );
}
