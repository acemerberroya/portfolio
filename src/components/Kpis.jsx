import { skillGroups, otherProjects } from '../data/profile.js';
import { useFilm } from '../film.js';

const skillCount = skillGroups.reduce((n, g) => n + g.items.length, 0);
const projectCount = 1 + otherProjects.length; // inventory system + the rest

const KPIS = [
  { label: 'Freelancing since', value: '2024', note: 'Websites, inventory systems and database apps', target: 'experience' },
  { label: 'Manual inventory errors', value: '−40%', note: 'Smart Inventory Management System', target: 'project', accent: true },
  { label: 'Skills across 3 areas', value: String(skillCount), note: 'Languages, frameworks, cloud and databases', target: 'skills' },
  { label: 'Projects', value: String(projectCount), note: 'Inventory, restaurant and student lifecycle systems', target: 'project' },
];

export default function Kpis() {
  const { goTo } = useFilm();
  return (
    <section className="kpis" aria-label="Highlights">
      {KPIS.map((k) => (
        <a
          key={k.label}
          href={`#${k.target}`}
          className={`card kpi ${k.accent ? 'kpi-accent' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            goTo(k.target);
          }}
        >
          <span className="kpi-label">{k.label}</span>
          <span className="kpi-value">{k.value}</span>
          <span className="kpi-note">{k.note}</span>
        </a>
      ))}
    </section>
  );
}
