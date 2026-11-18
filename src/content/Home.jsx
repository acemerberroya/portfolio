import { profile, skillGroups, allProjects } from '../data/profile.js';

const skillCount = skillGroups.reduce((n, g) => n + g.items.length, 0);

// Same highlight cards as the original home slide.
const KPIS = [
  { label: 'Freelancing since', value: '2024', note: 'Websites, inventory systems and database apps', target: 'experience' },
  { label: 'Manual inventory errors', value: '−40%', note: 'Smart Inventory Management System', target: 'project', accent: true },
  { label: 'Skills across 3 areas', value: String(skillCount), note: 'Languages, frameworks, cloud and databases', target: 'skills' },
  { label: 'Projects', value: String(allProjects.length), note: 'Student lifecycle, inventory and restaurant systems', target: 'project' },
];

export default function Home({ go, headingRef, level = 1 }) {
  const H = `h${level}`;
  return (
    <section className="content-section home" aria-labelledby="hero-title">
      <H id="hero-title" className="hero-name" ref={headingRef} tabIndex={-1}>
        {profile.name}
      </H>
      <p className="hero-role">
        Web developer working toward a career in cloud and network engineering, with knowledge of the AWS platform.
      </p>
      <p className="hero-meta">Freelance web developer since 2024, based in {profile.location}.</p>
      <div className="hero-actions">
        <a className="button button-primary" href={profile.gmailCompose} target="_blank" rel="noopener noreferrer">
          Email me<span className="visually-hidden"> (opens Gmail in a new tab)</span>
        </a>
        <a className="button button-ghost" href="#project" onClick={(e) => { e.preventDefault(); go('project'); }}>
          See my projects
        </a>
      </div>
      <ul className="kpis" aria-label="Highlights">
        {KPIS.map((k) => (
          <li key={k.label}>
            <a
              href={`#${k.target}`}
              className={`kpi ${k.accent ? 'kpi-accent' : ''}`}
              onClick={(e) => { e.preventDefault(); go(k.target); }}
            >
              <span className="kpi-value">{k.value}</span>
              <span className="kpi-label">{k.label}</span>
              <span className="kpi-note">{k.note}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
