import { education, certificates } from '../data/profile.js';
import Section from './Section.jsx';

export default function Education() {
  return (
    <Section id="education" title="Education">
      <div className="edu-grid">
        <article className="card log-card edu-card">
          <svg className="edu-icon" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
            <path d="M4 15 L20 7 L36 15 L20 23 Z" />
            <path d="M10 18.5 V26 C14 30 26 30 30 26 V18.5" />
            <path d="M36 15 V24" />
          </svg>
          <div>
            <h3>{education.degree}</h3>
            <p className="edu-school">{education.school}</p>
            <p className="log-period">{education.period}</p>
          </div>
        </article>

        <article className="card certs-card">
          <h3>Certificates and seminars</h3>
          <ul className="certs">
            {certificates.map((c) => (
              <li key={c.title}>
                <span className="cert-year">{c.year}</span>
                <span className="cert-title">{c.title}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </Section>
  );
}
