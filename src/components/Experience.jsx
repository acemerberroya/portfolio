import { experience } from '../data/profile.js';
import Section from './Section.jsx';

export default function Experience() {
  return (
    <Section id="experience" title="Experience">
      <article className="card log-card">
        <header className="log-head">
          <h3>{experience.title}</h3>
          <p className="log-period">{experience.period}</p>
        </header>
        <p className="log-sub">Projects completed</p>
        <ul className="deploy-list">
          {experience.items.map((item) => (
            <li key={item}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" className="ok-ring" />
                <path d="M7.5 12.5l3 3 6-6.5" className="ok-tick" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </article>
    </Section>
  );
}
