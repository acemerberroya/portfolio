import { experience, projectDetails, addedProjects } from '../data/profile.js';
import Item from './Item.jsx';
import Section from './Section.jsx';

// Freelance work listed in the collaborator repository's "Freelancing" row.
const freelance = [
  { name: 'Ball-lalo', ...projectDetails['Ball-lalo'] },
  addedProjects.find((p) => p.name === 'Sassy Strands'),
];

export default function Experience({ go, ...props }) {
  return (
    <Section id="experience" title="Experience" {...props}>
      <article className="card">
        <header className="log-head">
          <h3>{experience.title}</h3>
          <p className="period">{experience.period}</p>
        </header>
        <p className="eyebrow">Projects completed</p>
        <ul className="checks">
          {experience.items.map((t, i) => (
            <Item key={t} id={`exp-${i}`}>{t}</Item>
          ))}
        </ul>
        <p className="eyebrow">Freelance projects</p>
        <ul className="links-list">
          {freelance.map((f) => (
            <li key={f.name}>
              <a href="#project" onClick={(e) => { e.preventDefault(); go?.('project', `project-${f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`); }}>
                {f.title}
              </a>
              <span className="soft"> · {f.role} · {f.date}</span>
            </li>
          ))}
        </ul>
      </article>
    </Section>
  );
}
